import DisplayedItem, { GameValue } from './DisplayedItem';
import Label from './Label';
import GameTools from './GameTools';
export class Call<T extends DisplayedItem> extends DisplayedItem {
    constructor(private fn: (item: T) => any, private labelName: GameValue<string>, private returnData = false) {
        super();
    }
    async display() {
        await super.display();
        var newData: any;
        if(this.labelName === null || this.labelName === undefined) {
            newData = await this.fn.call(null);
        } else {
            let itemIndex: number = Label.lookupItem(this.getParentArray(), this.labelName);
            if(itemIndex == null)
                throw "Undefined label: " + this.labelName;
            let item = this.getParentArray()[itemIndex];
            newData = await this.fn.call(item, item);
        }
        if(this.returnData)
            GameTools.lastData = newData;
        this.displayNext();
    }
}