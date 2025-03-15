/**/
const { GameApp } = await import('./gameApp.js?ver='+window.srcVersion);
const { appPlatform } = await import('./appPlatform.js?ver='+window.srcVersion);
/*/
import GameApp from './gameApp.js';
import appPlatform from './appPlatform.js';
/**/
// begin code

var gameApp = new GameApp(appPlatform, window.wsURL);
var audio = null;

function resizeGame() {
  var elementRoot = document.documentElement;
  if (window.innerHeight != gameApp.element.height) {
    elementRoot.style.setProperty('--app-height', window.innerHeight+'px');
  }
  gameApp.resizeApp();
} // resizeGame

// main loop
function loopGame(timestamp) {
  gameApp.loopApp(timestamp);
  requestAnimationFrame(loopGame);
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

resizeGame();  // calc actual model size
loopGame();    // start game
