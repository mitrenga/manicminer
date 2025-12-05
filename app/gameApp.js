/**/
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { AudioManager } = await import('./audioManager.js?ver='+window.srcVersion);
const { ZXFonts8x8 } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxFonts8x8.js?ver='+window.srcVersion);
const { Fonts5x5 } = await import('./svision/js/platform/canvas2D/fonts5x5.js?ver='+window.srcVersion);
const { Fonts3x3 } = await import('./svision/js/platform/canvas2D/fonts3x3.js?ver='+window.srcVersion);
const { ZXResetModel } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxResetModel.js?ver='+window.srcVersion);
const { MenuModel } = await import('./menuModel.js?ver='+window.srcVersion);
const { MainModel } = await import('./mainModel.js?ver='+window.srcVersion);
const { CaveModel } = await import('./caveModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
const { TapeLoadingModel } = await import('./tapeLoadingModel.js?ver='+window.srcVersion);
const { ZXErrorEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxErrorEntity.js?ver='+window.srcVersion);
/*/
import AbstractApp from './svision/js/abstractApp.js';
import AudioManager from './audioManager.js';
import ZXFonts8x8 from './svision/js/platform/canvas2D/zxSpectrum/zxFonts8x8.js';
import Fonts5x5 from './svision/js/platform/canvas2D/fonts5x5.js';
import Fonts3x3 from './svision/js/platform/canvas2D/fonts3x3.js';
import ZXResetModel from './svision/js/platform/canvas2D/zxSpectrum/zxResetModel.js';
import MenuModel from './menuModel.js';
import MainModel from './mainModel.js';
import CaveModel from './caveModel.js';
import GameOverModel from './gameOverModel.js';
import TapeLoadingModel from './tapeLoadingModel.js';
import ZXErrorEntity from './svision/js/platform/canvas2D/zxSpectrum/zxErrorEntity.js';
/**/
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, importPath, wsURL) {
    super(platform, 'bodyApp', importPath, wsURL);

    this.audioManager = new AudioManager(this);
    this.muted = {sounds: false, music: false};

    this.fonts = {
      zxFonts8x8Mono: new ZXFonts8x8(this, false),
      zxFonts8x8: new ZXFonts8x8(this, true),
      zxFonts8x8Keys: new ZXFonts8x8(this, false),
      fonts5x5: new Fonts5x5(this),
      fonts3x3: new Fonts3x3(this)
    };
    this.fonts.zxFonts8x8Keys.setFontsData('00000000000000000010101010001000002424000000000014147E28FC505000107C507C14547C1042A44810244A8400001028102A443A00000810000000000000182020202018000030080808083000000014083E081400000008083E0808000000000000080810000000003E00000000000000001818000204081020408000007C4C5454647C000018280808083E00007C440438407C00007C441804447C00001828487E081C00007C407C04447C00007C407C44447C00007C440810101000007C443844447C00007C44447C047C000000001000001000000010000010102000000408100804000000003E003E00000000100804081000007C441C100010003C42BD85BDA5BE78003C42427E42E70000FC427C4242FC00007E424040427E0000FE42424242FE0000FE42784042FE0000FE42784040E000007E42404E427E0000E7427E4242E700007C101010107C00007E08080848780000E648705844E60000E040404242FE0000C3665A4242E70000C762524A46E700007E424242427E0000FE42427E40E000007E424242527E0800FE42427E44E700007E407E02427E0000FE92101010380000CE444444447E0000E742424224180000D7929292926C0000EE44382844EE0000EE442810103800007E440810227E001C10101010101C0000004020100804003808080808083800001038541010100000000000000000FF003C247020207C0000007C047C447E00C0407C4444447C0000007C4440407C000C047C4444447E0000007C447C407C003C2470202020700000007C44447C047CC0407C444444E6001000701010107C000800380808084878C0404C506058CC007010101010107C000000FC545454D6000000FC444444E60000007C4444447C0000007E22223E207000007C44447C040600007C242020700000007C407C04FC0000207820202038000000CC4444447E000000CE44442838000000D65454547E000000C6281028C6000000CC44447C047C00007E4418227E00000E083008080E0000080808080808000070100C1010700000142800000000003C4299A1A199423C');

    this.controls = {
      keyboard: this.getControls('keyboard'),
      mouse: this.getControls('mouse'),
      touchscreen: this.getControls('touchscreen'),
      gamepads: this.getControls('gamepads')
    };

    this.caveNumber = false;
    this.caveName = '';
    this.cavesCompleted = 0;
    this.airValue = 0;
    this.demo = false;
    this.lives = 2;
    this.score = 0;
    this.hiScore = 0;
    this.lastBonusScore = 0;
    this.playerName = this.readCookie('playerName', '');
    this.globalData = false;
    this.setModel('LoadingModel');
  } // constructor

  getControls(device) {
    var result = {};
    switch(device) {
      case 'keyboard': 
        result = {left: 'ArrowLeft', right: 'ArrowRight', jump: ' ', music: 'M', sounds: 'S'};
        break;
      case 'mouse': 
        result = {enable: false, left: 'Mouse1', right: 'Mouse2', jump: 'Mouse4'};
        break;
      case 'touchscreen':
        result = {supported: false, type: 'jump-left-right'};
        break;
      case 'gamepads': 
        result = {supported: false, devices: {}};
        break;
    }
    switch (device) {
      case 'keyboard':
      case 'mouse':
        var cfgString = this.readCookie(device, false);
        if (cfgString !== false) {
          try {
            var cfg = JSON.parse(cfgString);
            Object.keys(cfg).forEach((item) => {
              result[item] = cfg[item];
            });
          } catch (error) {
            console.error(error.message);
          }
        }
        break;
      case 'touchscreen':
        break;
      case 'gamepads':
        var devicesString = this.readCookie('gamepads', false);
        if (devicesString !== false) {
          try {
            var devices = JSON.parse(devicesString);
          } catch (error) {
            console.error(error.message);
          } finally {
            if (Array.isArray(devices)) {
              devices.forEach((id) => {
                var deviceString = this.readCookie(id, false);
                if (deviceString !== false) {
                  try {
                    var device = JSON.parse(deviceString);
                  } catch (error) {
                    console.error(error.message);
                  } finally {
                    result.devices[id] = device;
                  }
                }
              });
            }
          }
        }
        break;
    }
    return result;
  } // getControls

  setModel(model) {
    var needResizeApp = false;
    var selectionItem = 0;
    if (this.model) {
      if (this.model.id == 'TapeLoadingModel') {
        selectionItem = 6;
      }
      this.model.shutdown();
      needResizeApp = true;
    }
    switch (model) {
      case 'LoadingModel':
        this.model = new ZXResetModel(this);
        break;
      case 'MenuModel':
        this.model = new MenuModel(this, selectionItem);
        break;
      case 'MainModel':
        this.model = new MainModel(this);
        break;
      case 'CaveModel':
        this.model = new CaveModel(this, this.caveNumber, this.demo);
        break;
      case 'GameExitModel':
        this.model = new GameOverModel(this, false, 'MenuModel');
        break;
      case 'GameOverModel':
        this.model = new GameOverModel(this, true, 'MainModel');
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
    this.globalData = data.data.global;

    Object.keys(data.data).forEach((key) => {
      if (key == 'hiScore') {
        this.hiScore = data.data[key];
      } else {
        this.saveDataToStorage(key, data.data[key]);
      }
    });
  } // setGlobalData

  showErrorMessage(message, action) {
    var topModalEntity = this.model.desktopEntity.topModalEntity();
    topModalEntity.addModalEntity(
      new ZXErrorEntity(
        topModalEntity,
        -topModalEntity.absoluteX(),
        -topModalEntity.absoluteY(),
        this.fonts.zxFonts8x8,
        message,
        action,
        this.platform.colorByName('white'),
        this.platform.colorByName('red')
      )
    );
  } // showErrorMessage
  
} // GameApp

export default GameApp;
