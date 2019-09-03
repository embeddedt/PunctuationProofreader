import InfoBox from './InfoBox';
import {DisplayedItem, GameValue} from './DisplayedItem';
export class BusinessCard extends InfoBox {
    numClicks: number;
    constructor(protected cardContents: GameValue<string>) {
        super(null, null, null);
    }
    async reset() {
        await super.reset();
        this.numClicks = 0;
    }
    async dialogCreated() {
        await super.dialogCreated();
        const $button = $("<button></button>").addClass("business-card");
        DisplayedItem.getValue(this, this.cardContents, $button.get(0));
        this.$dialog.find(".modal-content").remove();
        this.$dialog.find(".modal-dialog").append($button);
        $button.on("click", (e) => {
            this.numClicks++;
            if(this.numClicks == 2) {
                this.numClicks = 0;
                this.buttonCallback(e);
            }
        });
        $button.on("blur", () => {
            $button.blur();
            this.numClicks = 0;
        });
    }
}
export default BusinessCard;