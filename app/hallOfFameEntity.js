/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class HallOfFameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'HallOfFameEntity';

    this.tableHallOfFame = {
      0: {name: 'bibix', score: '121381'},
      1: {name: 'Matthew Smith', score: '95020'},
      2: {name: 'bibix', score: '80000'},
      3: {name: 'Libor Mitrenga', score: '7052'},
      4: {name: 'hunter 007', score: '6111'},
      5: {name: 'narci', score: '5234'},
      6: {name: 'perpe2a', score: '4325'},
      7: {name: 'noname001', score: '3333'},
      8: {name: 'bibix', score: '2111'},
      9: {name: 'Libor Mitrenga', score: '1220'}
    };
  } // constructor

  init() {
    super.init();
    
    this.addEntity(new AbstractEntity(this, 0, 0, this.width, this.height, false, this.app.platform.colorByName('black')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, 'HALL OF FAME', this.app.platform.colorByName('brightWhite'), false, {align: 'center', topMargin: 2}));
    this.addEntity(new AbstractEntity(this, 1, 9, this.width-2, this.height-10, false, this.app.platform.colorByName('yellow')));

    for (var i = 0; i < 10; i++) {
      var y = 12+i*10;
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 2, y, 18, 8, (i+1)+'.', this.app.platform.colorByName('black'), false, {align: 'right'}));
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 22, y, 100, 8, this.tableHallOfFame[i].name, this.app.platform.colorByName('black'), false, {}));
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8Mono, this.width-78, y, 76, 8, this.tableHallOfFame[i].score, this.app.platform.colorByName('black'), false, {align: 'right'}));
    }

    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-39, this.height-16, 36, 13, 'CLOSE', 'closeHallOfFame', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', margin: 4}));
  } // init

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }
    switch (event.id) {
      case 'closeHallOfFame':
        this.destroy();
        return true;
    }
    return false;
  } // handleEvent

} // HallOfFameEntity

export default HallOfFameEntity;
