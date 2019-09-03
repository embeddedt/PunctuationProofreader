import InteractiveSVG from './InteractiveSVG';
import Finder from './Finder';
import GameTools from './GameTools';
import { GameValue } from './DisplayedItem';

export class InteractiveSVGFinder extends InteractiveSVG {
    finder: Finder;
    constructor(title: GameValue<string>, public imgSrc: GameValue<string>, interactiveComponents: (GameValue<string>)[], public numItems: number) {
        super(title, imgSrc, interactiveComponents);
        this.finder = new Finder(this, numItems);
    }
    public itemsFound = 0;
    interactiveComponentClicked($component: JQuery<SVGElement>): void {
        GameTools.lastData = $component;
        this.finder.itemFound($component);
    }
    async reset() {
        if(this.finder != null)
            this.finder.reset();
        await super.reset();
    }
}
export default InteractiveSVGFinder;