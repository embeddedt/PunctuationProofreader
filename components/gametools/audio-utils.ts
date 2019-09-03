import DisplayedItem, { GameValue} from './DisplayedItem';
import Modernizr from 'modernizr';
export function playAudioIfSupported(audioFile: GameValue<string>, cb?: () => any): void {
    if(!cb)
        cb = function() {};
    if(Modernizr.audio) {
        var audio = new Audio(DisplayedItem.getValue(this, audioFile));
        audio.onerror = function() {
            cb();
        };
        audio.addEventListener("ended", cb);
        audio.play();
    } else
        cb();
}