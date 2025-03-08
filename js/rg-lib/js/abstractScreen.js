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
    this.now = Date.now();

    this.desktopWidth = this.app.platform.desktop()['width'];
    this.desktopHeight = this.app.platform.desktop()['height'];
    this.minimalBorder = this.app.platform.border()['minimal'];
    this.optimalBorder = this.app.platform.border()['optimal'];
    this.borderWidth = 0;
    this.borderHeight = 0;
    this.desktop = null;

    this.messages = [];
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

  sendMessage(timing, message) {
    if (timing == 0) {
      this.handleMessage(message);
    } else {
      this.messages.push({'id': message['id'], 'timing': this.now+timing, 'message': message});
    }
  } // sendMessage

  cancelMessage(id) {
    for (var m = 0; m < this.messages.length; m++) {
      if (id == this.messages[m]['id']) {
        this.messages.splice(m, 1);
      }
    }
  } // cancelMessage

  handleMessage(message) {
    if (this.borderView.handleMessage(message) == false) {
      this.desktopView.handleMessage(message);
    }
  } // handleMessage

  setData(data) {
    this.borderView.setData(data);
    this.desktopView.setData(data);
    this.drawScreen();
  } // setData

  loopScreen() {
    this.now = Date.now();
    for (var m = 0; m < this.messages.length; m++) {
      if (this.messages[m]['timing'] <= this.now) {
        this.sendMessage(0, this.messages[m]['message']);
        this.messages.splice(m, 1);
      }
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
