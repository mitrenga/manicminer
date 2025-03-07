/*/

/*/

/**/

export class AbstractCanvas {
  
  constructor(app) {
    this.app = app;
    this.id = 'AbstractCanvas';
  } // constructor

  element() {
    return {width: 0, height: 0};
  } // element
  
  resizeScreen(screen) {
    var xRatio = this.app.element.clientWidth/(screen.desktopWidth+2*screen.minimalBorder);
    var yRatio = this.app.element.clientHeight/(screen.desktopHeight+2*screen.minimalBorder);

    if (yRatio < xRatio) {
      if (yRatio < 2) {
        screen.borderHeight = screen.minimalBorder;
      } else {
        screen.borderHeight = screen.optimalBorder;
        yRatio = this.app.element.clientHeight/(screen.desktopHeight+2*screen.optimalBorder);
      }
      screen.borderWidth = Math.round((this.app.element.clientWidth/yRatio-screen.desktopWidth)/2);
    } else {
      if (xRatio < 2) {
        screen.borderWidth = screen.minimalBorder;
      } else {
        screen.borderWidth = screen.optimalBorder;
        xRatio = this.app.element.clientWidth/(screen.desktopWidth+2*screen.optimalBorder);
      }
      screen.borderHeight = Math.round((this.app.element.clientHeight/xRatio-screen.desktopHeight)/2);
    } 

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
  } // resizeScreen

  paintRect(screen, x, y, width, height) {
  } // paintRect

} // class AbstractCanvas

export default AbstractCanvas;
