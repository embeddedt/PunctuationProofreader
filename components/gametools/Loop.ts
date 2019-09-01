import DisplayedItem, {GameValue} from './DisplayedItem';
import Label from './Label';

export interface LoopInfo {
    index: GameValue<number | string>;
    relative?: boolean;
}
export class Loop extends DisplayedItem {
    
    private numLoops = 0;
    constructor(public loopInfo: LoopInfo, public times = -1) {
        super();
        if(typeof this.loopInfo.index == "number" && this.loopInfo.index < 0)
            this.loopInfo.relative = true;
        else if(this.loopInfo.relative === undefined)
            this.loopInfo.relative = true;
    }
    addLoop(): void {
        this.numLoops--;
        if(this.numLoops < -1)
            this.numLoops = -1;
    }
    getNumTimesLooped(): number {
        return this.numLoops;
    }
    async display() {
        await super.display();
        if(this.times < 0 || this.numLoops < this.times) {
            var indexVal = DisplayedItem.getValue(this, this.loopInfo.index);
            if(typeof indexVal == "number") {
                if(this.loopInfo.relative && this.myIndex() == -1)
                    throw "Not in gameContents array, cannot use relative branch";
                if(!this.loopInfo.relative)
                    this.getParentArray().contentsIndex = indexVal;
                else
                this.getParentArray().contentsIndex += indexVal;
            } else {
                let theItem: number = Label.lookupItem(this.getParentArray(), indexVal);
                console.log("Index = " + theItem);
                if(theItem == null)
                    throw "Undefined label: " + indexVal;
                this.getParentArray().contentsIndex = theItem;
            }
            this.getParentArray().contentsIndex -= 1;
            this.numLoops++;
        }
        if(this.times < 0)
            this.numLoops = 0;
        this.displayNext();
    }
    async reset() {
        this.numLoops = 0;
        await super.reset();
    }
}
function constructLoop(loopInfo: LoopInfo, times = -1) {
    return new Loop(loopInfo, times);
}

export default Loop;