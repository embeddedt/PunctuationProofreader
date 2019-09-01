import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Conversation from './components/Conversation';
import Launcher from './components/Launcher';
import './style.scss';

const WidgetLayout = props => (
  <div
    className={
      `modal-content rcw-widget-container ${props.fullScreenMode ? 'rcw-full-screen' : ''} rcw-opened`
    }
  >
    {
      <Conversation
        title={props.title}
        subtitle={props.subtitle}
        sendMessage={props.onSendMessage}
        senderPlaceHolder={props.senderPlaceHolder}
        onQuickButtonClicked={props.onQuickButtonClicked}
        profileAvatar={props.profileAvatar}
        onCloseClick={props.onToggleConversation}
        showChat={props.showChat}
        showCloseButton={props.showCloseButton}
        disabledInput={props.disabledInput}
        autofocus={props.autofocus}
        titleAvatar={props.titleAvatar}
        inputType={props.inputType}
        possibleMessages={props.possibleMessages}
      />
    }
    {props.customLauncher ?
      props.customLauncher(props.onToggleConversation) :
      !props.fullScreenMode &&
      <Launcher
        toggle={props.onToggleConversation}
        badge={props.badge}
      />
    }
  </div>
);

WidgetLayout.propTypes = {
  title: PropTypes.string,
  titleAvatar: PropTypes.string,
  subtitle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  onSendMessage: PropTypes.func,
  onToggleConversation: PropTypes.func,
  showChat: PropTypes.bool,
  senderPlaceHolder: PropTypes.string,
  onQuickButtonClicked: PropTypes.func,
  profileAvatar: PropTypes.string,
  showCloseButton: PropTypes.bool,
  disabledInput: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  badge: PropTypes.number,
  autofocus: PropTypes.bool,
  customLauncher: PropTypes.func,
  inputType: PropTypes.oneOf(['text', 'dropdown']).isRequired,
  possibleMessages: PropTypes.arrayOf(PropTypes.string)
};

export default connect(store => ({
  showChat: store.behavior.get('showChat'),
  disabledInput: store.behavior.get('disabledInput')
}))(WidgetLayout);
