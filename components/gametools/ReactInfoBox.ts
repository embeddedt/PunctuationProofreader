import InfoBox from './InfoBox';
import { StylisticOptions } from './DisplayedItem';
export class ReactInfoBox extends InfoBox {
    protected component: React.Component;
    protected addContentClass: boolean;
    constructor(protected jsxElement: JSX.Element, buttonText = "OK", delay = InfoBox.defaultDelay, style?: StylisticOptions) {
        super(null, "", buttonText, delay, style);
        this.component = null;
        this.addContentClass = true;
    }
    async reset() {
        this.component = null;
        await super.reset();
    }
    async _undisplay() {
        await super._undisplay();
        this.component = null;
    }
    async reactComponentUpdated() {

    }
    async dialogCreated() {
        this.$dialog.find(".modal-dialog").empty();
        await new Promise((resolve) => {
            this.doRenderReact(this.jsxElement, this.$dialog.find(".modal-dialog").get(0), async() => {
                if(this.addContentClass) {
                    console.log("Adding content class");
                    let $container = this.$dialog.find(".modal-dialog").children();
                    $container.addClass("modal-content");
                    this.addContentClass = false;
                }
                await this.reactComponentUpdated();
                resolve();
            });
        });
        await super.dialogCreated();
    }
}
export default ReactInfoBox;