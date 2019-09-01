import DisplayedItem, { resetSystem } from './DisplayedItem';

export class SystemReset extends DisplayedItem {
    async display() {
        await super.display();
        resetSystem(this.getParentArray());
        this.displayNext();
    }
}

export default SystemReset;