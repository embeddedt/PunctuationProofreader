import React from 'react';
import DisplayedItem, { GameValue} from './DisplayedItem';
export function ReactGameValue(props: {val: GameValue<string>;}) {
    if(React.isValidElement(props.val)) {
        return (props.val as JSX.Element);
    }
    return <>{DisplayedItem.getValue(this, props.val)}</>;
}
export default ReactGameValue;