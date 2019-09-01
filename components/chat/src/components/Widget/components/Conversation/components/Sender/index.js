import React, { Component } from 'react';
import PropTypes from 'prop-types';

import send from '@assets/send_button.svg';

import './style.scss';

class Sender extends Component{
  input = React.createRef();

  componentDidUpdate() {
    this.input.current.focus();
  }

  render() {
    const { sendMessage, placeholder, disabledInput, autofocus, inputType, possibleMessages } = this.props;
    return (
      <form className="rcw-sender" onSubmit={sendMessage}>
        {inputType == 'text' && <>
          <input type="text" className="rcw-new-message" name="message" placeholder={placeholder} disabled={disabledInput} autoFocus={autofocus} autoComplete="off" ref={this.input}/>
          <button type="submit" className="rcw-send">
            <img src={send} className="rcw-send-icon" alt="send" />
          </button>
          </>}
        {inputType == 'dropdown' && <div className="dropdown rcw-dropdown-message">
          <button disabled={disabledInput} ref={this.input} className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{disabledInput ? "You can't choose a message" : "Choose a message"}</button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {possibleMessages.map((message, index) => 
              <button disabled={disabledInput} type="submit" onClick={(e) => {
                e.target.setAttribute('data-submittedButton', 'true');
              }} className="dropdown-item" key={index}>{message}</button>
            )}
          </div>
        </div>}
      </form>
    );
  }

}

Sender.propTypes = {
  sendMessage: PropTypes.func,
  placeholder: PropTypes.string,
  disabledInput: PropTypes.bool,
  autofocus: PropTypes.bool,
  inputType: PropTypes.oneOf(['text', 'dropdown']).isRequired,
  possibleMessages: PropTypes.arrayOf(PropTypes.string)
};

export default Sender;
