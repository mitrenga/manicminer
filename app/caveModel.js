/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
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
    this.durationAirSupplySound = false;
    this.undisplayedScore = 0;
    this.demo = demo;
    this.bkAnimation = false;
    this.animationTime = false;
    this.animationType = false;
    this.autorepeatKeys = false;
    this.needDraw = true;

    this.initData = {
      info: [
        0, // counter
        0, // counter2
        0, // counter4
        0, // counter6
        demo,
        false, // crash
        this.app.score,
        0 // light beam touches
      ]
    };

    this.worker = new Worker(this.app.importPath+'/gameWorker.js?ver='+window.srcVersion);
    this.worker.onmessage = (event) => {

      if (this.demo && this.app.audioManager.music == 0 && event.data.gameData.info[0] == 80) {
        this.sendEvent(1, {id: 'newDemoCave'});
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
                  this.sendEvent(1, {id: 'crash'});
                }
                if (event.data.gameData.info[5]) {
                  this.sendEvent(1, {id: 'crash'});
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
          this.drawModel();
          this.needDraw = false;
          break;

        case 'playSound':
          this.sendEvent(0, {id: 'playSound', channel: event.data.channel, sound: event.data.sound, options: false});
          break;

        case 'stopAudioChannel':
          this.sendEvent(0, {id: 'stopAudioChannel', channel: event.data.channel});
          break;

        case 'caveDone':
          var ptrClock = event.data.gameData.info[0]+event.data.gameData.info[7]+this.gameClock;
          var maxClock = (this.airSupply-36+1)*(256/4);
          this.undisplayedScore = maxClock-ptrClock;
          this.app.score += this.undisplayedScore;
          this.sendEvent(0, {id: 'caveDone'});
          break;
      }
    } // onmessage

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

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});

    if (this.demo) {
      this.sendEvent(0, {id: 'playSound', channel: 'music', sound: 'inGameMelody', options: {caveNumber: this.caveNumber, demo: true}});
    } else {
      this.sendEvent(0, {id: 'playSound', channel: 'music', sound: 'inGameMelody', options: {repeat: true, caveNumber: this.caveNumber, demo: false}});
    }

    var caveId = 'cave'+this.caveNumber.toString().padStart(2, '0');
    this.fetchData(caveId+'.data', {key: caveId, when: 'required'}, {});
  } // init

  shutdown() {
    super.shutdown();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.app.audioManager.stopAllChannels();
  } // shutdown

  newBorderEntity() {
    return new BorderEntity(true, this.app.controls.touchscreen.supported & !this.demo);
  } // newBorderEntity

  setData(data) {
    data.data.willy = {...this.app.globalData.willy, ...data.data.willy};

    this.gameInfoEntity.caveNameEntity.setText(data.data.name);
    this.app.caveName = data.data.name;
    this.gameClock = (256-this.app.hexToInt(data.data.gameClock))/4;
    this.airSupply = this.app.hexToInt(data.data.airSupply);
    this.borderEntity.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.data.borderColor), 7, 1);
    for (var l = 0; l < 16; l++) {
      this.gameInfoEntity.liveEntities[l].setGraphicsData(data.data.willy);
    }
    this.app.inputEventsManager.sendEventsActiveKeys('Press');
    super.setData(data.data);
    this.postWorkerMessage({id: 'init', initData: this.initData});
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'blurWindow':
        this.postWorkerMessage({id: 'pause'});
        this.app.audioManager.pauseAllChannels();
        this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'PAUSE GAME', 'GameExitModel'));
        return true;

      case 'continueGame':        
        this.postWorkerMessage({id: 'continue'});
        this.app.audioManager.continueAllChannels();
        return true;

      case 'keyPress':
        var key = event.key;
        if (key.length == 1) {
          key = key.toUpperCase();
        }
        
        if (this.demo) {
          switch (key) {
            case 'Mouse1':
            case 'Mouse2':
            case 'Mouse4':
              this.app.inputEventsManager.keysMap[event.key] = this.borderEntity;
              return true;

            case 'Touch':
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity;
              return true;
          }
          this.app.setModel('MainModel');
          return true;
        }

        switch (key) {
          case 'Escape':
          case 'GamepadExit':
            this.postWorkerMessage({id: 'pause'});
            this.app.audioManager.pauseAllChannels();
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'PAUSE GAME', 'GameExitModel'));
            return true;

          case this.app.controls.mouse.right:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.right] === false) {
              this.postWorkerMessage({id: 'controls', action: 'right', value: true});
            }
            return true;

          case 'Touch':
            if (this.borderEntity.leftControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.leftControlEntity;
              this.app.inputEventsManager.touchesControls.left[event.identifier] = true;
              this.postWorkerMessage({id: 'controls', action: 'left', value: true});
              return true;
            }
            if (this.borderEntity.rightControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.rightControlEntity;
              this.app.inputEventsManager.touchesControls.right[event.identifier] = true;
              this.postWorkerMessage({id: 'controls', action: 'right', value: true});
              return true;
            }
            if (this.borderEntity.jumpControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.jumpControlEntity;
              this.app.inputEventsManager.touchesControls.jump[event.identifier] = true;
              this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
              return true;
            }
            break;

          case 'Touch.left':
            this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.leftControlEntity;
            this.postWorkerMessage({id: 'controls', action: 'left', value: true});
            return true;

          case 'Touch.right':
            this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.rightControlEntity;
            this.postWorkerMessage({id: 'controls', action: 'right', value: true});
            return true;

          case 'Touch.jump':
            this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.jumpControlEntity;
            this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
            return true;

          case this.app.controls.keyboard.right:
          case 'GamepadRight':  
            this.postWorkerMessage({id: 'controls', action: 'right', value: true});
            return true;

          case this.app.controls.mouse.left:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] === false) {
              this.postWorkerMessage({id: 'controls', action: 'left', value: true});
            }
            return true;

          case this.app.controls.keyboard.left:
          case 'GamepadLeft':  
            this.postWorkerMessage({id: 'controls', action: 'left', value: true});
            return true;

          case this.app.controls.mouse.jump:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] === false) {
              this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
              break;
            }
            return true;

          case this.app.controls.keyboard.jump:
          case 'GamepadJump':  
            this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
            return true;

          case this.app.controls.keyboard.music:
            this.app.muted.music = !this.app.muted.music;
            this.app.audioManager.muteChannel('music', this.app.muted.music);
            return true;

          case this.app.controls.keyboard.sounds:
            this.app.muted.sounds = !this.app.muted.sounds;
            this.app.audioManager.muteChannel('sounds', this.app.muted.sounds);
            this.app.audioManager.muteChannel('extra', this.app.muted.sounds);
            return true;
        }
        break;

      case 'keyRelease':
        var key = event.key;
        if (key.length == 1) {
          key = key.toUpperCase();
        }

        if (this.demo) {
          switch (key) {
            case 'Mouse1':
            case 'Mouse2':
            case 'Mouse4':
              if (this.app.inputEventsManager.keysMap[event.key] === this.borderEntity) {
                this.app.setModel('MainModel');
                return true;
              }
              break;

            case 'Touch':
              if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity) {
                this.app.setModel('MainModel');
                return true;
              }
              break;
          }
          return true;
        }

        switch (key) {
          case this.app.controls.mouse.right:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.right] === false) {
              this.postWorkerMessage({id: 'controls', action: 'right', value: false});
            }
            return true;

          case 'Touch':
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity.leftControlEntity) {
              if (Object.keys(this.app.inputEventsManager.touchesControls.left).length == 1) {
                this.postWorkerMessage({id: 'controls', action: 'left', value: false});
              }
              return true;
            }
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity.rightControlEntity) {
              if (Object.keys(this.app.inputEventsManager.touchesControls.right).length == 1) {
                this.postWorkerMessage({id: 'controls', action: 'right', value: false});
              }
              return true;
            }
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity.jumpControlEntity) {
              if (Object.keys(this.app.inputEventsManager.touchesControls.jump).length == 1) {
                this.postWorkerMessage({id: 'controls', action: 'jump', value: false});
              }
              return true;
            }
            break;

          case this.app.controls.keyboard.right:
          case 'GamepadRight':  
            this.postWorkerMessage({id: 'controls', action: 'right', value: false});
            return true;

          case this.app.controls.mouse.left:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] === false) {
              this.postWorkerMessage({id: 'controls', action: 'left', value: false});
            }
            return true;

          case this.app.controls.keyboard.left:
          case 'GamepadLeft':  
            this.postWorkerMessage({id: 'controls', action: 'left', value: false});
            return true;

          case this.app.controls.mouse.jump:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] === false) {
              this.postWorkerMessage({id: 'controls', action: 'jump', value: false});
            }
            return true;

          case this.app.controls.keyboard.jump:
          case 'GamepadJump':  
            this.postWorkerMessage({id: 'controls', action: 'jump', value: false});
            return true;
        }
        break;
    
      case 'crash':
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        if (!this.demo) {
          this.gameAreaEntity.spriteEntities.willy[0].hide = true;
        }
        this.gameAreaEntity.spriteEntities.portal[0].frame = 0;
        this.sendEvent(0, {id: 'stopAllAudioChannels'});
        this.borderEntity.bkColor = this.app.platform.color(0);
        this.gameAreaEntity.setMonochromeColors(this.app.platform.color(15), this.app.platform.color(0));
        this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'crashSound', options: false});
        this.animationTime = this.timer;
        this.animationType = 'crash';
        return true;

      case 'caveDone':
        if (this.animationTime == false) {
          this.sendEvent(0, {id: 'stopAllAudioChannels'});
          if (this.worker) {
            this.worker.terminate();
            this.worker = null;
          }
          if (!this.demo) {
            this.gameAreaEntity.spriteEntities.willy[0].hide = true;
          }
          this.gameAreaEntity.spriteEntities.portal[0].frame = 0;
          this.app.cavesCompleted++;
          //if (this.app.cavesCompleted < this.app.globalData.cavesCount || this.app.caveNumber < this.app.globalData.cavesCount-1) {
          if (this.app.caveNumber < this.app.globalData.cavesCount-1) {
            this.sendEvent(1, {id: 'animationCaveDone'});
          } else {
            this.sendEvent(1, {id: 'showSwordFish'});
          }
        }
        break;
      
      case 'showSwordFish':
          this.animationTime = this.timer;
          this.animationType = 'swordFish';
          var portal = this.gameAreaEntity.spriteEntities.portal[0];
          portal.hide = true;
          var fishEntity = new SpriteEntity(this.gameAreaEntity, portal.x, portal.y, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.escape.fish.attribute)), false, 0, 0);
          this.gameAreaEntity.addEntity(fishEntity);
          fishEntity.setGraphicsData(this.app.globalData.escape.fish);
          this.gameAreaEntity.spriteEntities.swordFish.push(fishEntity);
          var swordEntity = new SpriteEntity(this.gameAreaEntity, portal.x, portal.y+8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.escape.sword.attribute)), false, 0, 0);
          this.gameAreaEntity.addEntity(swordEntity);
          swordEntity.setGraphicsData(this.app.globalData.escape.sword);
          this.gameAreaEntity.spriteEntities.swordFish.push(swordEntity);
          this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'escapeSound', options: false});
        break;

      case 'animationCaveDone':
        this.gameAreaEntity.setMonochromeColors(this.app.platform.color(3), this.app.platform.color(7));
        this.animationTime = this.timer;
        this.animationType = 'caveDone';
        break;

      case 'animationDemoCaveDone':
        this.sendEvent(0, {id: 'stopAllAudioChannels'});
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        this.gameAreaEntity.setMonochromeColors(this.app.platform.color(3), this.app.platform.color(7));
        this.animationTime = this.timer;
        this.animationType = 'demoCaveDone';
        break;

      case 'changeRemainingAirSupplyToScore':
        this.animationTime = this.timer;
        this.animationType = 'airSupply';
        var remainingAirSupply = 36+Math.round(this.undisplayedScore/(256/4));
        this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'airSupplySound', options: {remainingAirSupply: remainingAirSupply}});
        break;

      case 'durationAirSupplySound':
        this.durationAirSupplySound = event.data.value;
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

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        if (this.animationTime === false) {
          this.sendEvent(330, {id: 'changeFlashState'});
        } else {
          this.app.stack.flashState = false;
        }

    }

    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);
    
    if (this.animationTime === false && this.app.lives < 16 && this.app.lastBonusScore+10000 <= this.app.score) {
      this.app.lastBonusScore += 10000;
      this.gameInfoEntity.liveEntities[this.app.lives].hide = false;
      this.app.lives++;
      this.bkAnimation = 7;
    }

    this.timer = timestamp;

    if (this.animationTime != false) {
      var animTime = timestamp-this.animationTime;
      switch (this.animationType) {
        case 'crash':
          var monochromeColor = Math.round(15-animTime/30);
          if (monochromeColor < 8) {
            monochromeColor = 0;
          }
          this.gameAreaEntity.setMonochromeColors(this.app.platform.color(monochromeColor), this.app.platform.colorByName('black'));
          if (animTime > 240) {
            this.animationTime = false;
            this.animationType = false;
            if (this.app.lives > 0) {
              this.app.lives--;
              this.app.startCave(false, false, false);
            } else {
              this.app.setModel('GameOverModel');
            }
          }
          break;

        case 'swordFish':
          break;

        case 'caveDone':
        case 'demoCaveDone':
          var monochromeAttr = Math.round(59-animTime/8.62);
          if (monochromeAttr < 1) {
            monochromeAttr = 1;
          }
          var penColor = this.app.platform.penColorByAttr(monochromeAttr);
          var bkColor = this.app.platform.bkColorByAttr(monochromeAttr);
          this.gameAreaEntity.setMonochromeColors(penColor, bkColor);
          if (animTime > 500) {
            this.borderEntity.bkColor = this.app.platform.colorByName('black');
            if (this.animationType == 'caveDone') {
              this.sendEvent(1, {id: 'changeRemainingAirSupplyToScore'});
            } else {
              this.sendEvent(1, {id: 'newDemoCave'});
            }
            this.animationTime = false;
            this.animationType = false;
          }
          break;

        case 'airSupply':
          var tmpScore = this.app.score-this.undisplayedScore;
          if (this.durationAirSupplySound) {
            tmpScore = Math.round(this.app.score-this.undisplayedScore+this.undisplayedScore*animTime/this.durationAirSupplySound);
            var tmpAirValue = this.app.airValue*(1-animTime/this.durationAirSupplySound);
            this.gameInfoEntity.airEntity.value = tmpAirValue;
          }
          if (tmpScore > this.app.score) {
            tmpScore = this.app.score;
          }
          this.gameInfoEntity.scoreEntity.setText(tmpScore.toString().padStart(6, '0'));
          if (this.durationAirSupplySound && animTime > this.durationAirSupplySound) {
            this.sendEvent(1, {id: 'newCave'});
          }
          break;

      }
    }

    if (this.needDraw) {
      this.drawModel();
    }
    this.needDraw = true;
  } // loopModel

} // CaveModel

export default CaveModel;
