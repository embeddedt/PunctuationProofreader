import DisplayedItem from './DisplayedItem';
export class Invoke extends DisplayedItem {
    constructor(protected fn: () => any) {
        super();
    }
    async display() {
        await super.display();
        await this.fn();
        this.displayNext();
    }
}
export default Invoke;