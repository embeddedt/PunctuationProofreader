import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { hideAvatar } from '@actions';
import { scrollToBottom } from '@utils/messages';

import Loader from './components/Loader';
import { default as Moment } from 'react-moment';

import './styles.scss';

class Messages extends Component {
  componentDidMount() {
    scrollToBottom(this.$message);
  }

  componentDidUpdate() {
    scrollToBottom(this.$message);
  }

  $message = null

  getComponentToRender = message => {
    const ComponentToRender = message.get('component');
    const previousMessage = this.props.messages.get()
    if (message.get('type') === 'component') {
      return <ComponentToRender {...message.get('props')} />;
    }
    return <ComponentToRender message={message} />;
  };

  shouldRenderAvatar = (message, index) => {
    const previousMessage = this.props.messages.get(index - 1);
    if (message.get('showAvatar') && previousMessage.get('showAvatar')) {
      this.props.dispatch(hideAvatar(index));
    }
  }

  render() {
    const { messages, profileAvatar, typing } = this.props;
    return (
      <div id="messages" className="rcw-messages-container" ref={msg => this.$message = msg}>
        {messages.map((message, index) =>
          <Fragment key={index}>
            <div className={"rcw-message rcw-" + message.get('sender') + "-message"}>
              {profileAvatar &&
                message.get('showAvatar') &&
                <img src={profileAvatar} className="rcw-avatar" alt="profile" />
              }
              {this.getComponentToRender(message)}
            </div>
            <div className={"rcw-time-message rcw-" +  message.get('sender') + "-message"}>
              {profileAvatar &&
                message.get('showAvatar') &&
                <div className="rcw-avatar"/>
              }
              <div className={"rcw-time-" + message.get('sender')}>
                <Moment className="rcw-time" interval={15000} fromNow ago date={message.get('time')}/>
              </div>
            </div>
          </Fragment>
        )}
        <Loader typing={typing} />
      </div>
    );
  }
}

Messages.propTypes = {
  messages: ImmutablePropTypes.listOf(ImmutablePropTypes.map),
  profileAvatar: PropTypes.string
};

export default connect(store => ({
  messages: store.messages,
  typing: store.behavior.get('msgLoader')
}))(Messages);
