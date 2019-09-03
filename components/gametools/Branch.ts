import Loop from './Loop';
import { toDisplayedItem } from './DisplayedItem';
export class Branch extends Loop {
    async displayNext() {
        /* Do NOT call super.displayNext(), this will do nothing */
        let arr = this.getParentArray();
        arr.contentsIndex++; /* simulate DisplayedItem.displayNext() */
        setTimeout(async() => {
            let item = await toDisplayedItem(arr[arr.contentsIndex], arr);
            item.display();
        }, 0);
    }
    async display() {
        await super.display();
    }
}
export default Branch;