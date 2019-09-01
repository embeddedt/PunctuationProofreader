import React from 'react';
export function ModalCloseButton(props) {
    return <button type="button" className="close" aria-label="Close" {...props}><span aria-hidden="true">&times;</span></button>;
}
export class ModalTitleBar extends React.Component<{ title?: string; showClose?: boolean; }> {
    render() {
        let closeButton;
        if(this.props.showClose != false)
            closeButton = <ModalCloseButton/>;
        return <div className="modal-header">
            <h5 className="modal-title">{this.props.title}</h5>
            {closeButton}
        </div>;
    }
}