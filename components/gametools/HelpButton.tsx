import React from 'react';
import ControlButton, { ControlButtonProps } from "./ControlButton";
import DisplayedItem, { ContextualHelpItem } from './DisplayedItem';
import GameTools from './GameTools';
import InfoBox from './InfoBox';
export class HelpButton extends React.PureComponent<ControlButtonProps, { visible: boolean }> {
    constructor(props) {
        super(props);
        this.state = { visible: false };
    }
    componentDidMount() {
        GameTools.helpShown = true;
        DisplayedItem.updateHelp(this);
    }
    componentWillUnmount() {
        GameTools.helpShown = false;
    }
    render() {
        const { onClick, ...rest } = this.props;
        const items = (this.state.visible) ?
            <ControlButton onClick={() => {
                const topItem = DisplayedItem.visibleStack[DisplayedItem.visibleStack.length - 1] as ContextualHelpItem;
                setTimeout(async() => {
                    let box = new class extends InfoBox {
                        async dialogCreated() {
                            await super.dialogCreated();
                            this.$content.addClass("gt-help-body");
                        }
                    }("Information", topItem.getHelp(), "OK", 0);
                    await box.display();
                }, 0);
            }} {...rest}/>
        : null;
        return items;
    }
}
export default HelpButton;