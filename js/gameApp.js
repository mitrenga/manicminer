/*/
const { AbstractApp } = await import('./rg-lib/js/abstractApp.js?ver='+window.srcVersion);
const { IntroScreen } = await import('./introScreen.js?ver='+window.srcVersion);
const { CavernScreen } = await import('./cavernScreen.js?ver='+window.srcVersion);
const { GameOverScreen } = await import('./gameOverScreen.js?ver='+window.srcVersion);
/*/
import AbstractApp from './rg-lib/js/abstractApp.js';
import IntroScreen from './introScreen.js';
import CavernScreen from './cavernScreen.js';
import GameOverScreen from './gameOverScreen.js';
/**/

export class GameApp extends AbstractApp {
  
  constructor(platform, wsURL) {
    super(platform, wsURL);

    this.cavernNumber = 0;
    this.screen = this.newScreen('IntroScreen');
    this.screen.init();
  } // constructor

  newScreen(screen) {
    switch (screen) {
      case 'IntroScreen': return new IntroScreen(this, this.ctx);
      case 'CavernScreen': return new CavernScreen(this, this.ctx, this.cavernNumber);
      case 'GameOverScreen': return new GameOverScreen(this, this.ctx);
    } // switch
    return null;
  } // newScreen
  
  onClick(e) {
    super.onClick(e);
  
    var prevScreenID = this.screen.id; 
    this.screen = null;
    switch (prevScreenID) {
      case 'IntroScreen': 
        this.cavernNumber = 0;
        this.screen = this.newScreen('CavernScreen');
        break;
      case 'CavernScreen': 
        this.cavernNumber++;
        if (this.cavernNumber < 20) {
          this.screen = this.newScreen('CavernScreen');
        } else {
          this.screen = this.newScreen('GameOverScreen');
        }
        break;
      case 'GameOverScreen': 
        this.screen = this.newScreen('IntroScreen');
        break;
    }
    this.screen.init();
    this.resizeApp();
  } // onClick

} // class GameApp

export default GameApp;
