import React from 'react';
import { GameValue } from './DisplayedItem';
import Moment, {MomentProps} from 'react-moment';
import { toggleInputDisabled, toggleMsgLoader, addResponseMessage, addUserMessage, Widget, dropMessages } from '../chat/index.js';
import ReactInfoBox from './ReactInfoBox';
import RiveScript from './rivescript.js';
import GameTools from './GameTools';

export interface DialogueAction {
    character: GameValue<"you" | "them">;
    statements: GameValue<string>|GameValue<string>[];
}

export class JumpingDots extends React.Component<{ ref: React.Ref<JumpingDots> }> {
    render() {
        return <div className="rcw-response">
            <div className="rcw-message-text">
                <div className="jumping-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
        </div>;
    }
}
export class MomentWrapper extends React.Component<MomentProps, { date: string|number|Array<string|number|object>|object}> {
    constructor(props) {
        super(props);
        this.state = { date: props.date };
    }
    render() {
        const { date, ...rest } = this.props;
        return <Moment date={this.state.date} {...rest}/>;
    }
}
interface RequiredString extends String {
    required: (true|undefined);
}
export class DialogueWidgetWrapper extends React.Component<any, { showCloseButton: boolean; }> {
    constructor(props) {
        super(props);
        this.state = { showCloseButton: props.showCloseButton };
    }
    render() {
        const { showCloseButton, ...rest} = this.props;
        return <Widget showCloseButton={this.state.showCloseButton} {...rest}/>;
    }
}
export enum MessageSender {
    Player,
    Character
}
export interface UserFunctionTable {
    [funcName: string]: () => void;
}
export class DialogueExperience extends ReactInfoBox {
    protected currentStatement;
    protected lastSeenTime: Date;
    protected momentRef: React.RefObject<MomentWrapper>;
    protected mustAskAll: boolean;
    protected asked: Set<string>;
    protected allMessages: string[];
    protected widgetRef: React.RefObject<DialogueWidgetWrapper>;
    public endDialogueWhenMessageFinishes: boolean;
    public static doReenableInput: boolean = false;
    public static readonly builtinMessages = [
    ];
    protected bot: RiveScript;
    async endDialogue() {
        await this.reset();
        this.displayNext();
    }
    public async sendMessage(reply: string, sender: MessageSender = MessageSender.Character) {
        await new Promise(async(resolve) => {
            let replies = reply.split('\n');
            for(let index = 0; index < replies.length; index++) {
                if(replies[index].trim().length == 0)
                    continue;
                if(sender == MessageSender.Character)
                    toggleMsgLoader();

                if(!GameTools.SPEED_HACK) {
                    if(sender == MessageSender.Character)
                        await GameTools.sleep(replies[index].length*100);
                    else
                        await GameTools.sleep(1000);
                }
                if(sender == MessageSender.Character) {
                    toggleMsgLoader();
                    addResponseMessage(replies[index]);
                } else
                    addUserMessage(replies[index]);
                if(!GameTools.SPEED_HACK) {
                    await GameTools.sleep(500);
                }
            }
            resolve();
        });
    }
    public showCloseButton() {
        this.widgetRef.current.setState({ showCloseButton: true });
    }
    async handleNewUserMessage(newMessage) {
        toggleInputDisabled();
        await GameTools.sleep(1000);
        console.log("Message converted to: " + newMessage);
        this.lastSeenTime = new Date();
        if(this.momentRef.current != null && this.momentRef.current != undefined)
            this.momentRef.current.setState({ date: this.lastSeenTime});
        let reply = await this.bot.reply("local-user", newMessage, this);
        // Now send the message throught the backend API
        await this.sendMessage(reply);
        
        this.asked.add(newMessage);
        let requiredQuestions = this.allowedMessages;
        let notDone = requiredQuestions.some((msg) => {
            console.log("Have we asked " + msg);
            return !this.asked.has(msg);
        });
        toggleInputDisabled();
        if(!notDone) {
            this.showCloseButton();
            if(this.allMessages.length == this.asked.size || this.endDialogueWhenMessageFinishes) {
                toggleInputDisabled();
                DialogueExperience.doReenableInput = true;
            }
        }
        
        
    }
    objectHelp(): string {
        return super.objectHelp() + "Chat with one of the characters in the game!<p></p>If you can't choose a message, the conversation may have ended (check for a close button in the top right of the chat widget).<hr/>";
    }
    constructor(protected riveFile: string, title?: string, avatar?: string, protected allowedMessages?: string[],
        protected messageFeeder?: (controller: DialogueExperience) => void, protected userFuncs: UserFunctionTable = {}) {
        super(null);
        this.lastSeenTime = new Date();
        this.mustAskAll = allowedMessages != undefined;
        const dateFilter = (d) => {
            return "Active " + d;
        };
        this.momentRef = React.createRef<MomentWrapper>();
        this.widgetRef = React.createRef<DialogueWidgetWrapper>();
        this.allMessages = DialogueExperience.builtinMessages.concat(allowedMessages);
        this.addContentClass = false;
        this.jsxElement = <DialogueWidgetWrapper ref={this.widgetRef} fullScreenMode={false}
                                  showCloseButton={allowedMessages == undefined}
                                  title={title}
                                  titleAvatar={avatar}
                                  profileAvatar={avatar}
                                  onCloseClick={this.endDialogue.bind(this)}
                                  subtitle={""} /* <MomentWrapper ref={this.momentRef} filter={dateFilter} fromNow date={this.lastSeenTime}/> */
                                  possibleMessages={this.allMessages}
                                  inputType={allowedMessages == undefined ? "text" : "dropdown"}
                                  handleNewUserMessage={this.handleNewUserMessage.bind(this)}/>;
    }
    async dialogCreated() {
        await super.dialogCreated();
        this.lastSeenTime = new Date();
        if(DialogueExperience.doReenableInput) {
            toggleInputDisabled();
            DialogueExperience.doReenableInput = false;
        }
        if(this.messageFeeder != undefined)
            this.messageFeeder(this);
    }
    async dialogDisplayed() {
        await super.dialogDisplayed();
    }
    async reset() {
        this.endDialogueWhenMessageFinishes = false;
        
        console.log("Dropping messages");
        dropMessages();
        this.currentStatement = 0;
        this.asked = new Set<string>();
        this.lastSeenTime = new Date();
        this.bot = new RiveScript({
            concat: "newline"
        });
        if(this.riveFile != null && this.riveFile != undefined) {
            await this.bot.loadFile([
                this.riveFile,
                require('./components/chat/builtin.rive')
            ]);
        }

        console.log("Sorting!");
        this.bot.sortReplies();
        await super.reset();
    }
}

/* (window as any).gt_imagePaths = Object.assign({}, require('./external/images/*.png'), require('./external/images/*.jpg'), require('./external/images/*.svg')); */

export default DialogueExperience;
export { toggleInputDisabled, toggleMsgLoader, addResponseMessage, addUserMessage, dropMessages };