import { NotebookItem } from './Notebook';
import { DisplayedItem, GameValue, GameArrayItem, toDisplayedItem } from './DisplayedItem';
export class AddToNotebook extends DisplayedItem {
    constructor(protected list: GameValue<Set<NotebookItem>>, protected items: (NotebookItem|Array<NotebookItem>), protected showItem?: boolean) {
        super();
    }
    async display() {
        let firstItem: GameArrayItem = null;
        let realList = DisplayedItem.getValue(null, this.list);
        if(Array.isArray(this.items)) {
            console.log("Is iterable");
            console.log(this.items);
            if(this.showItem == undefined)
                this.showItem = false;
            this.items.forEach((item, index) => {
                if(index == 0)
                    firstItem = item.noteBookLink;
                    realList.add(item);
            });
        } else {
            if(this.showItem == undefined)
                this.showItem = true;
                realList.add(this.items);
            firstItem = this.items.noteBookLink;
        }
        await super.display();
        console.log("Show: " + this.showItem);
        if(this.showItem && firstItem != null && firstItem != undefined) {
            let item = await toDisplayedItem(firstItem, this.getParentArray());
            item.displayNext = item.undisplay;
            item.once("undisplay", () => {
                this.displayNext();
            });
            item.display();
        } else
            this.displayNext();
    }
}