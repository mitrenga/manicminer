/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class CaveSelectionEntity extends AbstractEntity {
  
  constructor(parentEntity, x, y) {
    super(parentEntity, x, y, 70, 43, false, false);
    this.id = 'CaveSelectionEntity';

    this.colorState = 0;
    this.lastColorChange = false;
  } // constructor

  drawEntity() {
    var color = this.app.platform.color(this.colorState*2+9);
    this.app.layout.paint(this, 0, 0, this.width, 3, color);
    this.app.layout.paint(this, 0, this.height-3, this.width, 3, color);
    this.app.layout.paint(this, 0, 0, 3, this.height, color);
    this.app.layout.paint(this, this.width-3, 0, 3, this.height, color);
  } // drawEntity

  loopEntity(timestamp) {
    if (this.lastColorChange === false) {
      this.lastColorChange = timestamp;
    }
    if (timestamp - this.lastColorChange < 480) {
      return;
    }
    this.lastColorChange = timestamp;
    this.colorState = Math.abs(1-this.colorState);
  } // loopEntity

} // CaveSelectionEntity

export default CaveSelectionEntity;
