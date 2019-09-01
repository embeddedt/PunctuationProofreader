import InfoBox from "./InfoBox";
import DisplayedItem, { StylisticOptions, GameValue } from "./DisplayedItem";

class UnitScanner extends InfoBox {
    currentLoop: number;
    $units: JQuery[];
    currentUnit: number;
    previousUnit: number;
    constructor(title: GameValue<string>, protected valUnits: GameValue<string[]>, protected loopSpeed = 500, delay?: number, style?: StylisticOptions) {
        super(title, "", null, delay, style);
    }
    protected loopHandler() {
        if(this.previousUnit != -1) {
            this.$units[this.previousUnit].removeClass("gt-current");
        }
        this.$units[this.currentUnit].addClass("gt-current");
        this.previousUnit = this.currentUnit;
        this.currentUnit++;
        if(this.currentUnit >= this.$units.length)
            this.currentUnit = 0;
    }
    dialogDisplayed() {
        super.dialogDisplayed();
        /* Start the scan loop */
        this.currentLoop = window.setInterval(this.loopHandler.bind(this), this.loopSpeed);
    }
    async _undisplay() {
        clearInterval(this.currentLoop);
        this.previousUnit = -1;
        this.currentUnit = -1;
        await super._undisplay();
    }
    async dialogCreated() {
        await super.dialogCreated();
        const units = DisplayedItem.getValue(this, this.valUnits);
        this.$units = new Array<JQuery>(units.length);
        units.forEach((unit, index) => {
            this.$units[index] = $("<div></div>").addClass("gt-unitscan-unit").html(unit);
            this.$content.append(this.$units[index]);
        });
        this.currentUnit = 0;
        this.previousUnit = -1;
    }
}
export default UnitScanner;