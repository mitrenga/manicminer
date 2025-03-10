/*/
const { AbstractCanvas } = await import('./abstractCanvas.js?ver='+window.srcVersion);
/*/
import AbstractCanvas from './abstractCanvas.js';
/**/
// begin code

export class BasicCanvas extends AbstractCanvas {
  
  constructor(app) {
    super(app);
    this.id = 'BasicCanvas';
  } // constructor

  element() {
    return {width: this.app.screen.desktopWidth+2*this.app.screen.borderWidth, height: this.app.screen.desktopHeight+2*this.app.screen.borderHeight};
  } // element
  
  paintRect(screen, x, y, width, height, color) {
    screen.ctx.fillStyle = color;
    screen.ctx.fillRect(x, y, width, height);
  } // paintRect

} // class BasicCanvas

export default BasicCanvas;
