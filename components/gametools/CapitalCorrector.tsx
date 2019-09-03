import UnitScanner from "./UnitScanner";
import React from 'react';
import WrongRightQuestion from "./WrongRightQuestion";
import Question, { QuestionType, QuestionOption } from "./Question";
import GameTools from "./GameTools";

class CapitalCorrector extends Question {
    private scanner: React.RefObject<UnitScanner>;
    protected currentSentence: string;
    constructor(protected question: string, protected answer: string, title: string = "Correct the capitalization of the sentence.") {
        super(QuestionType.Custom, title, [], true);
    }
    private readonly handleKeydown: (event: JQuery.KeyDownEvent, isFirst: boolean) => void = (function(this: CapitalCorrector, event: JQuery.KeyDownEvent, isFirst: boolean) {
        const key = event.key.toLowerCase();
        if((key == 'u' || event.which == 38) && isFirst)
            this.changeCase(true);
        else if((key == 'l' || event.which == 40) && isFirst)
            this.changeCase(false);
        else if(event.which == 37)
            this.scanner.current.decrementUnit();
        else if(event.which == 39)
            this.scanner.current.incrementUnit();
        else if(event.which == 13 && isFirst) {
            this.answered($());
        }
    }).bind(this);
    changeCase(upper: boolean) {
        const scanner = this.scanner.current;
        const currentUnit = scanner.state.currentUnit;
        const unitInfo = scanner.getUnitInfo();
        const letter = unitInfo.unitStrs[currentUnit];
        const newLetter = (upper ? letter.toUpperCase() : letter.toLowerCase());
        this.currentSentence = GameTools.replaceAt(this.currentSentence, currentUnit, newLetter);
        scanner.setState({ units: UnitScanner.makeSentenceUnits(this.currentSentence) });
    }
    async reset() {
        this.scanner = null;
        await super.reset();
    }
    disableQuestionInput() {
        this.$footer.find("button").prop("disabled", true);
    }
    shouldRepeatAnswer() {
        return false;
    }
    isCorrect($obj: JQuery, option: QuestionOption) {
        return this.currentSentence == this.answer;
    }
    buttonCallback(e: JQuery.ClickEvent) {
        this.answered($());
    }
    async _undisplay() {
        this.off("gt-keydown", this.handleKeydown);
        await super._undisplay();
    }
    createCustomQuestion() {
        this.$footer.append($("<button></button>").addClass("btn btn-primary").text("Check").click(this.buttonCallback.bind(this)));
        this.$footer.show();
        this.scanner = React.createRef();
        this.currentSentence = this.question;
        this.doRenderReact(<div>
            <UnitScanner loopSpeed={-1} ref={this.scanner} units={UnitScanner.makeSentenceUnits(this.currentSentence)} isUsefulUnit={(unit) => {
                if(unit.toUpperCase() == unit.toLowerCase())
                    return false;
                return UnitScanner.defaultProps.isUsefulUnit(unit);
            }}/>
            <p></p>
            <button onClick={() => this.scanner.current.decrementUnit()} className='btn btn-primary gt-ccorrect-button'><i className="fas fa-arrow-left"></i></button>
            <button onClick={() => this.changeCase(true)} className='btn btn-primary gt-ccorrect-button'>Uppercase</button>
            <button onClick={() => this.changeCase(false)} className='btn btn-primary gt-ccorrect-button'>Lowercase</button>
            <button onClick={() => this.scanner.current.incrementUnit()} className='btn btn-primary gt-ccorrect-button'><i className="fas fa-arrow-right"></i></button>
        </div>, this.$content.get(0));
        this.$content.focus();
        this.on("gt-keydown", this.handleKeydown);
    }
}
export default CapitalCorrector;