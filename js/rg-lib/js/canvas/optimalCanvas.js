/*/
const { NativeCanvas } = await import('./nativeCanvas.js?ver='+window.srcVersion);
/*/
import NativeCanvas from './nativeCanvas.js';
/**/
// begin code

export class OptimalCanvas extends NativeCanvas {
  
  constructor(app) {
    super(app);
    this.id = 'OptimalCanvas';
  } // constructor

  resizeScreen(screen) {
    var ratio = this.app.element.clientWidth/(screen.desktopWidth+2*screen.minimalBorder);
    var yRatio = this.app.element.clientHeight/(screen.desktopHeight+2*screen.minimalBorder);

    if (yRatio < ratio) {
      ratio = yRatio;
    }
    if (ratio > 1) {
      ratio = Math.floor(ratio);
    }

    screen.borderWidth = Math.ceil((this.app.element.clientWidth-screen.desktopWidth*ratio)/2/ratio);
    screen.borderHeight = Math.ceil((this.app.element.clientHeight-screen.desktopHeight*ratio)/2/ratio);

    this.app.element.width = this.app.canvas.element()['width'];
    this.app.element.height = this.app.canvas.element()['height'];

    screen.borderView.x = 0;
    screen.borderView.y = 0;
    screen.borderView.width = screen.desktopWidth+2*screen.borderWidth;
    screen.borderView.height = screen.desktopHeight+2*screen.borderHeight;
    screen.borderView.parentWidth = screen.desktopWidth+2*screen.borderWidth;
    screen.borderView.parentHeight = screen.desktopHeight+2*screen.borderHeight;

    screen.desktopView.x = screen.borderWidth;
    screen.desktopView.y = screen.borderHeight;
    screen.desktopView.width = screen.desktopWidth;
    screen.desktopView.height = screen.desktopHeight;
    screen.desktopView.parentWidth = screen.desktopWidth+2*screen.borderWidth;
    screen.desktopView.parentHeight = screen.desktopHeight+2*screen.borderHeight;

    this.prepareCoordinates(screen);
  } // resizeScreen

} // class OptimalCanvas

export default OptimalCanvas;
