/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
const { SlidingTextEntity } = await import('./svision/js/platform/canvas2D/slidingTextEntity.js?ver='+window.srcVersion);
const { AirEntity } = await import('./airEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
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
    this.blackBox = null;
    this.slidingText = 
      'MANIC MINER' +
      '      ' +
      'writen by Matthew Smith' +
      '      ' +
      '© 1983 SOFTWARE PROJECTS Ltd.' +
      '      ' +
      'Guide Miner Willy through 20 lethal caverns.' +
      '      ' +
      'Bonus Life for each 10.000 points.' +
      '      ' +
      this.app.prettyKey(this.app.controls.keyboard.music)+' = Music (On/Off)' +
      '      ' +
      this.app.prettyKey(this.app.controls.keyboard.sounds)+' = Sounds (On/Off)' +
      '      ' +
      'ESC = Pause menu';
    this.slidingTextEntity = null;
    this.willyEntity = null;
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
    this.willyEntity = new SpriteEntity(this.mainImageEntity, 28*8, 9*8, this.app.platform.colorByName('white'), false, 0, 0);
    this.willyEntity.setGraphicsData(this.app.globalData.willy);
    this.mainImageEntity.addEntity(this.willyEntity);

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 16*8, 32*8, 8, false, this.app.platform.colorByName('yellow')));
    this.airEntity = new AirEntity(this.desktopEntity, 0, 17*8, 32*8, 8, 0.0);
    this.desktopEntity.addEntity(this.airEntity);
    
    this.blackBox = new AbstractEntity(this.desktopEntity, 0, 18*8, 32*8, 6*8, false, this.app.platform.colorByName('black'));
    this.desktopEntity.addEntity(this.blackBox);
    this.slidingTextEntity = new SlidingTextEntity(this.blackBox, this.app.fonts.zxFonts8x8, 0, 8, 32*8, 8, this.slidingText, this.app.platform.colorByName('yellow'), false, {animation: 'toLeft', speed: 15, leftMargin: 256, rightMargin: 256});
    this.blackBox.addEntity(this.slidingTextEntity);

    this.sendEvent(0, {id: 'openAudioChannel', channel: 'music', options: {}});
    this.sendEvent(0, {id: 'openAudioChannel', channel: 'sounds', options: {}});
    this.sendEvent(0, {id: 'openAudioChannel', channel: 'extra', options: {}});
    this.sendEvent(0, {id: 'playSound', channel: 'music', sound: 'titleScreenMelody', options: false});
  } // init

  shutdown() {
    super.shutdown();
    this.app.audioManager.stopAllChannels();
  } // shutdown

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
          switch (event.key) {
            case 'Enter':
              this.app.startCave(false, true, true);
              return true;

            case 'Escape':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 9*8, 5*8, 14*8+1, 14*8+2, this.app.platform.colorByName('blue'), 'MenuModel'));
              return true;
          }
        }
        break;

      case 'mouseClick':
        this.app.startCave(false, true, true);
        return true;
        
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
    
    this.drawModel();
  } // loopModel

} // MainModel

export default MainModel;
