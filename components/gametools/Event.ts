import DisplayedItem from './DisplayedItem';
export class Event extends DisplayedItem {
    private waitingPromises: Function[];
    constructor() {
        super();
        this.waitingPromises = [];
    }
    public async waitFor() {
        await new Promise((resolve) => {
            this.waitingPromises.push(resolve);
        });
    }
    async display() {
        await super.display();
        this.displayNext();
    }
    public trigger(): void {
        this.waitingPromises.forEach((resolve) => resolve());
    } 
}
export default Event;