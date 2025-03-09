/*/
const { AbstractCanvas } = await import('./canvas/abstractCanvas.js?ver='+window.srcVersion);
const { BasicCanvas } = await import('./canvas/basicCanvas.js?ver='+window.srcVersion);
const { NativeCanvas } = await import('./canvas/nativeCanvas.js?ver='+window.srcVersion);
const { OptimalCanvas } = await import('./canvas/optimalCanvas.js?ver='+window.srcVersion);
const { AutoCanvas } = await import('./canvas/autoCanvas.js?ver='+window.srcVersion);
/*/
import AbstractCanvas from './canvas/abstractCanvas.js';
import BasicCanvas from './canvas/basicCanvas.js';
import NativeCanvas from './canvas/nativeCanvas.js';
import OptimalCanvas from './canvas/optimalCanvas.js';
import AutoCanvas from './canvas/autoCanvas.js';
/**/
// begin code

export class AbstractApp {
  
  constructor(platform, wsURL) {
    this.element = document.getElementById('canvasGame');
    this.ctx = this.element.getContext('2d');
    
    this.platform = platform;
    this.canvas = platform.defaultCanvas(this);
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
