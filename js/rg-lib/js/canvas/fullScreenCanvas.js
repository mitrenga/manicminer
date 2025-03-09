/*/
const { AbstractCanvas } = await import('./abstractCanvas.js?ver='+window.srcVersion);
/*/
import AbstractCanvas from './abstractCanvas.js';
/**/
// begin code

export class FullScreenCanvas extends AbstractCanvas {
  
  constructor(app) {
    super(app);
    this.id = 'FullScreenCanvas';

    this.realX = [];
    this.realY = [];
  } // constructor

  element() {
    return {width: this.app.element.clientWidth, height: this.app.element.clientHeight};
  } // element

  resizeScreen(screen) {
    var xRatio = this.app.element.clientWidth/(screen.desktopWidth+2*screen.minimalBorder);
    var yRatio = this.app.element.clientHeight/(screen.desktopHeight+2*screen.minimalBorder);

    this.app.element.width = this.app.canvas.element()['width'];
    this.app.element.height = this.app.canvas.element()['height'];

    screen.desktopView.x = screen.borderWidth;
    screen.desktopView.y = screen.borderHeight;
    screen.desktopView.width = screen.desktopWidth;
    screen.desktopView.height = screen.desktopHeight;
    screen.desktopView.parentWidth = screen.desktopWidth+2*screen.borderWidth;
    screen.desktopView.parentHeight = screen.desktopHeight+2*screen.borderHeight;

    this.prepareCoordinates(screen);
  } // resizeScreen

  prepareCoordinates(screen) {
    this.realX = [];
    var x = 0;
    while (x < screen.desktopWidth+2*screen.borderWidth) {
      this.realX.push(Math.round(x/(screen.desktopWidth+2*screen.borderWidth)*this.app.element.clientWidth));
      x++;
    }
    this.realX.push(this.app.element.clientWidth);

    this.realY = [];
    var y = 0;
    while (y < screen.desktopHeight+2*screen.borderHeight) {
      this.realY.push(Math.round(y/(screen.desktopHeight+2*screen.borderHeight)*this.app.element.clientHeight));
      y++;
    }
    this.realY.push(this.app.element.clientHeight);
  } // prepareCoordinates

  nativeX(screen, x) {
    if (x < 0) {
      console.log('ERROR: nativeX < 0 ->('+x+')');
      return -1;
    }
    if (x > screen.desktopWidth+2*screen.borderWidth) {
      console.log('ERROR: nativeX > screen width ->('+x+')');
      return screen.desktopWidth+2*screen.borderWidth;
    }
    return this.realX[x];
  } // nativeX

  nativeY(screen, y) {
    if (y < 0) {
      console.log('ERROR: nativeY < 0 ->('+y+')');
      return -1;
    }
    if (y > screen.desktopHeight+2*screen.borderHeight) {
      console.log('ERROR: nativeY > screen height ->('+y+')');
      return screen.desktopHeight+2*screen.borderHeight;
    }
    return this.realY[y];
  } // nativeY

  paintRect(screen, x, y, width, height) {
    screen.ctx.fillRect(this.nativeX(screen, x), this.nativeY(screen, y), this.nativeX(screen, x+width)-this.nativeX(screen, x), this.nativeY(screen, y+height)-this.nativeY(screen, y));
  } // paintRect

} // class FullScreenCanvas

export default FullScreenCanvas;
