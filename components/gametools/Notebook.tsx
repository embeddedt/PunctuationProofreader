import React from 'react';
import { GameArrayItem, toDisplayedItem } from './DisplayedItem';
import { ModalTitleBar } from './ModalUtilities';
export type NotebookItem = String&{
    noteBookLink?: GameArrayItem;
};
export function noteBookItem(itemName: String, noteBookLink?: GameArrayItem): NotebookItem {
    let item: NotebookItem = (new String(itemName) as NotebookItem);
    item.noteBookLink = noteBookLink;
    return item;
}
export class Notebook extends React.Component<{ title: string; notebookItems: Iterable<NotebookItem>; }> {
    notebookArray: Array<NotebookItem>;
    async itemOnClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        let index = parseInt($(e.target).attr("data-index"));
        if(this.notebookArray[index].noteBookLink != undefined) {
            let item = await toDisplayedItem(this.notebookArray[index].noteBookLink, null);
            await item.display();
        }
    }
    render() {
        const { title, notebookItems, ...rest } = this.props;
        this.notebookArray = Array.from(notebookItems);
        return <div className="gametools-notebook" {...rest}>
            <div className="lines"></div>
            <ModalTitleBar title={this.props.title}/>
            <ul>
                {this.notebookArray.map((item, index) => <li className={item.noteBookLink !== undefined ? "gt-notebook-clickable": ""} data-index={index} key={index} onClick={this.itemOnClick.bind(this)}>{item}</li>)}
            </ul>
            {this.props.children}
        </div>;
    }
}
export default Notebook;