/**/
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { IntroModel } = await import('./introModel.js?ver='+window.srcVersion);
const { CavernModel } = await import('./cavernModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
/*/
import AbstractApp from './svision/js/abstractApp.js';
import IntroModel from './introModel.js';
import CavernModel from './cavernModel.js';
import GameOverModel from './gameOverModel.js';
/**/
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, wsURL) {
    super(platform, 'bodyApp',  wsURL);

    this.cavernsCount = 0;
    this.initCavern = 0;
    this.willyData = [];
    this.model = this.newModel('IntroModel');
    this.model.init();
  } // constructor

  newModel(model) {
    switch (model) {
      case 'IntroModel': return new IntroModel(this);
      case 'CavernModel': return new CavernModel(this, this.cavernNumber);
      case 'GameOverModel': return new GameOverModel(this);
    } // switch
    return null;
  } // newModel
  
  onClick(e) {
    super.onClick(e);
  
    var prevModelID = this.model.id; 
    this.model = null;
    switch (prevModelID) {
      case 'IntroModel': 
        this.cavernNumber = this.initCavern;
        this.model = this.newModel('CavernModel');
        break;
      case 'CavernModel': 
        this.cavernNumber++;
        if (this.cavernNumber < this.cavernsCount) {
          this.model = this.newModel('CavernModel');
        } else {
          this.model = this.newModel('GameOverModel');
        }
        break;
      case 'GameOverModel': 
        this.model = this.newModel('IntroModel');
        break;
    }
    this.model.init();
    this.resizeApp();
  } // onClick

  setGlobalData(data) {
    this.cavernsCount = data['cavernsCount'];
    this.initCavern = data['initCavern'];
    this.willyData = data['willy']['data'];
  } // setGlobalData

} // class GameApp

export default GameApp;
