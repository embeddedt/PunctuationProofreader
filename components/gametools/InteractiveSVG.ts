import InfoBox from './InfoBox';
import DisplayedItem, { GameValue } from './DisplayedItem';
import GameTools from './GameTools';
export class InteractiveSVG extends InfoBox {
    protected $svgContainer: JQuery<HTMLDivElement>;
    protected svgElement: SVGElement;
    constructor (title: GameValue<string>, public imgSrc: GameValue<string>, public interactiveComponents?: GameValue<string>[]) {
        super(title, "", null);
    }
    static scrollHandler(): void {
        var scrollLeft = ($(".interactive-svg img").width() - $(".interactive-svg").width()) / 2;
        $(".interactive-svg").scrollLeft(scrollLeft);
    }
    interactiveComponentClicked($component: JQuery<Element>): void {
        GameTools.lastData = $component;
        this.displayNext();
    }
    protected makeInteractive($component: JQuery<Element>): void {
        $component.addClass("interactive-component");
        $component.click((e) => {
            this.interactiveComponentClicked(($(e.target) as JQuery<Element>));
        });
    }
    async dialogCreated() {
        await super.dialogCreated();
        await new Promise((resolve) => {
            this.$svgContainer = $("<div></div>");
            this.$svgContainer.addClass("interactive-svg");
            this.$svgContainer.load(DisplayedItem.getValue(this, this.imgSrc), () => {
                this.svgElement = (this.$svgContainer.find("svg").get(0) as Element as SVGElement);
                let loadCallback = () => {
                    if(this.interactiveComponents)
                        this.interactiveComponents.forEach((selector, index) => {
                            var svg = this.svgElement;
    
                            let elements = svg.querySelectorAll(DisplayedItem.getValue(this, selector));
                            elements.forEach(element => {
                                $(element).addClass("interactive-component");
                                $(element).click((e) => {
                                    this.interactiveComponentClicked(($(e.target) as JQuery<Element>));
                                });
                            });
                        });
                    resolve();
                };
                loadCallback();
            });
            this.$dialog.find(".modal-body").append(this.$svgContainer);
            $(window).off("resize", InteractiveSVG.scrollHandler);
            $(window).on("resize", InteractiveSVG.scrollHandler);
        });
    }
    async _undisplay() {
        await super._undisplay();
        $(window).off("resize", InteractiveSVG.scrollHandler);
    }
}
export default InteractiveSVG;