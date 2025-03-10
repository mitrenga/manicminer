/*/
const { AbstractCanvas } = await import('./abstractCanvas.js?ver='+window.srcVersion);
const { BasicCanvas } = await import('./basicCanvas.js?ver='+window.srcVersion);
const { NativeCanvas } = await import('./nativeCanvas.js?ver='+window.srcVersion);
const { OptimalCanvas } = await import('./optimalCanvas.js?ver='+window.srcVersion);
/*/
import AbstractCanvas from './abstractCanvas.js';
import BasicCanvas from './basicCanvas.js';
import NativeCanvas from './nativeCanvas.js';
import OptimalCanvas from './optimalCanvas.js';
/**/
// begin code

export class AutoCanvas extends AbstractCanvas {
  
  constructor(app) {
    super(app);
    this.id = 'AutoCanvas';

    this.canvas = false;
  } // constructor

  element() {
    if (this.canvas !== false) {
      return this.canvas.element();
    }
    return super.element();
  } // element
  
  resizeScreen(screen) {
    var ratio = Math.floor(this.app.element.clientWidth/(screen.desktopWidth));
    var yRatio = Math.floor(this.app.element.clientHeight/(screen.desktopHeight));
    if (yRatio < ratio) {
      ratio = yRatio;
    }

    if (ratio >= 3) {
      this.setCanvas('OptimalCanvas');
    } else if (ratio >= 2) {
      this.setCanvas('NativeCanvas');
    } else {
      this.setCanvas('BasicCanvas');
    }
    this.canvas.resizeScreen(screen);
  } // resizeScreen

  setCanvas(id) {
    if (this.canvas != false && this.canvas.id == id) {
      return;
    }
    switch (id) {
      case 'BasicCanvas':
        this.canvas = new BasicCanvas(this.app);
        break;
      case 'NativeCanvas':
        this.canvas = new NativeCanvas(this.app);
        break;
      case 'OptimalCanvas':
        this.canvas = new OptimalCanvas(this.app);
        break;
      default:
        this.canvas = false;
        break;
    } // switch
  } // setCanvas

  paintRect(screen, x, y, width, height, color) {
    if (this.canvas !== false) {
      this.canvas.paintRect(screen, x, y, width, height, color);
    }
  } // paintRect

} // class AutoCanvas

export default AutoCanvas;
