import DisplayedItem from './DisplayedItem';
export class Delay extends DisplayedItem {
    constructor(protected time: number) {
        super();
    }
    async display() {
        await super.display();
        setTimeout(() => {
            this.displayNext();
        }, this.time);
    }
}
export default Delay;