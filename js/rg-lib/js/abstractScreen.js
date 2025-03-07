/*/
const { AbstractView } = await import('./abstractView.js?ver='+window.srcVersion);
const { DesktopView } = await import('./desktopView.js?ver='+window.srcVersion);
const { BorderView } = await import('./borderView.js?ver='+window.srcVersion);
/*/
import AbstractView from './abstractView.js';
import DesktopView from './desktopView.js';
import BorderView from './borderView.js';
/**/

export class AbstractScreen {

  constructor(app, ctx, id) {
    this.app = app;
    this.ctx = ctx;
    this.id = id;

    this.flashState = 0;
    this.lastTime = null;
    this.timeDiff = null;
    this.now = null;

    this.desktopWidth = this.app.platform.desktop()['width'];
    this.desktopHeight = this.app.platform.desktop()['height'];
    this.minimalBorder = this.app.platform.border()['minimal'];
    this.optimalBorder = this.app.platform.border()['optimal'];
    this.borderWidth = 0;
    this.borderHeight = 0;
    this.desktop = null;
  } // constructor

  init() {
    this.borderView = new BorderView(null, 0, 0, 0, 0);
    this.borderView.app = this.app;
    this.borderView.screen = this;
    this.borderView.bkColor = this.app.platform.border()['defaultColor'];
    this.desktopView = new DesktopView(null, 0, 0, 0, 0);
    this.desktopView.app = this.app;
    this.desktopView.screen = this;
    this.desktopView.bkColor = this.app.platform.desktop()['defaultColor'];
  } // init

  loopScreen() {
    this.now = Date.now();
    if (this.lastTime != null) {
      this.timeDiff = this.now - this.lastTime;
    } else {
      this.lastTime = this.now;
      this.timeDiff = 0;
    }
  } // loopScreen

  resizeScreen() {
    this.app.canvas.resizeScreen(this);
    this.drawScreen();
  } // resizeScreen

  drawScreen() {
    this.borderView.drawView();
    this.desktopView.drawView();
  } // drawScreen

  colorByName(colorName) {
    return this.app.colorByName(colorName);
  } // colorByName
  
  color(color) {
    return this.app.colorByName(color);
  } // color

  penColorByAttribut(attr) {
    return this.app.penColorByAttribut(attr);
  } // penColorByAttribut

  bkColorByAttribut(attr) {
    return this.app.bkColorByAttribut(attr);
  } // bkColorByAttribut

  hexToBin(hexData) {
    return this.hexToInt(hexData).toString(2).padStart(8, '0');
  } // hexToBin

  hexToInt(hexData) {
    return parseInt(hexData, 16);
  } // hexToInt

} // class AbstractScreen

export default AbstractScreen;
