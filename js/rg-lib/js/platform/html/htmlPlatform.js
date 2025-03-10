/*/
const { AbstractPlatform } = await import('../abstractPlatform.js?ver='+window.srcVersion);
const { HTMLCanvas } = await import('../../canvas/htmlCanvas.js?ver='+window.srcVersion);
/*/
import AbstractPlatform from '../abstractPlatform.js';
import HTMLCanvas from '../../canvas/htmlCanvas.js';
/**/
// begin code

export class HTMLPlatform extends AbstractPlatform {
  
  constructor() {
    super();
  } // constructor

  createCanvasElement(app, parentElement) {
    app.parentElement = document.getElementById(parentElement);
    app.element = document.createElement('div');
    app.element.id = 'canvasApp';
    app.element.classList.add('canvasApp');
    app.parentElement.appendChild(app.element);
  } // createCanvasElement

  defaultCanvas(app) {
    return new HTMLCanvas(app);
  } // defaultCanvas

  desktop() {
    return {width: 256, height: 192, defaultColor: this.colorByName('white')};
  } // desktop

  border() {
    return false;
  } // border

  colorByName(colorName) {
    return colorName;
  } // colorByName

 color(color) {
  color >>>= 0;
  var b = color & 0xFF;
  var g = (color & 0xFF00) >>> 8;
  var r = (color & 0xFF0000) >>> 16;
  var a = 1; //( (color & 0xFF000000) >>> 24 ) / 255;
  return 'rgba(' + [r, g, b, a].join(',') + ')';
} // color

} // class HTMLPlatform

export default HTMLPlatform;
