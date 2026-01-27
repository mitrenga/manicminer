/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
const { SlidingTextEntity } = await import('./svision/js/platform/canvas2D/slidingTextEntity.js?ver='+window.srcVersion);
const { AirEntity } = await import('./airEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import BorderEntity from './borderEntity.js';
import MainImageEntity from './mainImageEntity.js';
import SlidingTextEntity from './svision/js/platform/canvas2D/slidingTextEntity.js';
import AirEntity from './airEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
/**/
// begin code

export class MainModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MainModel';

    this.mainImageEntity = null
    this.pianoKey1Entity = null;
    this.pianoKey2Entity = null;
    this.airEntity = null;
    this.blackBoxEntity = null;
    this.slidingText =
      'MANIC MINER' +
      '      ' +
      'writen by Matthew Smith' +
      '      ' +
      '© 1983 SOFTWARE PROJECTS Ltd.' +
      '      ' +
      'Guide Miner Willy through 20 lethal caverns.' +
      '      ' +
      'Bonus Life for each 10.000 points.';
    if (this.app.controls.keyboard.music != 'NoKey') {
      this.slidingText = this.slidingText+
        '      ' +
        this.app.prettyKey(this.app.controls.keyboard.music)+' = Mute music';
    }
    if (this.app.controls.keyboard.sounds != 'NoKey') {
      this.slidingText = this.slidingText+
        '      ' +
        this.app.prettyKey(this.app.controls.keyboard.sounds)+' = Mute sounds';
    }
    this.slidingText = this.slidingText+
      '      ' +
      'ESC = Pause menu';
    this.slidingTextEntity = null;
    this.willyEntity = null;
    this.enterEntity = null;
    this.selectCaveEntity = null;
    this.spaceEntity = null;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    
    this.mainImageEntity = new MainImageEntity(this.desktopEntity, 0, 0, 32*8, 16*8);
    this.desktopEntity.addEntity(this.mainImageEntity);
    this.pianoKey1Entity = new AbstractEntity(this.mainImageEntity, 0, 15*8, 7, 8, false, this.app.platform.colorByName('brightRed'));
    this.pianoKey1Entity.hide = true;
    this.mainImageEntity.addEntity(this.pianoKey1Entity);
    this.pianoKey2Entity = new AbstractEntity(this.mainImageEntity, 0, 15*8, 7, 8, false, this.app.platform.colorByName('cyan'));
    this.pianoKey2Entity.hide = true;
    this.mainImageEntity.addEntity(this.pianoKey2Entity);

    this.enterEntity = new SpriteEntity(this.mainImageEntity, 96, 96, this.app.platform.color(0), false, 0, 0);
    this.enterEntity.setCompressedGraphicsData(
        'lP10130080900070102030609040B01234321212521243321212657234373534577234377787327437775235327437353233123344371233321234343712343',
        false
    );
    this.mainImageEntity.addEntity(this.enterEntity);

    this.willyEntity = new SpriteEntity(this.mainImageEntity, 28*8, 9*8, this.app.platform.colorByName('white'), false, 0, 0);
    this.willyEntity.setGraphicsData(this.app.globalData.willy);
    this.mainImageEntity.addEntity(this.willyEntity);

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 16*8, 32*8, 8, false, this.app.platform.colorByName('yellow')));
    this.airEntity = new AirEntity(this.desktopEntity, 0, 17*8, 32*8, 8, 0.0);
    this.desktopEntity.addEntity(this.airEntity);
    
    this.blackBoxEntity = new AbstractEntity(this.desktopEntity, 0, 18*8, 32*8, 6*8, false, this.app.platform.colorByName('black'));
    this.blackBoxEntity.clickColor = '#444444';
    this.desktopEntity.addEntity(this.blackBoxEntity);
    this.slidingTextEntity = new SlidingTextEntity(this.blackBoxEntity, this.app.fonts.zxFonts8x8, 0, 8, 32*8, 8, this.slidingText, this.app.platform.colorByName('yellow'), false, {animation: 'toLeft', speed: 15, leftMargin: 256, rightMargin: 256});
    this.blackBoxEntity.addEntity(this.slidingTextEntity);

    this.selectCaveEntity = new SpriteEntity(this.blackBoxEntity, 25, 28, this.app.platform.colorByName('white'), false, 0, 0);
    this.selectCaveEntity.setCompressedGraphicsData(
      'lP105R0080K0006020705031M0B010A040E1L091N0C1P081O0D012123245463247423821324239448A2528B83838383C383D383821' +
      '38383D35552528D5282528212A882A8E2A252D2A882121212A852F2A8228222528243838AA454G2A252D45AA21AA2H2F2125282528' +
      'A51212A1454E2A252748AA21AA2H2F2125222822A5212825218A288A2E2A252D8A282121212A852F2A883228222421222238383E2A' +
      '3D38383838352F383555D1252832454I2447423838324A2J42252A8A3',
      false
    );
    this.blackBoxEntity.addEntity(this.selectCaveEntity);

    this.spaceEntity = new SpriteEntity(this.blackBoxEntity, 73, 28, this.app.platform.color(3), false, 0, 0);
    this.spaceEntity.setCompressedGraphicsData(
      'lP101300809010502060E070309040123101124056665078002622202228002116502620238110322620238601002350280021502350505012232622125',
      false
    );
    this.blackBoxEntity.addEntity(this.spaceEntity);

    this.sendEvent(0, {id: 'openAudioChannel', channel: 'music', options: {muted: this.app.muted.music}});
    this.sendEvent(0, {id: 'openAudioChannel', channel: 'sounds', options: {muted: this.app.muted.sounds}});
    this.sendEvent(0, {id: 'openAudioChannel', channel: 'extra', options: {muted: this.app.muted.sounds}});
    this.sendEvent(0, {id: 'playSound', channel: 'music', sound: 'titleScreenMelody', options: false});
  } // init

  shutdown() {
    super.shutdown();
    this.app.audioManager.stopAllChannels();
  } // shutdown

  newBorderEntity() {
    return new BorderEntity(true, false);
  } // newBorderEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'pianoKey':
        var attr1 = 31-Math.floor((event.data.k1-8)/8);
        var attr2 = 31-Math.floor((event.data.k2-8)/8);
        var border = attr2&7;
        this.borderEntity.bkColor = this.app.platform.color(border);
        this.pianoKey1Entity.x = attr1%32*8;
        this.pianoKey2Entity.x = attr2%32*8;
        if (attr1 == attr2) {
          this.pianoKey1Entity.hide = true;
        } else {
          this.pianoKey1Entity.hide = false;
        }
        this.pianoKey2Entity.hide = false;
        return true;

      case 'melodyEnd':
        this.pianoKey1Entity.hide = true;
        this.pianoKey2Entity.hide = true;
        return true;

      case 'keyPress':
        if (this.desktopEntity.modalEntity == null) {
          var key = event.key;
          if (key.length == 1) {
            key = key.toUpperCase();
          }
          switch (key) {            
            case 'Enter':
            case 'GamepadOK':
              this.app.startCave(false, true, true);
              return true;
            case ' ':
            case 'GamepadDown':
              this.app.setModel('CavesMapModel');
              return true;
            case 'Escape':
            case 'GamepadExit':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'OPTIONS', 'MenuModel'));
              return true;
            case 'Mouse1':
              if (this.blackBoxEntity.pointOnEntity(event)) {
                this.app.inputEventsManager.keysMap.Mouse1 = this.blackBoxEntity;
                this.blackBoxEntity.clickState = true;
                return true;
              }
              this.app.inputEventsManager.keysMap.Mouse1 = this.borderEntity;
              return true;
            case 'Touch':
              if (this.blackBoxEntity.pointOnEntity(event)) {
                this.app.inputEventsManager.touchesMap[event.identifier] = this.blackBoxEntity;
                this.blackBoxEntity.clickState = true;
                return true;
              }
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity;
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
        }
        break;
        
      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
            if (this.blackBoxEntity.pointOnEntity(event)) {
              if (this.app.inputEventsManager.keysMap.Mouse1 === this.blackBoxEntity) {
                this.app.setModel('CavesMapModel');
                return true;
              }
            }
            if (this.app.inputEventsManager.keysMap.Mouse1 === this.borderEntity) {
              this.app.startCave(false, true, true);
              return true;
            }
            break;
          case 'Touch':
            if (this.blackBoxEntity.pointOnEntity(event)) {
              if (this.app.inputEventsManager.touchesMap[event.identifier] === this.blackBoxEntity) {
                this.app.setModel('CavesMapModel');
                return true;
              }
            }
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity) {
              this.app.startCave(false, true, true);
              return true;
            }
            break;
        }
        break;

      case 'newDemoCave':
        this.app.startCave(true, true, true);
        return true;

      case 'errorAudioChannel':
        this.app.showErrorMessage(event.error, 'reopen');
        return true;
    }
    
    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer == false) {
      this.timer = timestamp;
    } 

    this.slidingTextEntity.loopEntity(timestamp);
    this.airEntity.value = this.slidingTextEntity.animationProgress;
    if (this.slidingTextEntity.animationProgress == 1) {
      this.sendEvent(1, {id: 'newDemoCave'});
    }
    
    var steps = Math.round((timestamp-this.timer)/80);
    var direction = Math.round(steps%20/20);
    var position = Math.abs((10*direction)-steps%10);
    this.willyEntity.frame = steps%4+direction*4;
    this.willyEntity.x = 28*8+position*2;
    
    this.enterEntity.setPenColor(this.app.platform.color(Math.round(steps/6)%2*8+6));
    this.spaceEntity.setPenColor(this.app.platform.color(Math.round(steps/6)%2*8+3));

    this.drawModel();
  } // loopModel

} // MainModel

export default MainModel;
