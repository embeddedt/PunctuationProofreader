import React from 'react';
import GameTools from './GameTools';
export class ZoomableSVG extends React.Component<{ src: string; visibleLayers?: string[]; extraClasses?: string; style?: React.CSSProperties; }, {svg_html: string; }> {
    imgRef: React.RefObject<HTMLDivElement>;
    constructor(props) {
        super(props);
        this.state = { svg_html: null };
        this.imgRef = React.createRef();
    }
    makeMagnific(img, add = true) {
        if(img == null)
            return;
        if(add) {
            let svg = $(img).find("svg").get(0) as SVGElement;
            GameTools.patchSVGLayers(svg, this.props.visibleLayers);
            try {
                let str = new XMLSerializer().serializeToString(svg);
                console.log("Successfully serialized");
                let deserialized = new DOMParser().parseFromString(str, "text/xml");
                console.log("Successfully deserialized");
            } catch(e) {
                /* Probably IE having a fit */
                console.log("Detected SVG load failure, bailing");
                $(img).removeClass("gt-preview-image gt-svg-preview-image mfp-popup-wrapper");
                return;
            }
            const uri = GameTools.toDataURI($(img).html());
            ($(img) as any).magnificPopup({
                items: {
                    src: uri
                },
                type: 'image'
            });
        } else {
            $(img).off('click');
            $(img).removeData('magnificPopup');
        }
        
    }
    componentDidMount() {
        this.makeMagnific(this.imgRef.current);
    }
    componentWillUnmount() {
        this.makeMagnific(this.imgRef.current, false);
    }
    componentDidUpdate() {
        this.makeMagnific(this.imgRef.current);
    }
    render() {
        if(this.state.svg_html != undefined && this.state.svg_html != null)
            return <div style={this.props.style} ref={this.imgRef}
                className={"gt-preview-image gt-svg-preview-image mfp-popup-wrapper " + (this.props.extraClasses == undefined ? "" : this.props.extraClasses)}
                dangerouslySetInnerHTML={{ __html: this.state.svg_html}}></div>;
        else {
            $.get(this.props.src, (data) => {
                this.setState({ svg_html: data });
            }, "text");
            return null;
        }
    }
}
export default ZoomableSVG;