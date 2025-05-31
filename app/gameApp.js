/**/
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { ResetModel } = await import('./resetModel.js?ver='+window.srcVersion);
const { MenuModel } = await import('./menuModel.js?ver='+window.srcVersion);
const { MainModel } = await import('./mainModel.js?ver='+window.srcVersion);
const { CavernModel } = await import('./cavernModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
const { TapeLoadingModel } = await import('./tapeLoadingModel.js?ver='+window.srcVersion);
const { AudioWorkletHandler } = await import('./svision/js/audioWorkletHandler.js?ver='+window.srcVersion);
/*/
import AbstractApp from './svision/js/abstractApp.js';
import ResetModel from './resetModel.js';
import MenuModel from './menuModel.js';
import MainModel from './mainModel.js';
import CavernModel from './cavernModel.js';
import GameOverModel from './gameOverModel.js';
import TapeLoadingModel from './tapeLoadingModel.js';
import AudioWorkletHandler from './svision/js/audioWorkletHandler.js';
/**/
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, importPath, wsURL) {
    super(platform, 'bodyApp', importPath, wsURL);

    this.sounds = 0.3;
    this.music = 0.3;

    this.cavernNumber = false;
    this.globalData = false;
    this.model = this.newModel('ResetModel');
    this.model.init();
  } // constructor

  initAfterUserGesture() {
    super.initAfterUserGesture();

    if (this.sounds > 0) {
      this.audioManager.openChannel('sounds', new AudioWorkletHandler(this));
    }
    if (this.music > 0) {
      this.audioManager.openChannel('music', new AudioWorkletHandler(this));
    }
  } // initAfterUserGesture

  newModel(model) {
    switch (model) {
      case 'ResetModel': return new ResetModel(this);
      case 'MenuModel': return new MenuModel(this);
      case 'MainModel': return new MainModel(this);
      case 'CavernModel': return new CavernModel(this, this.cavernNumber);
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
