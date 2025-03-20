/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class AirEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'AirEntity';
    
    this.bkColor = this.app.platform.colorByName('brightWhite');
  } // constructor

  drawEntity() {
    super.drawEntity();

    this.app.layout.paint(this, 0, 0, 6*8, 2, this.app.platform.colorByName('brightRed'));
    this.app.layout.paint(this, 0, 6, 6*8, 2, this.app.platform.colorByName('brightRed'));
    this.app.layout.paint(this, 6*8, 0, this.width-6*8, 2, this.app.platform.colorByName('brightGreen'));
    this.app.layout.paint(this, 6*8, 6, this.width-6*8, 2, this.app.platform.colorByName('brightGreen'));
  } // drawEntity

} // class AirEntity

export default AirEntity;
