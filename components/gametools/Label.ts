/// <reference path="gametools.d.ts"/>

import {DisplayedItem, LabelledItem, GameArray, GameValue, GameArrayItem } from './DisplayedItem';
export class Label extends DisplayedItem implements LabelledItem {
    public gt_label: string;
    constructor(name: GameValue<string> = "") {
        super();
        this.gt_label = DisplayedItem.getValue(this, name);
    }
    async display() {
        await super.display();
        this.displayNext();
    }
    static label(label: GameValue<string>): Label;
    static label<T extends GameArrayItem = Label>(label: GameValue<string>, item?: T): LabelledItem&T;
    static label<T extends GameArrayItem = Label>(label: GameValue<string> = "", item?: T): LabelledItem&T {
        if(item !== undefined) {
            let li = (item as unknown as LabelledItem);
            li.gt_label = DisplayedItem.getValue(null, label);
            return li as LabelledItem&T;
        } else {
            return new Label(label) as LabelledItem&T;
        }
        
    }
    private static lookup(array: GameArray, indexVal: GameValue<string>): number {
        let labels = array.filter(e => e instanceof Label);
        let theLabel: number = null;
        labels.some((e, index) => {
            let label = (e as Label);
            if(label.gt_label == DisplayedItem.getValue(null, indexVal)) {
                theLabel = array.indexOf(label);
                return true;
            }
            return false;
        });
        return theLabel;
    }
    public static lookupItem(array: GameArray, indexVal: GameValue<string>): number {
        let val = DisplayedItem.getValue(null, indexVal);
        let label: number = Label.lookup(array, val);
        if(label != null)
            return label;
        let theItem: number = null;
        array.some((e, index) => {
            if((e as LabelledItem).gt_label !== undefined && (e as LabelledItem).gt_label == val) {
                theItem = index;
                return true;
            }
            return false;
        });
        return theItem;
    }
}

export default Label;