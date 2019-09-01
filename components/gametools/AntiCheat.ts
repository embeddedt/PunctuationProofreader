import BrowserDetect from '../browserdetect.js';
import '../shortcut.js';
let inter;

export function startCheck() {
    let cheated = () => {
        document.open();
        document.write('<h1>Are you trying to cheat?</h1><p><i>Those seeing this page may be cheaters.<br/>Don\'t be a cheater.</i></p><p>If you didn\'t mean to cheat, your device was probably running slowly and triggered the anti-cheat mechanism. Refresh the page and try again.</p><p>P.S. F12, Ctrl+U, and Ctrl+Shift+I are all ways to open Developer Tools - an easy way to cheat (except in this game).</p>');
        document.close();
        stopCheck();
        setTimeout(cheated, 2000);
    };
    stopCheck();

    if(process.env.NODE_ENV == 'production') {
        inter = setInterval(function() {
            var minimalUserResponseInMiliseconds = 500;
            var before = new Date().getTime();
            const dbg = new Function("debugger;");
            dbg();
            var after = new Date().getTime();
            if (after - before > minimalUserResponseInMiliseconds) { // user had to resume the script manually via opened dev tools 
                cheated();
            }
        }, 1000);
        (window as any).shortcut.add("F12", cheated);
        (window as any).shortcut.add("Ctrl+F12", cheated);
        (window as any).shortcut.add("Shift+F12", cheated);
        (window as any).shortcut.add("Ctrl+Alt+F12", cheated);
        (window as any).shortcut.add("Shift+Alt+F12", cheated);
        (window as any).shortcut.add("Ctrl+Shift+Alt+F12", cheated);
        (window as any).shortcut.add("Alt+F12", cheated);
        (window as any).shortcut.add("Ctrl+U", cheated);
        (window as any).shortcut.add("Ctrl+Shift+I", cheated);
    }
    
      
}

export function stopCheck() {
    clearInterval(inter);
}