/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class VolumeEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, channel) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'VolumeEntity';

    this.channel = channel;
  } // constructor

  init() {
    super.init();
    
    this.addEntity(new AbstractEntity(this, 0, 0, this.width, this.height, false, this.app.platform.colorByName('black')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, this.channel.toUpperCase(), this.app.platform.colorByName('brightWhite'), false, {align: 'center', topMargin: 2}));
    this.addEntity(new AbstractEntity(this, 1, 9, this.width-2, this.height-10, false, this.app.platform.colorByName('yellow')));

    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 22, this.width, 9, 'CHANGE VOLUME FOR GAME '+this.channel.toUpperCase(), this.app.platform.colorByName('black'), false, {align: 'center'}));

    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, 3, 36, 19, 13, 'OFF', '', [], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('green'), {topMargin: 4, leftMargin: 2}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, 91, 36, 19, 13, '50%', '', [], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('green'), {topMargin: 4, leftMargin: 2}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, 178, 36, 21, 13, 'MAX', '', [], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('green'), {topMargin: 4, leftMargin: 2}));

    var sliderEntity = new SpriteEntity(this, 10, 55, this.app.platform.colorByName('black'), false, 0, 0);
    sliderEntity.setCompressedGraphicsData(
      'lP10510070600012H020H530121232123414141414141414141454141414141414141414321232121',
      false,
    );
    this.addEntity(sliderEntity);

    var cursorEntity = new SpriteEntity(this, 8+5*18, 51, this.app.platform.colorByName('brightRed'), false, 0, 0);
    cursorEntity.setCompressedGraphicsData(
      'lP100500F05000501031D012332423321',
      false
    );
    this.addEntity(cursorEntity);


    this.addEntity(new ButtonEntity(this, this.app.fonts.zxFonts8x8, 3, 68, 19, 13, '-', '', ['ArrowLeft'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', topMargin: 2}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.zxFonts8x8, 178, 68, 21, 13, '+', '', ['ArrowRight'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', topMargin: 2}));

    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, 67, 90, 67, 13, 'PLAY SAMPLE', '', [], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('magenta'), {margin: 4}));

    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-39, this.height-16, 36, 13, 'CLOSE', 'closeVolume', ['Escape'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', margin: 4}));
  } // init

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }
    switch (event.id) {
      case 'closeVolume':
        this.destroy();
        return true;
    }
    return false;
  } // handleEvent

} // VolumeEntity

export default VolumeEntity;
