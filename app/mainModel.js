/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { AirEntity } = await import('./airEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import MainImageEntity from './mainImageEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import AirEntity from './airEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
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
    this.bannerTxt = '                                     MANIC MINER      writen by Matthew Smith      © 1983 SOFTWARE PROJECTS Ltd.      Guide Miner Willy through 20 lethal caverns.      Bonus Life for each 10.000 points.      M = Music (On/Off)      S = Sounds (On/Off)      ESC = Pause menu                                     ';
    this.bannerEntity = null;
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

    this.airEntity = new AirEntity(this.desktopEntity, 0, 16*8, 32*8, 8, 0.0);
    this.desktopEntity.addEntity(this.airEntity);
    
    this.blackBox = new AbstractEntity(this.desktopEntity, 0, 17*8, 32*8, 7*8, false, this.app.platform.colorByName('black'));
    this.desktopEntity.addEntity(this.blackBox);
    this.bannerEntity = new ZXTextEntity(this.blackBox, 0, 8, 32*8, 8, this.bannerTxt, this.app.platform.colorByName('yellow'), false, 0, true);
    this.blackBox.addEntity(this.bannerEntity);

    if (this.app.audioManager.music > 0) {
      this.sendEvent(500, {'id': 'openAudioChannel', 'channel': 'music'});
      this.sendEvent(750, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
    }
  } // init

  
  handleEvent(event) {
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

      case 'melodyCompleted':
        this.pianoKey1Entity.hide = true;
        this.pianoKey2Entity.hide = true;
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer === false) {
      this.timer = timestamp;
    } else {
      if (timestamp-this.timer > 30000) {
        this.bannerEntity.x = 0;
        this.bannerEntity.width = 32*8;
      } else {
        var pos = Math.round(1900*(timestamp-this.timer)/30000);
        this.bannerEntity.x = -pos;
        this.bannerEntity.width = 32*8+pos;
        this.airEntity.value = (timestamp-this.timer)/30000;
      }
      
      var steps = Math.round((timestamp-this.timer)/(1000/15));
      var direction = Math.round(steps%24/24);
      var position = Math.abs((12*direction)-steps%12);
      this.willyEntity.frame = steps%4+direction*4;
      this.willyEntity.x = 28*8+position*2;
    }
    
    this.drawModel();
  } // loopModel

} // class MainModel

export default MainModel;
