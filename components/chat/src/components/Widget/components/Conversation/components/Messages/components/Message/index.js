import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import markdownIt from 'markdown-it';
import markdownItSup from 'markdown-it-sup';
import markdownItSanitizer from 'markdown-it-sanitizer';
import markdownItLinkAttributes from 'markdown-it-link-attributes';

import { PROP_TYPES } from '@constants';

import './styles.scss';

import 'magnific-popup';

import 'magnific-popup/dist/magnific-popup.css';

import $ from 'jquery';

class Message extends PureComponent {
  componentDidMount() {
    var $imgs = $(ReactDOM.findDOMNode(this)).find("img");
    $imgs.each((index, el) => {
      $(el).magnificPopup({
        items: {
          src: el.src
        },
        type: 'image'
      });
    });
    
  }
  componentWillUnmount() {
    var $imgs = $(ReactDOM.findDOMNode(this)).find("img");
    $imgs.each((index, el) => {
      $(el).off('click');
      $(el).removeData('magnificPopup');
    });
  }
  render() {
    const sanitizedHTML = markdownIt()
    .use(markdownItSup)
    .use(markdownItSanitizer)
    .use(markdownItLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } })
    .render(this.props.message.get('text'));

    return (
      <div className={`rcw-${this.props.message.get('sender')}`}>
        <div className="rcw-message-text" dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
      </div>
    );
  }
}

Message.propTypes = {
  message: PROP_TYPES.MESSAGE
};

export default Message;
