/*/
const { AbstractCanvas } = await import('./abstractCanvas.js?ver='+window.srcVersion);
const { BasicCanvas } = await import('./basicCanvas.js?ver='+window.srcVersion);
const { NativeCanvas } = await import('./nativeCanvas.js?ver='+window.srcVersion);
const { OptimalCanvas } = await import('./optimalCanvas.js?ver='+window.srcVersion);
const { AutoCanvas } = await import('./autoCanvas.js?ver='+window.srcVersion);
/*/
import AbstractCanvas from './abstractCanvas.js';
import BasicCanvas from './basicCanvas.js';
import NativeCanvas from './nativeCanvas.js';
import OptimalCanvas from './optimalCanvas.js';
import AutoCanvas from './autoCanvas.js';
/**/

export class AbstractApp {
  
  constructor(platform, wsURL) {
    this.element = document.getElementById('canvasGame');
    this.ctx = this.element.getContext('2d');
    
    this.platform = platform;
    this.canvas = new AutoCanvas(this);
    this.wsURL = wsURL;
    this.webSocket = null;
  } // constructor

  loopApp() {
    if (this.screen) {
      this.screen.loopScreen();
    }
  } // loopApp

  resizeApp() {
    if (this.screen) {
      this.screen.resizeScreen();
    }
  } // resizeApp

  drawApp() {
    if (this.screen) {
      this.screen.drawScreen();
    }
  } // drawApp
  
  onClick(e) {
  } // onClick
  
  colorByName(colorName) {
    return this.platform.colorByName(colorName);
  } // colorByName
  
  color(color) {
    return this.platform.color(color);
  } // color

  penColorByAttribut(attr) {
    return this.platform.penColorByAttribut(attr);
  } // penColorByAttribut

  bkColorByAttribut(attr) {
    return this.platform.bkColorByAttribut(attr);
  } // bkColorByAttribut

} // class AbstractApp

export default AbstractApp;
