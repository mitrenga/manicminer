/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import GameInfoEntity from './gameInfoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class GameOverModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'GameOverModel';

    this.gameInfoEntity = null;
  } // constructor

  init() {
    super.init();

    this.desktopEntity.bkColor = this.app.platform.colorByName('black'); 
    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);
    this.gameInfoEntity.caveNameEntity.setText(this.app.caveName);
    this.gameInfoEntity.airEntity.value = this.app.airValue;

    var shoeEntity = new SpriteEntity(this.desktopEntity, 15*8, 0, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.shoe.attribute)), false, 0, 0);
    this.desktopEntity.addEntity(shoeEntity);
    shoeEntity.setGraphicsData(this.app.globalData.gameOver.shoe);
    var willyEntity = new SpriteEntity(this.desktopEntity, 15*8+3, 12*8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.willy.attribute)), false, 0, 0);
    this.desktopEntity.addEntity(willyEntity);
    willyEntity.setGraphicsData(this.app.globalData.gameOver.willy);
    var plinthEntity = new SpriteEntity(this.desktopEntity, 15*8, 14*8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.plinth.attribute)), false, 0, 0);
    this.desktopEntity.addEntity(plinthEntity);
    plinthEntity.setGraphicsData(this.app.globalData.gameOver.plinth);
  } // init

} // class GameOverModel

export default GameOverModel;
