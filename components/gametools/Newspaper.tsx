import React from 'react';
import { GameValue } from './DisplayedItem';
import { ModalCloseButton } from './ModalUtilities';
import ReactGameValue from './ReactGameValue';
export interface NewspaperArticle {
    headline: GameValue<string>;
    subhead?: GameValue<string>;
    content: GameValue<string>;
}

export function NewspaperFigure(props: { src: string; caption?: string }) {
    return <figure className="media">
        <div className="figure-img">
            <img src={props.src} alt={props.caption}/>
        </div>
        <figcaption>{props.caption}</figcaption>
    </figure>;
}
export class Newspaper extends React.Component<{ paperName: GameValue<string>; subhead?: GameValue<string>; articles: NewspaperArticle[]; }> {
    private static importedCss = false;
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="newspaper">
            <div className="head modal-header">
                <div className="newspaper-headline"><ReactGameValue val={this.props.paperName}/></div>
                <ModalCloseButton/>
            </div>
            <div className="subhead">
            <ReactGameValue val={this.props.subhead}/>
            </div>
            <div className="content">
                <div className="columns">
                {this.props.articles.map((article, index) => <div key={index} className="column">
                    <div className="head">
                        <span className="headline hl3"><ReactGameValue val={article.headline}/></span>
                        <p></p>
                        <span className="headline hl4"><ReactGameValue val={article.subhead}/></span>
                    </div>
                    {article.content}
                </div>)}
                </div>
            </div>
        </div>;
    }
    
}
export default Newspaper;