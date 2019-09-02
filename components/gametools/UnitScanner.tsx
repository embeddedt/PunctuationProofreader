import DisplayedItem, { GameValue } from "./DisplayedItem";
import React from "react";
import GameTools from "./GameTools";

type UnitScannerUnitType = GameValue<(string|string[])[]>;
class UnitScanner extends React.Component<{ units: UnitScannerUnitType; loopSpeed?: number; isUsefulUnit?: (unit: string) => boolean; }, { units: UnitScannerUnitType; currentUnit: number; shouldLoop: boolean; }> {
    currentLoop: number;
    static defaultProps = {
        loopSpeed: 800,
        isUsefulUnit: function(unit: string): boolean {
            if(unit.trim().length == 0)
                return false;
            return true;
        }
    };
    constructor(props) {
        super(props);
        this.state = { currentUnit: 0, units: this.props.units, shouldLoop: (this.props.loopSpeed <= 0) ? false: true };
    }
    public getUnitInfo(units?: UnitScannerUnitType): { myUnits: (string|string[])[]; unitStrs: string[] } {
        if(units == undefined)
            units = this.state.units;
        const myUnits = DisplayedItem.getValue(null, units);
        let unitStrs: string[] = [];
        myUnits.forEach((unitArr) => {
            if(Array.isArray(unitArr)) {
                unitArr.forEach((unit) => unitStrs.push(unit));
            } else
                unitStrs.push(unitArr);
        });
        return { myUnits: myUnits, unitStrs: unitStrs };
    }
    public decrementUnit() {
        let currentUnit = this.state.currentUnit;
        let unitInfo = this.getUnitInfo();
        do {
            currentUnit--;
            if(currentUnit < 0)
                currentUnit = unitInfo.unitStrs.length - 1;
        } while(!this.props.isUsefulUnit(unitInfo.unitStrs[currentUnit]));
        this.setState({ currentUnit: currentUnit });
    }
    public incrementUnit() {
        let currentUnit = this.state.currentUnit;
        let unitInfo = this.getUnitInfo();
        do {
            currentUnit++;
            if(currentUnit >= unitInfo.unitStrs.length)
                currentUnit = 0;
        } while(!this.props.isUsefulUnit(unitInfo.unitStrs[currentUnit]));
        this.setState({ currentUnit: currentUnit });
    }
    protected loopHandler() {
        if(!this.state.shouldLoop)
            return;
        this.incrementUnit();
    }
    public static makeSentenceUnits(sentence: string): (string|string[])[] {
        const words: (string|string[])[] = sentence.split(/( )/g);
        console.log(words);
        words.forEach((word,index) => {
            words[index] = (word as string).split('');
        });
        return words;
    }
    componentDidMount() {
        /* Start the scan loop */
        this.loopHandler();
        this.currentLoop = window.setInterval(this.loopHandler.bind(this), this.props.loopSpeed);
    }
    componentWillUnmount() {
        clearInterval(this.currentLoop);
    }
    makeUnitFromString(unitStr: string, key: number, str_index: number): JSX.Element {
        return <div key={key} className={`gt-unitscan-unit ${str_index === this.state.currentUnit ? 'gt-current' : ''}`}>{unitStr}</div>;
    }
    render() {
        let str_index = 0;
        const unitInfo = this.getUnitInfo();
        return <div className='gt-unitscan'>
            {unitInfo.myUnits.map((unitArr, parent_index) => {
                if(Array.isArray(unitArr)) {
                    return <div key={parent_index} className="gt-unitscan-unit-set">{unitArr.map((unit, child_index) => this.makeUnitFromString(unit, child_index, str_index++))}</div>;
                }
                return this.makeUnitFromString(unitArr, parent_index, str_index++);
            })}
        </div>;
    }
}
export default UnitScanner;