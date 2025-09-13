/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { AirEntity } = await import('./airEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from '././svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import AirEntity from './airEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class GameInfoEntity extends AbstractEntity {
  
  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'GameInfoEntity';
    this.caveNameEntity = null;
    this.airEntity = null;
    this.hiScoreEntity = null;
    this.scoreEntity = null;
    this.liveEntities = [];
  } // constructor

  init() {
    super.init();

    this.caveNameEntity = new ZXTextEntity(this, 0, 0, 32*8, 8, '', this.app.platform.colorByName('black'), this.app.platform.colorByName('yellow'), 0, true);
    this.caveNameEntity.justify = 2;
    this.addEntity(this.caveNameEntity);
    this.addEntity(new ZXTextEntity(this, 0, 8, 4*8, 8, 'AIR', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightRed'), 0, true));
    this.airEntity = new AirEntity(this, 4*8, 8, 28*8, 8, 1.0);
    this.addEntity(this.airEntity);
    this.addEntity(new AbstractEntity(this, 0, 2*8, 32*8, 8, false, this.app.platform.colorByName('black')));
    this.addEntity(new ZXTextEntity(this, 0, 3*8, 10*8, 8, 'High Score', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true));
    this.hiScoreEntity = new ZXTextEntity(this, 10*8, 3*8, 10*8, 8, this.app.hiScore.toString().padStart(6, '0'), this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, false);
    this.addEntity(this.hiScoreEntity);
    this.addEntity(new ZXTextEntity(this, 20*8, 3*8, 6*8, 8, 'Score', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true));
    this.scoreEntity = new ZXTextEntity(this, 26*8, 3*8, 6*8, 8, this.app.score.toString().padStart(6, '0'), this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, false);
    this.addEntity(this.scoreEntity);
    this.addEntity(new AbstractEntity(this, 0, 4*8, 32*8, 8, false, this.app.platform.colorByName('black')));
    this.addEntity(new AbstractEntity(this, 0, 5*8, 32*8, 3*8, false, this.app.platform.colorByName('black')));
    for (var l = 0; l < 16; l++) {
      this.liveEntities[l] = new SpriteEntity(this, l*16, 5*8, this.app.platform.colorByName('brightCyan'), false, 0, 0);
      this.addEntity(this.liveEntities[l]);
      if (l >= this.app.lives) {
        this.liveEntities[l].hide = true;
      }
    }
  } // init

} // class GameInfoEntity

export default GameInfoEntity;
