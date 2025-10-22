/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class WatermarkEntity extends AbstractEntity {

  constructor(parentEntity, app) {
    super(parentEntity, 0, 0, 0, 0);
    this.id = 'WaterMarkEntity';
    this.app = app;
  } // constructor

  drawEntity() {
    var d = 3*this.app.layout.ratio;
    var x = this.app.element.width-8*d;
    var y = this.app.element.height-8*d;
    this.app.stack.ctx.fillStyle = "rgb(189, 169, 133)";
    this.app.stack.ctx.strokeStyle = "rgb(155, 155, 155)";
    this.app.stack.ctx.lineWidth = this.app.layout.ratio;

    // rhomb
    this.app.stack.ctx.beginPath();
    this.app.stack.ctx.moveTo(x+d, y+2*d);
    this.app.stack.ctx.lineTo(x+2*d, y+d);
    this.app.stack.ctx.lineTo(x+d, y);
    this.app.stack.ctx.lineTo(x, y+d);
    this.app.stack.ctx.lineTo(x+d, y+2*d);
    this.app.stack.ctx.fill();
    this.app.stack.ctx.stroke();

    // triangle
    this.app.stack.ctx.beginPath();
    this.app.stack.ctx.moveTo(x+3*d, y+2*d);
    this.app.stack.ctx.lineTo(x+2*d, y+4*d);
    this.app.stack.ctx.lineTo(x+4*d, y+4*d);
    this.app.stack.ctx.lineTo(x+3*d, y+2*d);
    this.app.stack.ctx.fill();
    this.app.stack.ctx.stroke();

    // circle
    this.app.stack.ctx.beginPath();
    this.app.stack.ctx.arc(x+3*d, y+d, d, 0, 2*Math.PI);
    this.app.stack.ctx.fill();
    this.app.stack.ctx.stroke();

    // square
    this.app.stack.ctx.fillRect(x, y+2*d, 2*d, 2*d);
    this.app.stack.ctx.strokeRect(x, y+2*d, 2*d, 2*d);
  } // drawEntity

} // Watermarkntity

export default WatermarkEntity;
