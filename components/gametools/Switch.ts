/// <reference types="async"/>

import DisplayedItem, { GameValue } from './DisplayedItem';
import asyncLib from 'async';

interface BaseSwitchCase<T> {
    handler: (arg0: T) => any;
}
export interface DefaultSwitchCase<T> extends BaseSwitchCase<T> {
    default: boolean;
}
export interface SwitchCase<T> extends BaseSwitchCase<T> {
    caseValue?: T | T[];
}
export class Switch<T> extends DisplayedItem {
    constructor(protected value: GameValue<T>, protected cases: (DefaultSwitchCase<T> | SwitchCase<T>)[]) {
        super();
    }
    private static valueMatches<T>(caseVal: (T|T[]), rightVal: T): boolean {
        if(caseVal instanceof Array)
            return caseVal.some((val: T) => {
                return val == rightVal;
            });
        else {
            return caseVal == rightVal;
        }
    }
    async display() {
        await super.display();
        let conditionVal: T = DisplayedItem.getValue(this, this.value);
        let defaultCase: DefaultSwitchCase<T> = null;
        let wasHandled: boolean;
        let shouldDisplayNext: boolean;
        await new Promise((resolve) => {
            asyncLib.some(this.cases, async(val: (SwitchCase<T>), callback) => {
                if((val as DefaultSwitchCase<T>).default === undefined && Switch.valueMatches<T>(val.caseValue, conditionVal)) {
                    shouldDisplayNext = await (val as BaseSwitchCase<T>).handler(conditionVal);
                    callback(null, true);
                    return;
                } else if((val as DefaultSwitchCase<T>).default === true) {
                    if(defaultCase != null)
                        throw "Multiple default cases";
                    else
                        defaultCase = (val as DefaultSwitchCase<T>);
                }
                callback(null, false);
            }, (err, result) => {
                wasHandled = result;
                resolve();
            });
        });
        
        if(!wasHandled && defaultCase != null) {
            shouldDisplayNext = await defaultCase.handler(conditionVal);
        }
        if(shouldDisplayNext == undefined || shouldDisplayNext == null)
            shouldDisplayNext = true; /* Will become false */

        shouldDisplayNext = !shouldDisplayNext;
        console.log("Exiting switch " + shouldDisplayNext);
        if(shouldDisplayNext)
            this.displayNext();
    }
}
export default Switch;