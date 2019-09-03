import React from 'react';
import DisplayedItem, { GameValue} from './DisplayedItem';
import GameTools from './GameTools';
import ReactGameValue from './ReactGameValue';
import { NavTab } from "react-router-tabs";
import { MemoryRouter as Router, Route } from "react-router-dom";
import ListComponent from './ListComponent';
export interface InfoPageItem {
    name: GameValue<string>;
    info: GameValue<string>;
}
export class InfoPage extends React.Component<{ pages: InfoPageItem[]; }> {
    navRef: React.RefObject<HTMLElement>;
    getPageFromSlug(slug: string, allowNull = false): InfoPageItem {
        let page: InfoPageItem = null;
        this.props.pages.some((pageItem) => {
            if(GameTools.slugify(DisplayedItem.getValue(null, pageItem.name)) == slug) {
                page = pageItem;
                return true;
            }
            return false;
        });
        if(!allowNull && page == null)
            throw new Error("No page found for slug: " + slug);
        return page;
    }
    getPageInfo(routeProps) {
        return <ReactGameValue val={this.getPageFromSlug(routeProps.match.params.id).info}/>;
    }
    componentDidMount() {
        let body = $(this.navRef.current).parent();
        body.addClass("gt-infopage");
        body.parent().addClass("gt-infopage-modal-content");
    }
    render() {
        let pageLinks: JSX.Element[] = [];
        this.props.pages.forEach((page) => {
            let value = DisplayedItem.getValue(null, page.name);
            pageLinks.push(<NavTab className="nav-link" activeClassName="active" to={"/" + GameTools.slugify(value)}>{value}</NavTab>);
        });
        this.navRef = React.createRef();
        return <Router>
            <nav ref={this.navRef} className="gt-infopage-navbar navbar navbar-expand-sm w-100 overflow-auto align-items-end">
                <ListComponent array={pageLinks} listType="ul" className="navbar-nav nav-fill w-100 nav-tabs d-flex flex-row align-items-end align-content-end" itemClassName="nav-item" />
            </nav>
            <div className="info-page-info">
                <Route path="/:id" render={routeProps => this.getPageInfo(routeProps)}/>
            </div>
        </Router>;
    }
}