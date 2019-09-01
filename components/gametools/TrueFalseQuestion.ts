import InfoBox from './InfoBox';
import GameTools from './GameTools';
import { GameValue} from './DisplayedItem';
export class TrueFalseQuestion extends InfoBox {
    constructor(question: GameValue<string>, protected correctAnswer?: boolean) {
        super(question, null, "True");
    }
    buttonCallback(e: JQuery.ClickEvent): void {
        const isTrue = $(e.target).text() == "True";
        if(this.correctAnswer !== undefined) {
            GameTools.lastResult = isTrue == this.correctAnswer;
        } else
            GameTools.lastResult = isTrue;
       
        super.buttonCallback(e);
    }
    async dialogCreated() {
        var $footer = this.$dialog.find(".modal-footer");
        $footer.append($("<button></button>").addClass("btn btn-secondary").text("False").click(this.buttonCallback));
    }
}
export default TrueFalseQuestion;