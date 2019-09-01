import DisplayedItem, { GameValue } from './DisplayedItem';
export class SetBackground extends DisplayedItem {
    static nextIndex = 0;
    public static readonly duration = 2000;
    constructor(protected newsrc: GameValue<string>, protected customClasses: GameValue<string> = "") {
        super();
    }
    getImg(): JQuery<HTMLElement> {
        return $("#gametools-container .background-img");
    }
    async reset() {
        await super.reset();
    }
    hideImage($img: JQuery<HTMLElement>) {
        $img.removeClass("show");
        $img.removeClass($img.attr("data-customClasses"));
    }
    async display() {
        await super.display();
        let $img = this.getImg();
        if($img.length == 0) {
            throw new Error("Cannot find background image object. Perhaps you forgot to monkey patch?");
        }
        const noBackground = () => {
            $("#gametools-container").removeClass("bkgd-shown");
            $($img.get(SetBackground.nextIndex ^ 1)).css("background-image", "none");
            this.hideImage($($img.get(SetBackground.nextIndex ^ 1)));
            this.displayNext();
        };
        if(this.newsrc != null) {
            const src = DisplayedItem.getValue(this, this.newsrc);
            console.log(`Waiting for image "${src}" to load...`);
            let bgImg = new Image();
            bgImg.onload = () => {
                console.log("Image loaded");
                $("#gametools-container").addClass("bkgd-shown");
                this.hideImage($($img.get(SetBackground.nextIndex ^ 1)));
                window.requestAnimationFrame(() => {
                    $($img.get(SetBackground.nextIndex)).addClass("show");
                    SetBackground.nextIndex ^= 1;
                    this.displayNext();
                });
                $($img.get(SetBackground.nextIndex)).css("background-image", 'url(' + bgImg.src + ')');
                const cc = DisplayedItem.getValue(null, this.customClasses);
                $img.attr("data-customClasses", cc);
                $img.addClass(cc);
            };
            bgImg.onerror = () => {
                console.log("Failed to load image");
                noBackground();
            };
            bgImg.src = src;
        } else {
            noBackground();
        }
    }
}
export default SetBackground;