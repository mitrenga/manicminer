/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { PillarEntity } = await import('./pillarEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import GameInfoEntity from './gameInfoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import PillarEntity from './pillarEntity.js';
/**/
// begin code

export class GameOverModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'GameOverModel';

    this.gameInfoEntity = null;
    this.pillarEntity = null;
    this.shoeEntity = null;
  } // constructor

  init() {
    super.init();

    this.desktopEntity.bkColor = this.app.platform.colorByName('black'); 
    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);
    this.gameInfoEntity.caveNameEntity.setText(this.app.caveName);
    this.gameInfoEntity.airEntity.value = this.app.airValue;

    var plinthEntity = new SpriteEntity(this.desktopEntity, 15*8, 14*8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.plinth.attribute)), false, 0, 0);
    this.desktopEntity.addEntity(plinthEntity);
    plinthEntity.setGraphicsData(this.app.globalData.gameOver.plinth);
    var willyEntity = new SpriteEntity(this.desktopEntity, 15*8+3, 12*8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.willy.attribute)), false, 0, 0);
    this.desktopEntity.addEntity(willyEntity);
    willyEntity.setGraphicsData(this.app.globalData.gameOver.willy);
    this.shoeEntity = new AbstractEntity(this.desktopEntity, 15*8, 0, 16, 16, false, this.desktopEntity.bkColor);
    this.desktopEntity.addEntity(this.shoeEntity);
    var shoeSpriteEntity = new SpriteEntity(this.shoeEntity, 0, 0, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.shoe.attribute)), false, 0, 0);
    this.shoeEntity.addEntity(shoeSpriteEntity);
    shoeSpriteEntity.setGraphicsData(this.app.globalData.gameOver.shoe);
    this.pillarEntity = new PillarEntity(this.desktopEntity, 15*8, 0, 16, 0, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.pillar.attribute)), this.app.globalData.gameOver.pillar);
    this.desktopEntity.addEntity(this.pillarEntity);
  } // init

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer === false) {
      this.timer = timestamp;
    } else {
      var fallTimer = timestamp-this.timer;
      if (fallTimer > 2000) {
        fallTimer = 2000;
      }
    }
    this.desktopEntity.bkColor = this.app.platform.color((Math.floor((fallTimer%200)/50)));
    this.shoeEntity.bkColor = this.desktopEntity.bkColor;
    this.shoeEntity.y = Math.round(12*8*fallTimer/2000);
    this.pillarEntity.height = this.shoeEntity.y;
    this.drawModel();
  } // loopModel

} // class GameOverModel

export default GameOverModel;
