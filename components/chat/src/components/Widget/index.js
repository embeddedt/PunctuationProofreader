import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { toggleChat, addUserMessage } from '@actions';

import WidgetLayout from './layout';

class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onToggleConversation: props.onToggleConversation.bind(this)
    };
  }
  componentDidUpdate() {
    if (this.props.fullScreenMode) {
      this.props.dispatch(toggleChat());
    }
  }

  toggleConversation = () => {
    this.props.dispatch(toggleChat());
  }

  handleMessageSubmit = (event) => {
    event.preventDefault();
    let userInput;
    console.log(event.target);
    if(this.props.inputType == 'text') {
      userInput = event.target.message.value;
      event.target.message.value = '';
    } else {
      let button = event.target.querySelector('button[data-submittedButton="true"]');
      if(button == null || button == undefined)
        throw new Error("No button found");
      button.setAttribute('data-submittedButton', 'false');
      userInput = button.textContent;
    }
    
    if (userInput.trim()) {
      this.props.dispatch(addUserMessage(userInput));
      this.props.handleNewUserMessage(userInput);
    }
  }

  handleQuickButtonClicked = (event, value) => {
    event.preventDefault();

    if(this.props.handleQuickButtonClicked) {
      this.props.handleQuickButtonClicked(value);
    }
  }

  render() {
    return (
      <WidgetLayout
        onToggleConversation={this.state.onToggleConversation}
        onSendMessage={this.handleMessageSubmit}
        onQuickButtonClicked={this.handleQuickButtonClicked}
        title={this.props.title}
        titleAvatar={this.props.titleAvatar}
        subtitle={this.props.subtitle}
        senderPlaceHolder={this.props.senderPlaceHolder}
        profileAvatar={this.props.profileAvatar}
        showCloseButton={this.props.showCloseButton}
        fullScreenMode={this.props.fullScreenMode}
        badge={this.props.badge}
        autofocus={this.props.autofocus}
        customLauncher={this.props.customLauncher}
        inputType={this.props.inputType}
        possibleMessages={this.props.possibleMessages}
      />
    );
  }
}

Widget.propTypes = {
  title: PropTypes.string,
  titleAvatar: PropTypes.string,
  subtitle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  handleNewUserMessage: PropTypes.func.isRequired,
  handleQuickButtonClicked: PropTypes.func.isRequired,
  senderPlaceHolder: PropTypes.string,
  profileAvatar: PropTypes.string,
  showCloseButton: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  badge: PropTypes.number,
  autofocus: PropTypes.bool,
  customLauncher: PropTypes.func,
  onToggleConversation: PropTypes.func,
  inputType: PropTypes.oneOf(['text', 'dropdown']).isRequired,
  possibleMessages: PropTypes.arrayOf(PropTypes.string)
};

Widget.defaultProps = {
  onToggleConversation: function() {
    this.toggleConversation();
  }
}

export default connect()(Widget);
