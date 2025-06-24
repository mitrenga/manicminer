/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MiniTextEntity } = await import('./svision/js/platform/canvas2D/miniTextEntity.js?ver='+window.srcVersion);
const { ZXButtonEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxButtonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import MiniTextEntity from './svision/js/platform/canvas2D/miniTextEntity.js';
import ZXButtonEntity from './svision/js/platform/canvas2D/zxSpectrum/zxButtonEntity.js';
/**/
// begin code

export class PauseGameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, borderColor) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'PauseGameEntity';
    this.borderColor = borderColor;
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.borderColor));
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, 1, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightWhite')));
    var titleEntity = new MiniTextEntity(this, 0, 0, this.width, 9, 'PAUSE', this.app.platform.colorByName('brightBlack'), this.app.platform.colorByName('brightWhite'), 1, 2);
    titleEntity.justify = 2;
    this.addEntity(titleEntity);
    var button = new ZXButtonEntity(this, 10, 19, this.width-20, 14, 'RESUME GAME', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightBlack'), this.app.platform.colorByName('brightWhite'), 0, true);
    button.margin = 3;
    button.justify = 0;
    this.addEntity(button);
    button = new ZXButtonEntity(this, 10, 43, this.width-20, 14, 'SOUND OFF', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightBlack'), this.app.platform.colorByName('brightWhite'), 0, true);
    button.margin = 3;
    button.justify = 2;
    this.addEntity(button);
    button = new ZXButtonEntity(this, 10, 67, this.width-20, 14, 'MUSIC OFF', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightBlack'), this.app.platform.colorByName('brightWhite'), 0, true);
    button.margin = 3;
    button.justify = 2;
    this.addEntity(button);
    button = new ZXButtonEntity(this, 10, 91, this.width-20, 14, 'EXIT GAME', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightBlack'), this.app.platform.colorByName('brightWhite'), 0, true);
    button.margin = 3;
    button.justify = 2;
    this.addEntity(button);
  } // init

  handleEvent(event) {
    switch (event.id) {
      case 'closeAbout':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class PauseGameEntity

export default PauseGameEntity;
