/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import GameAreaEntity from './gameAreaEntity.js';
import GameInfoEntity from './gameInfoEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class CaveModel extends AbstractModel {
  
  constructor(app, caveNumber, demo) {
    super(app);
    this.id = 'CaveModel';

    this.caveNumber = caveNumber;
    this.gameAreaEntity = null;
    this.gameInfoEntity = null;
    this.gameClock = 0;
    this.airSupply = 63;
    this.demo = demo;
    this.bkAnimation = false;
    this.crashTime = false;

    this.initData = {'info': [
      0, // counter
      0, // counter2
      0, // counter4
      0, // counter6
      demo,
      false, // crash
      this.app.score,
      0 // light beam touches
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
                var ptrClock = event.data.gameData.info[0]+event.data.gameData.info[7]+this.gameClock;
                if (event.data.gameData.info[0] < 2) {
                  ptrClock = event.data.gameData.info[0];
                }
                var maxClock = (this.airSupply-36+1)*(256/4);
                if (ptrClock > maxClock) {
                  this.sendEvent(1, {'id': 'crash'});
                }
                if (event.data.gameData.info[5]) {
                  this.sendEvent(1, {'id': 'crash'});
                }
                this.app.airValue = 1-(ptrClock/maxClock);
                this.gameInfoEntity.airEntity.value = this.app.airValue;
                if (this.app.score != event.data.gameData.info[6]) {
                  this.app.score = event.data.gameData.info[6];
                  this.gameInfoEntity.scoreEntity.setText(this.app.score.toString().padStart(6, '0'));
                }
                for (var l = 0; l < this.app.lives; l++) {
                  this.gameInfoEntity.liveEntities[l].x = event.data.gameData.info[3]%4*2+l*16;
                  this.gameInfoEntity.liveEntities[l].frame = event.data.gameData.info[3]%4;
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

        case 'stopAudioChannel':
          this.sendEvent(0, {'id': 'stopAudioChannel', 'channel': event.data.channel});
          break;

        case 'caveDone':
          var portal = this.gameAreaEntity.spriteEntities.portal[0];
          /*portal.hide = true;
          var fishEntity = new SpriteEntity(this.gameAreaEntity, portal.x, portal.y, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.escape.fish.attribute)), false, 0, 0);
          this.gameAreaEntity.addEntity(fishEntity);
          fishEntity.setGraphicsData(this.app.globalData.escape.fish);
          var swordEntity = new SpriteEntity(this.gameAreaEntity, portal.x, portal.y+8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.escape.sword.attribute)), false, 0, 0);
          this.gameAreaEntity.addEntity(swordEntity);
          swordEntity.setGraphicsData(this.app.globalData.escape.sword);*/
          var ptrClock = event.data.gameData.info[0]+event.data.gameData.info[7]+this.gameClock;
          var maxClock = (this.airSupply-36+1)*(256/4);
          var remainderAirSupply = Math.round(this.airSupply-ptrClock/maxClock*(this.airSupply-36+1)+1);
          console.log(maxClock-ptrClock+' '+remainderAirSupply);
          this.app.score += maxClock-ptrClock;
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

  postWorkerMessage(message) {
    if (this.worker) {
      this.worker.postMessage(message);
    }
  } // postWorkerMessage


  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.desktopEntity.bkColor = this.app.platform.colorByName('black');
    this.gameAreaEntity = new GameAreaEntity(this.desktopEntity, 0, 0, 32*8, 16*8, this.caveNumber, this.initData, this.demo);
    this.desktopEntity.addEntity(this.gameAreaEntity);
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);

    this.sendEvent(330, {'id': 'changeFlashState'});

    this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'music'});
    if (this.demo) {
      this.sendEvent(500, {'id': 'playSound', 'channel': 'music', 'sound': 'inGameMelody', 'options': {'caveNumber': this.caveNumber, 'demo': true}});
    } else {
      this.sendEvent(500, {'id': 'playSound', 'channel': 'music', 'sound': 'inGameMelody', 'options': {'repeat': true, 'caveNumber': this.caveNumber, 'demo': false}});
    }
    this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'sounds'});
    this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'extra'});
  } // init

  shutdown() {
    super.shutdown();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  } // shutdown

  setData(data) {
    this.gameInfoEntity.caveNameEntity.setText(data.name);
    this.app.caveName = data.name;
    this.gameClock = (256-this.app.hexToInt(data.gameClock))/4;
    this.airSupply = this.app.hexToInt(data.airSupply);
    this.borderEntity.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.borderColor), 7, 1);
    for (var l = 0; l < 16; l++) {
      this.gameInfoEntity.liveEntities[l].setGraphicsData(data.willy);
    }
    super.setData(data);
    this.postWorkerMessage({'id': 'init', 'initData': this.initData});
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
          this.app.setModel('MainModel');
          return true;
        }
        switch (event.key) {
          case 'Escape':
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 9*8, 5*8, 14*8+1, 14*8+2, this.borderEntity.bkColor));
            return true;
          case 'ArrowRight':
            this.postWorkerMessage({'id': 'controls', 'action': 'right', 'value': true});
            return true;
          case 'ArrowLeft':
            this.postWorkerMessage({'id': 'controls', 'action': 'left', 'value': true});
            return true;
          case 'ArrowUp':
          case ' ':
            this.postWorkerMessage({'id': 'controls', 'action': 'jump', 'value': true});
            return true;
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'ArrowRight':
            this.postWorkerMessage({'id': 'controls', 'action': 'right', 'value': false});
            return true;
          case 'ArrowLeft':
            this.postWorkerMessage({'id': 'controls', 'action': 'left', 'value': false});
            return true;
          case 'ArrowUp':
          case ' ':
            this.postWorkerMessage({'id': 'controls', 'action': 'jump', 'value': false});
            return true;
        }
        break;

      case 'mouseClick':
        if (this.demo) {
          this.app.setModel('MainModel');
          return true;
        }
        break;

      case 'newCave':
        if (this.app.caveNumber < this.app.globalData.cavesCount-1) {
          this.app.caveNumber = this.app.caveNumber+1;
        } else {
          this.app.caveNumber = this.app.globalData.initCave;
        }
        this.app.startCave(false, false, false);
        return true;

      case 'newDemoCave':
        if (this.app.caveNumber < this.app.globalData.cavesCount-1) {
          this.app.caveNumber = this.app.caveNumber+1;
          this.app.startCave(true, false, false);
        } else {
          this.app.setModel('MainModel');
        }
        return true;
    
      case 'crash':
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        if (!this.demo) {
          this.gameAreaEntity.spriteEntities.willy[0].hide = true;
        }
        this.gameAreaEntity.spriteEntities.portal[0].frame = 0;
        this.sendEvent(0, {'id': 'stopAllAudioChannels'});
        this.borderEntity.bkColor = this.app.platform.color(0);
        this.gameAreaEntity.setMonochromeColors(this.app.platform.color(15), this.app.platform.color(0));
        this.sendEvent(0, {'id': 'playSound', 'channel': 'sounds', 'sound': 'crashSound', 'options': false});
        this.crashTime = this.timer;
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
    
    if (this.app.lives < 16 && this.app.lastBonusScore+10000 <= this.app.score) {
      this.app.lastBonusScore += 10000;
      this.gameInfoEntity.liveEntities[this.app.lives].hide = false;
      this.app.lives++;
      this.bkAnimation = 7;
    }

    this.timer = timestamp;

    if (this.crashTime != false) {
      var animateTime = timestamp-this.crashTime;
      var monochromeColor = Math.round(15-animateTime/30);
      if (monochromeColor < 8) {
        monochromeColor = 0;
      }
      this.gameAreaEntity.setMonochromeColors(this.app.platform.color(monochromeColor), this.app.platform.color(0));
      if (animateTime > 240) {
        if (this.app.lives > 0) {
          this.app.lives--;
          this.app.startCave(false, false, false);
        } else {
          this.app.setModel('GameOverModel');
        }
      }
    }

    this.drawModel();
  } // loopModel

} // class CaveModel

export default CaveModel;
