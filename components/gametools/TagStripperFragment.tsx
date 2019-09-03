import React from 'react';
import '../dom-polyfills.js';
export class TagStripperFragment extends React.Component<{ strippedTags: string[]; }> {
    domRef: React.RefObject<HTMLDivElement>;
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        let div = this.domRef.current;
        this.props.strippedTags.forEach((tag) => {
            let items = div.querySelectorAll(tag);
            items.forEach((item) => {
                item.replaceWith(...Array.from(item.childNodes));
            });
        });
    }
    render() {
        this.domRef = React.createRef();
        return <div ref={this.domRef}>{this.props.children}</div>;
    }
}
export default TagStripperFragment;