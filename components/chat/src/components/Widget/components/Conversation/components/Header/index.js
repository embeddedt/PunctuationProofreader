import React from 'react';
import PropTypes from 'prop-types';

import close from '@assets/clear-button.svg';

import './style.scss';

class Header extends React.Component {
  render() {
    return (
    <div className="rcw-header">
      {this.props.showCloseButton &&
        <button className="rcw-close-button" onClick={this.props.onCloseClick}>
          <img src={close} className="rcw-close" alt="close" />
        </button>
      }
      <h4 className="rcw-title">
        {this.props.titleAvatar && <img src={this.props.titleAvatar} className="avatar" alt="profile" />}
        {this.props.title}
      </h4>
      <span>{this.props.subtitle}</span>
    </div>
    );
  }
}

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  onCloseClick: PropTypes.func,
  showCloseButton: PropTypes.bool,
  titleAvatar: PropTypes.string
};
export default Header;
