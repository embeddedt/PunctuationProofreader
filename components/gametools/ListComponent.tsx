
import React from 'react';
export interface ListComponentProps{
    array: any[];
    listType: "ul" | "ol";
    itemClassName?: string;
    onClick?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
}
export class ListComponent extends React.Component<ListComponentProps & React.HTMLProps<HTMLOListElement | HTMLUListElement>> {
    render() {
        const { array, listType, itemClassName, onClick, ...rest } = this.props;
        const ListType = listType;
        return <ListType {...rest as unknown}>
            {array.map((item, index) => <li className={itemClassName} onClick={onClick} data-index={index} key={index}>{item}</li>)}
        </ListType>;
    }
}
export default ListComponent;