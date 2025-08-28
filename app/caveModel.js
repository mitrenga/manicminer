/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { AirEntity } = await import('./airEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from '././svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import GameAreaEntity from './gameAreaEntity.js';
import AirEntity from './airEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
import SpriteEntity from '././svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class CaveModel extends AbstractModel {
  
  constructor(app, caveNumber, demo) {
    super(app);
    this.id = 'CaveModel';

    this.caveNumber = caveNumber;
    this.gameAreaEntity = null;
    this.airEntity = null;
    this.gameClock = 0;
    this.airSupply = 63;
    this.bkCaveNameEntity = null;
    this.hiScoreEntity = null;
    this.scoreEntity = null;
    this.liveEntities = [];
    this.demo = demo;
    this.bkAnimation = false;

    this.initData = {'info': [
      0, // counter
      0, // counter2
      0, // counter4
      0, // counter6
      demo,
      false, // crash
      this.app.score
    ]};

    this.worker = new Worker(this.app.importPath+'/gameWorker.js?ver='+window.srcVersion);
    this.worker.onmessage = (event) => {

      if (this.demo && this.app.audioManager.music == 0 && event.data.gameData.info[0] == 80) {
        this.sendEvent(1, {'id': 'newDemoCave'});
      }

      switch (event.data.id) {
        case 'update':
          if (this.bkAnimation !== false) {
            this.gameAreaEntity.bkColor = this.app.platform.color(this.bkAnimation);
            if (this.bkAnimation >= 0) {
              this.bkAnimation--;
            } else {
              this.bkAnimation = false;
            }
            if (this.bkAnimation < 0) {
              this.gameAreaEntity.restoreBkColor();
              this.bkAnimation = false;
            }
          }
          Object.keys(event.data.gameData).forEach((objectsType) => {
            switch (objectsType) {
              case 'info':
                var ptrClock = event.data.gameData.info[0]+this.gameClock;
                if (event.data.gameData.info[0] < 2) {
                  ptrClock = event.data.gameData.info[0];
                }
                var maxClock = (this.airSupply-36+1)*(256/4);
                if (ptrClock > maxClock) {
                  this.sendEvent(0, {'id': 'gameOver'});
                }
                if (event.data.gameData.info[5]) {
                  this.sendEvent(0, {'id': 'gameOver'});
                }
                this.airEntity.value = 1-(ptrClock/maxClock);
                if (this.app.score != event.data.gameData.info[6]) {
                  this.app.score = event.data.gameData.info[6];
                  this.scoreEntity.setText(this.app.score.toString().padStart(6, '0'));
                  if (this.app.lives < 16 && this.app.lastBonusScore+10000 <= this.app.score) {
                    this.app.lastBonusScore += 10000;
                    this.liveEntities[this.app.lives].hide = false;
                    this.app.lives++;
                    this.bkAnimation = 7;
                  }
                }
                for (var l = 0; l < this.app.lives; l++) {
                  this.liveEntities[l].x = event.data.gameData.info[3]%4*2+l*16;
                  this.liveEntities[l].frame = event.data.gameData.info[3]%4;
                }                
                break;
                
              case 'floors':
              case 'walls':
              case 'nasties':
              case 'extra':
                break;

              default:  
                this.gameAreaEntity.updateData(event.data, objectsType);
            }
          });
          break;

        case 'playSound':
          this.sendEvent(0, {'id': 'playSound', 'channel': event.data.channel, 'sound': event.data.sound, 'options': false});
          break;

        case 'stopChannel':
          this.sendEvent(0, {'id': 'stopChannel', 'channel': event.data.channel});
          break;

        case 'caveDone':
          this.sendEvent(0, {'id': 'newCave'});
          break;
      }
    } // onmessage

    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', 'cave'+this.caveNumber.toString().padStart(2, '0')+'.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setCaveData', 'data': data});
      }
    }
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.gameAreaEntity = new GameAreaEntity(this.desktopEntity, 0, 0, 32*8, 16*8, this.caveNumber, this.initData, this.demo);
    this.desktopEntity.addEntity(this.gameAreaEntity);
    this.caveNameEntity = new ZXTextEntity(this.desktopEntity, 0, 16*8, 32*8, 8, '', this.app.platform.colorByName('black'), this.app.platform.colorByName('yellow'), 0, true);
    this.caveNameEntity.justify = 2;
    this.desktopEntity.addEntity(this.caveNameEntity);
    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 0, 17*8, 4*8, 8, 'AIR', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightRed'), 0, true));
    this.airEntity = new AirEntity(this.desktopEntity, 4*8, 17*8, 28*8, 8, 1.0);
    this.desktopEntity.addEntity(this.airEntity);
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 18*8, 32*8, 8, false, this.app.platform.colorByName('black')));
    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 0, 19*8, 10*8, 8, 'High Score', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true));
    this.hiScoreEntity = new ZXTextEntity(this.desktopEntity, 10*8, 19*8, 10*8, 8, this.app.hiScore.toString().padStart(6, '0'), this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, false);
    this.desktopEntity.addEntity(this.hiScoreEntity);
    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 20*8, 19*8, 6*8, 8, 'Score', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true));
    this.scoreEntity = new ZXTextEntity(this.desktopEntity, 26*8, 19*8, 6*8, 8, this.app.score.toString().padStart(6, '0'), this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, false);
    this.desktopEntity.addEntity(this.scoreEntity);
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 20*8, 32*8, 8, false, this.app.platform.colorByName('black')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 21*8, 32*8, 3*8, false, this.app.platform.colorByName('black')));
    for (var l = 0; l < 16; l++) {
      this.liveEntities[l] = new SpriteEntity(this.desktopEntity, l*16, 21*8, this.app.platform.colorByName('brightCyan'), false, 0, 0);
      this.desktopEntity.addEntity(this.liveEntities[l]);
      if (l >= this.app.lives) {
        this.liveEntities[l].hide = true;
      }
    }

    this.sendEvent(330, {'id': 'changeFlashState'});

    if (this.app.audioManager.music > 0) {
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'music'});
      if (this.demo) {
        this.sendEvent(500, {'id': 'playSound', 'channel': 'music', 'sound': 'inGameMelody', 'options': {'caveNumber': this.caveNumber, 'demo': true}});
      } else {
        this.sendEvent(500, {'id': 'playSound', 'channel': 'music', 'sound': 'inGameMelody', 'options': {'repeat': true, 'caveNumber': this.caveNumber, 'demo': false}});
      }
    }
    if (this.app.audioManager.sounds > 0) {
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'sounds'});
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'extra'});
    }
  } // init

  shutdown() {
    super.shutdown();
    this.worker.terminate();
    this.worker = null;
  } // shutdown

  setData(data) {
    this.caveNameEntity.setText(data.name);
    this.gameClock = (256-this.app.hexToInt(data.gameClock))/4;
    this.airSupply = this.app.hexToInt(data.airSupply);
    this.borderEntity.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.borderColor), 7, 1);
    for (var l = 0; l < 16; l++) {
      this.liveEntities[l].setGraphicsData(data.willy);
    }
    super.setData(data);
    this.worker.postMessage({'id': 'init', 'initData': this.initData});
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'setCaveData':
        var willy = Object.assign(
          event.data.willy,
          {
            'sprite': this.app.globalData.willy.sprite,
            'paintCorrections': this.app.globalData.willy.paintCorrections,
            'width': this.app.globalData.willy.width,
            'height': this.app.globalData.willy.height,
            'frames': this.app.globalData.willy.frames,
            'directions': this.app.globalData.willy.directions,
            'attribute': this.app.globalData.willy.attribute
          }
        );
        this.setData(Object.assign(event.data, {'willy': willy}));
        return true;

      case 'keyPress':
        if (this.demo) {
          this.app.model.shutdown();
          this.app.model = this.app.newModel('MainModel');
          this.app.model.init();
          this.app.resizeApp();
          return true;
        }
        switch (event.key) {
          case 'Escape':
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 9*8, 5*8, 14*8+1, 14*8+2, this.borderEntity.bkColor));
            return true;
          case 'ArrowRight':
            this.worker.postMessage({'id': 'controls', 'action': 'right', 'value': true});
            return true;
          case 'ArrowLeft':
            this.worker.postMessage({'id': 'controls', 'action': 'left', 'value': true});
            return true;
          case 'ArrowUp':
          case ' ':
            this.worker.postMessage({'id': 'controls', 'action': 'jump', 'value': true});
            return true;
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'ArrowRight':
            this.worker.postMessage({'id': 'controls', 'action': 'right', 'value': false});
            return true;
          case 'ArrowLeft':
            this.worker.postMessage({'id': 'controls', 'action': 'left', 'value': false});
            return true;
          case 'ArrowUp':
          case ' ':
            this.worker.postMessage({'id': 'controls', 'action': 'jump', 'value': false});
            return true;
        }
        break;

      case 'mouseClick':
        if (this.demo) {
          this.app.model.shutdown();
          this.app.model = this.app.newModel('MainModel');
          this.app.model.init();
          this.app.resizeApp();
          return true;
        }
        break;

      case 'newCave':
        this.app.model.shutdown();
        if (this.app.caveNumber < this.app.globalData.cavesCount-1) {
          this.app.caveNumber = this.app.caveNumber+1;
        } else {
          this.app.caveNumber = this.app.globalData.initCave;
        }
        this.app.model = this.app.newModel('CaveModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;

      case 'newDemoCave':
        this.app.model.shutdown();
        if (this.app.caveNumber < this.app.globalData.cavesCount-1) {
          this.app.caveNumber = this.app.caveNumber+1;
          this.app.demo = true;
          this.app.model = this.app.newModel('CaveModel');
        } else {
          this.app.model = this.app.newModel('MainModel');
        }
        this.app.model.init();
        this.app.resizeApp();
        return true;
    
      case 'gameOver':
        this.app.model.shutdown();
        this.app.model = this.app.newModel('MainModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;

    }

    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);
    this.drawModel();
  } // loopModel

} // class CaveModel

export default CaveModel;
