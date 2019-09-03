import React from 'react';
import GameTools from './GameTools';
export class SpinningClock extends React.Component<{ startHourAngle?: number; startMinuteAngle?: number; startSecondAngle?: number;}> {
    render() {
        return <div className="clocks single local linear clock-fast">
            <article className="clock ios7 show">
                <div className="hours-container">
                    <div className="hours angled" style={{transform: `rotateZ(${GameTools.pl_undef(this.props.startHourAngle, 0)}deg`}}></div>
                </div>
                <div className="minutes-container">
                    <div className="minutes angled" style={{transform: `rotateZ(${GameTools.pl_undef(this.props.startMinuteAngle, 0)}deg`}}></div>
                </div>
                <div className="seconds-container">
                    <div className="seconds angled" style={{transform: `rotateZ(${GameTools.pl_undef(this.props.startSecondAngle, 0)}deg`}}></div>
                </div>
            </article>
        </div>;
    }
}
export default SpinningClock;