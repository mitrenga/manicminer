/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class AirEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, value) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'AirEntity';
    this.value = value;
  } // constructor

  drawEntity() {
    this.app.layout.paint(this, 0, 0, this.width-22*8, 8, this.app.platform.colorByName('brightRed'));
    this.app.layout.paint(this, this.width-22*8, 0, 22*8, 8, this.app.platform.colorByName('brightGreen'));
    this.app.layout.paint(this, 0, 2, Math.round(this.width*this.value), 4, this.app.platform.colorByName('brightWhite'));
  } // drawEntity

} // class AirEntity

export default AirEntity;
