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
    this.caveName = '';
    this.cavesCompleted = 0;
    this.airValue = 0;
    this.demo = false;
    this.lives = 2;
    this.score = 0;
    this.hiScore = 0;
    this.lastBonusScore = 0;
    this.globalData = false;
    this.setModel('ResetModel');
  } // constructor

  setModel(model) {
    var needResizeApp = false;
    if (this.model) {
      this.model.shutdown();
      needResizeApp = true;
    }
    switch (model) {
      case 'ResetModel':
        this.model = new ResetModel(this);
        break;
      case 'MenuModel':
        this.model = new MenuModel(this);
        break;
      case 'MainModel':
        this.model = new MainModel(this);
        break;
      case 'CaveModel':
        this.model = new CaveModel(this, this.caveNumber, this.demo);
        break;
      case 'GameOverModel':
        this.model = new GameOverModel(this);
        break;
      case 'TapeLoadingModel':
        this.model = new TapeLoadingModel(this);
        break;
    } // switch
    this.model.init();
    if (needResizeApp) {
      this.resizeApp();
    }
  } // setModel
  
  startCave(demo, newGame, setInitCave) {
    if (newGame) {
      this.score = 0;
      this.cavesCompleted = 0;
      this.lastBonusScore = 0;
      this.lives = 2;
      if (setInitCave) {
        this.caveNumber = this.globalData.initCave;
      }
    }
    this.demo = demo;
    this.setModel('CaveModel');
  } // startCave

  setGlobalData(data) {
    this.globalData = data;
  } // setGlobalData

} // class GameApp

export default GameApp;
