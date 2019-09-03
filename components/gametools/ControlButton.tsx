import React from 'react';
export interface ControlButtonProps {
    colorClass: string;
    icon?: string;
    name: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
interface ControlButtonState {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled: boolean;
}
export class ControlButton extends React.Component<ControlButtonProps, ControlButtonState> {
    private buttonRef = React.createRef<HTMLButtonElement>();
    constructor(props) {
        super(props);
        let onClick = this.props.onClick;
        if(onClick == undefined) {
            onClick = () => {};
        }
        onClick = onClick.bind(this);
        this.state = { onClick: onClick, disabled: false };
        this.buttonClicked = this.buttonClicked.bind(this);
    }
    async buttonClicked(e) {
        this.setState({ disabled: true });
        await this.state.onClick(e);
        this.setState({ disabled: false });
    }
    render() {
        let iconElement = undefined;
        if(this.props.icon !== undefined)
            iconElement = <i className={this.props.icon}></i>;
        return <button disabled={this.state.disabled} onClick={this.buttonClicked} ref={this.buttonRef} title={this.props.name} className={"control-button btn " + this.props.colorClass}>{iconElement}</button>;
    }
    tooltipShown() {
        $(this.buttonRef.current).data("tooltipTimeout", setTimeout(() => {
            $(this.buttonRef.current).data("tooltipTimeout", null);
            $(this.buttonRef.current).tooltip('hide');
        }, 4000));
    }
    tooltipHide() {
        clearTimeout($(this.buttonRef.current).data("tooltipTimeout"));
    }
    componentDidMount() {
        $(this.buttonRef.current).tooltip({
            container: 'body'
        });
        $(this.buttonRef.current).data("tooltipTimeout", null);
        $(this.buttonRef.current).on('shown.bs.tooltip', () => this.tooltipShown());
        $(this.buttonRef.current).on('hide.bs.tooltip', () => this.tooltipHide());
    }
    componentWillUnmount() {
        this.tooltipHide();
        $(this.buttonRef.current).tooltip('dispose');
        $(this.buttonRef.current).off('shown.bs.tooltip');
        $(this.buttonRef.current).off('hide.bs.tooltip');
    }
}
export default ControlButton;