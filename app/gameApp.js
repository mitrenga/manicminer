/**/
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { AudioManager } = await import('./audioManager.js?ver='+window.srcVersion);
const { ResetModel } = await import('./resetModel.js?ver='+window.srcVersion);
const { MenuModel } = await import('./menuModel.js?ver='+window.srcVersion);
const { MainModel } = await import('./mainModel.js?ver='+window.srcVersion);
const { CaveModel } = await import('./caveModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
const { TapeLoadingModel } = await import('./tapeLoadingModel.js?ver='+window.srcVersion);
/*/
import AbstractApp from './svision/js/abstractApp.js';
import AudioManager from './audioManager.js';
import ResetModel from './resetModel.js';
import MenuModel from './menuModel.js';
import MainModel from './mainModel.js';
import CaveModel from './caveModel.js';
import GameOverModel from './gameOverModel.js';
import TapeLoadingModel from './tapeLoadingModel.js';
/**/
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, importPath, wsURL) {
    super(platform, 'bodyApp', importPath, wsURL);

    this.audioManager = new AudioManager(this);

    this.caveNumber = false;
    this.globalData = false;
    this.model = this.newModel('ResetModel');
    this.model.init();
  } // constructor

  newModel(model) {
    switch (model) {
      case 'ResetModel': return new ResetModel(this);
      case 'MenuModel': return new MenuModel(this);
      case 'MainModel': return new MainModel(this);
      case 'CaveModel': return new CaveModel(this, this.caveNumber);
      case 'GameOverModel': return new GameOverModel(this);
      case 'TapeLoadingModel': return new TapeLoadingModel(this);
    } // switch
    return null;
  } // newModel
  
  setGlobalData(data) {
    this.globalData = data;
  } // setGlobalData

} // class GameApp

export default GameApp;
