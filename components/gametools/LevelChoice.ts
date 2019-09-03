import InfoBox from './InfoBox';
import DisplayedItem, { GameValue } from './DisplayedItem';
import GameTools from './GameTools';

export class LevelChoice extends InfoBox {
    constructor(protected levelMarkups: (GameValue<string>)[]) {
        super("Choose a level", "", null);
    }
    async dialogCreated() {
        this.$dialog.find(".modal-body").text("");
        let $container = $("<div></div>");
        $container.addClass("level-buttons");
        this.levelMarkups.forEach((element, index) => {
            
            let $button = $("<button></button>");
            DisplayedItem.getValue(this, element, $button.get(0));
            $button.data("level-id", index);
            $button.click(() => {
                GameTools.currentLevel = $button.data("level-id");
                this.$dialog.modal('hide');
            });
            $container.append($button);
        });
        this.$dialog.find(".modal-body").append($container);
    }
}