import InfoBox from './InfoBox';
import Finder, { FinderItem, FinderTemplate } from './Finder';
import GameTools from './GameTools';
import DisplayedItem, { GameValue } from './DisplayedItem';

export class ButtonFinder extends InfoBox {
    finder: Finder;
    didDisplay = false;
    foundIndexes: number[];
    closeButtonShown: boolean;
    constructor(title: GameValue<string>, public instructions: GameValue<string>, public buttons: FinderItem[], public delay = InfoBox.defaultDelay, protected userTemplate: FinderTemplate = Finder.defaultTemplate) {
        super(title, instructions, null, delay);
        this.finder = new Finder(this, buttons.length, this.finderTemplate.bind(this));
        this.foundIndexes = [];
    }
    protected finderTemplate(itemsFound: number, totalItems: number): string {
        let userString = this.userTemplate(itemsFound, totalItems);
        if(!this.closeButtonShown)
            return userString;
        return userString + " You can now close the dialog.";
    }
    async reset() {
        if(this.finder != null)
            this.finder.reset();
        await super.reset();
        this.foundIndexes = [];
        this.didDisplay = false;
        this.closeButtonShown = false;
    }
    async displayNext() {
        GameTools.lastResult = this.finder.finished();
        GameTools.lastData = this.finder.$componentFound.data("index");
        await super.displayNext();
    }
    async display() {
        await super.display();
        if(this.finder.finished()) {
            this.didDisplay = false;
            await this.displayNext();
        } else {
            this.didDisplay = true;
        }
    }
    async dialogCreated() {
        var $body = this.$dialog.find(".modal-body");
        $body.html("");
        $body.show();

        if(this.instructions != null) {
            let $span = $("<span></span>");
            DisplayedItem.getValue(this, this.instructions, $span.get(0));
            $body.append($span);
        }
            
        this.finder.setTitle();
        var $finderButtons = $("<div></div>").addClass("finder-buttons").appendTo($body);
        this.buttons.forEach((element, index) => {
            var $button = $("<button></button>");
            if(!Finder.isLinkedItem(element))
                DisplayedItem.getValue(this, element, $button.get(0));
            else
                DisplayedItem.getValue(this, element.button, $button.get(0));
            if(this.foundIndexes.indexOf(index) != -1) {
                $button.addClass("was_found");
            }
            $button.data("index", index);
            $button.data("element", element);
            $button.click(async(e) => {
                $finderButtons.children("button").prop("disabled", true);
                this.foundIndexes.push($(e.target).data("index"));
                if(await this.finder.itemFound($(e.target))) {
                    $finderButtons.children("button").prop("disabled", false);
                    await this.dialogCreated();
                    if(this.finder.finished()) {
                        console.log("Adding close button");
                        this.addCloseButton();
                        this.closeButtonShown = true;
                        this.finder.setTitle();
                    }
                }
            });
            $finderButtons.append($button);
        });
    }
}

export default ButtonFinder;