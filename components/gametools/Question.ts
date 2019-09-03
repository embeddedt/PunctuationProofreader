import DisplayedItem, { GameValue, StylisticOptions } from './DisplayedItem';
import InfoBox from './InfoBox';
import GameTools from './GameTools';

import '@fortawesome/fontawesome-free/css/all.css';

export interface QuestionOption {
    html: GameValue<string>;
    correct?: boolean;
    fn?: () => any;
}
export enum QuestionType {
    MultipleChoice,
    FillInTheBlank,
    Custom
}
export class Question extends InfoBox {
    readonly isQuestion: boolean;
    constructor(protected type: QuestionType, question: GameValue<string>, protected choices: QuestionOption[], protected shouldReDisplay = true, style?: StylisticOptions, protected instructions: GameValue<string> = "") {
        super(question, "", Question.needsOKButton(type) ? "OK" : null, InfoBox.defaultDelay, style);
        if(this.type == QuestionType.Custom)
            this.isQuestion = true;
        else
            this.isQuestion = choices.some((choice: QuestionOption) => {
                return GameTools.pl_undef(choice.correct, false);
            });
    }
    public static needsOKButton(type: QuestionType): boolean {
        return (type == QuestionType.FillInTheBlank);
    }
    objectHelp(): string {
        if(this.type == QuestionType.FillInTheBlank)
            return super.objectHelp() + "Fill in the text box (or change the information in it) according to the instructions given in the question.";
        else
            return super.objectHelp();
    }
    getDefaultStyle() {
        return { shouldShuffle: true };
    }
    buttonCallback(e: JQuery.ClickEvent) {
        if(this.type == QuestionType.FillInTheBlank) {
            $(e.target).prop("disabled", true);
            this.answered(this.$dialog.find(".modal-body").find("textarea"));
        }
    }
    isCorrect($button: JQuery<HTMLElement>, option: QuestionOption): boolean {
        if(this.type == QuestionType.MultipleChoice)
            return option.correct;
        else if(this.type == QuestionType.FillInTheBlank) {
            let text = $button.val() as string;
            let answer = DisplayedItem.getValue(null, option.html);
            if(this.objStyle.stripPunctuation) {
                text = GameTools.stripPunctuation(text);
                answer = GameTools.stripPunctuation(answer);
            }
            return text == answer;
        } else {
            throw new Error("Unsupported question type");
        }
    }
    protected disableQuestionInput() {
        throw new Error("Unsupported question type");
    }
    protected shouldRepeatAnswer(): boolean {
        if(this.type == QuestionType.MultipleChoice)
            return true;
        else if(this.type == QuestionType.FillInTheBlank)
            return false;
        else
            throw new Error("Unsupported question type");
    }
    async answered($button: JQuery<HTMLElement>) {
        let option: QuestionOption = $button.data("questionOption");
        if(option != undefined && option != null && option.fn !== undefined)
            await option.fn.call(option);
        GameTools.lastData = this.choices.indexOf(option);
        if(!this.isQuestion || this.isCorrect($button, option)) {
            GameTools.lastResult = true;
            if(this.objStyle.showCorrectConfirmation) {
                const correctAnswer = (this.shouldRepeatAnswer()) ? `The correct answer was ${option.html}` : "";
                this.$title.html(`That's right! ${correctAnswer}`);
                if(this.type == QuestionType.MultipleChoice) {
                    $button.empty();
                    $button.addClass("disable-hover");
                    $button.append($("<i></i>").addClass("fas fa-check").css({
                        "font-size": "150%",
                        "color": "green"
                    }));
                } else if(this.type == QuestionType.FillInTheBlank) {
                    $button.prop("disabled", true);
                } else {
                    this.disableQuestionInput();
                }
                
                await GameTools.sleep(3000);
            }
            this.displayNext();
        } else {
            GameTools.lastResult = false;
            this.title = "Sorry, that wasn't the correct answer.";
            if(this.shouldReDisplay)
                this.redisplay();
            else
                this.displayNext();
        }
    }
    async display() {
        console.log("Button finder display()");
        await super.display();
    }
    async onInputKeyUp(e) {
        if (e.which === 13) {
            $(e.target).off("keyup");
            this.$footer.find("button").prop("disabled", true);
            await this.answered($(e.target));
        }
    }
    dialogDisplayed() {
        super.dialogDisplayed();
        this.$dialog.find("textarea").focus();
    }
    createCustomQuestion() {
        throw new Error("Unexpected question type");
    }
    async dialogCreated() {
        await super.dialogCreated();
        this.$dialog.find(".modal-header").find(".close").remove();
        var $body = this.$dialog.find(".modal-body");
        let $instructionsDiv = $("<div></div>").appendTo($body);
        DisplayedItem.getValue(this, this.instructions, $instructionsDiv.get(0));
        if(this.type == QuestionType.MultipleChoice) {
            var $finderButtons = $("<div></div>").addClass("finder-buttons").appendTo($body);
            console.log("Button finder created");
            GameTools.shuffle(this.choices, this.objStyle.shouldShuffle).forEach((element) => {
                var $button = $("<button></button>");
                DisplayedItem.getValue(this, element.html, $button.get(0));
                if(this.objStyle.shouldColorBackgrounds)
                    GameTools.colorBackground($button);
                $button.data("index", this.choices.indexOf(element));
                $button.data("questionOption", element);
                $button.click(async (e) => {
                    $finderButtons.children("button").prop("disabled", true);
                    await this.answered($button);
                });
                $finderButtons.append($button);
            });
        } else if(this.type == QuestionType.FillInTheBlank) {
            const $input = $("<textarea/>").addClass("form-control").data("index", 0).data("questionOption", this.choices[0]).val(this.objStyle.defaultValue);
            if(!this.objStyle.spellCheck) {
                $input.attr({
                    "autocomplete": "off",
                    "autocorrect": "off",
                    "autocapitalize": "off",
                    "spellcheck": "false" 
                });
            }
            $input.on('keyup', this.onInputKeyUp.bind(this));
            $input.on('input', (e) => {
                const input: HTMLTextAreaElement = e.target as any;
                input.value = input.value.replace(/\n/g, '');
            });
            $body.append($("<p></p>"));
            $body.append($input);
            if(this.objStyle.showMobileTips)
                $body.append($("<small></small>").addClass("form-text text-muted").text("On a small screen? Consider solving the question on a piece of paper and then typing it in at the end."));
        } else {
           this.createCustomQuestion();
        }
        
    }
}
export default Question;