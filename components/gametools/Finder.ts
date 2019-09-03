import DisplayedItem, { GameArrayItem, GameValue, toDisplayedItem } from './DisplayedItem';
import InfoBox from './InfoBox';
import GameTools from './GameTools';

export interface FinderLinkedItem<DisplayType = GameValue<string>> {
    button: DisplayType;
    link: GameArrayItem;
}
export type FinderTemplate = (itemsFound: number, totalItems: number) => string;
export type FinderItem<T = GameValue<string>> = (T|FinderLinkedItem<T>);
export class Finder {
    public itemsFound: number;
    private itemIndexes: any[] = [];
    public static defaultTemplate(itemsFound: number, totalItems: number) {
        return `You have found ${itemsFound} of ${totalItems} items.`;
    }
    public $componentFound: JQuery;
    constructor(public parent: InfoBox, public numItems: number, public template: FinderTemplate = Finder.defaultTemplate) {
        this.reset();
    }
    reset(): void {
        this.itemIndexes = [];
        this.itemsFound = 0;
    }
    setTitle(): void {
        if(this.itemsFound > 0)
            this.parent.$dialog.find(".modal-title").text(this.template(this.itemsFound, this.numItems));
    }
    static isLinkedItem<T>(item: FinderItem<T>): item is FinderLinkedItem<T> {
        if(item == undefined || item == null)
            return false;
        let b_item = item as FinderLinkedItem<T>;
        return (b_item.button != undefined && b_item.link != undefined);
    }
    async itemFound($component: JQuery<any>): Promise<boolean> {
        
        if(this.itemIndexes.indexOf($component.data("index")) == -1) {
            this.itemsFound++;
            this.itemIndexes.push($component.data("index"));
        }
        this.$componentFound = $component;
        const element: FinderItem = $component.data("element");
        return new Promise(async(resolve) => {
            if(Finder.isLinkedItem(element)) {
                let item: DisplayedItem = await toDisplayedItem(element.link, null);
                item.displayNext = (async function(){
                    await this.undisplay();
                }).bind(item);
                item.once("undisplay", () => {
                    this.parent.displayNext();
                    resolve(false);
                });
                item.display();
            } else {
                this.parent.displayNext();
                resolve(false);
            }
        });
    }
    finished(): boolean {
        return this.itemsFound == this.numItems;
    }
}
export default Finder;