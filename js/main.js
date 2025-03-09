/*/
const { GameApp } = await import('./gameApp.js?ver='+window.srcVersion);
const { ZXSpectrum48KPlatform } = await import('./rg-lib/js/platform/zxSpectrum/zxSpectrum48KPlatform.js?ver='+window.srcVersion);
/*/
import GameApp from './gameApp.js';
import ZXSpectrum48KPlatform from './rg-lib/js/platform/zxSpectrum/zxSpectrum48KPlatform.js';
/**/

var platform = new ZXSpectrum48KPlatform();
var gameApp = new GameApp(platform, window.wsURL);
var audio = null;

function resizeGame() {
  var elementRoot = document.documentElement;
  if (window.innerHeight != gameApp.element.height) {
    elementRoot.style.setProperty('--app-height', window.innerHeight+'px');
  }
  gameApp.resizeApp();
} // resizeGame

// main loop
function loopGame() {
  requestAnimationFrame(loopGame);
  gameApp.loopApp();
} // loopGame

// disable right click popup me
gameApp.element.oncontextmenu = function (e) {
  e.preventDefault();
};

// join mouse events
gameApp.element.onclick = function (e) { 
  gameApp.onClick(e);
};

// join resize event
window.addEventListener('resize', resizeGame);

resizeGame();  // calc actual screen size
loopGame();    // start game
