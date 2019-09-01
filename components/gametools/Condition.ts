import DisplayedItem, { GameValue } from './DisplayedItem';
import GameTools from './GameTools';
export class Condition extends DisplayedItem {
    constructor(public trueStatement: DisplayedItem, public falseStatement: DisplayedItem, public customCondition?: GameValue<boolean>) {
        super();
        if(this.customCondition === undefined)
            this.customCondition = function() {
                return GameTools.lastResult;
            };
    }
    async display() {
        await super.display();
        if(DisplayedItem.getValue(this, this.customCondition))
            this.trueStatement.display();
        else
            this.falseStatement.display();
    }
    async reset() {
        await super.reset();
        this.trueStatement.setParentArray(this.getParentArray());
        this.falseStatement.setParentArray(this.getParentArray());
        this.trueStatement.myIndex = this.myIndex.bind(this);
        this.falseStatement.myIndex = this.myIndex.bind(this);
        if(this.trueStatement)
            await this.trueStatement.reset();
        if(this.falseStatement)
            await this.falseStatement.reset();
    }
}
export default Condition;