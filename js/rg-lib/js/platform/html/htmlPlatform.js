/*/
const { AbstractPlatform } = await import('../abstractPlatform.js?ver='+window.srcVersion);
const { FullScreenCanvas } = await import('../../canvas/fullScreenCanvas.js?ver='+window.srcVersion);
/*/
import AbstractPlatform from '../abstractPlatform.js';
import FullScreenCanvas from '../../canvas/fullScreenCanvas.js';
/**/
// begin code

export class HTMLPlatform extends AbstractPlatform {
  
  constructor() {
    super();
  } // constructor

  defaultCanvas(app) {
    return new FullScreenCanvas(app);
  } // defaultCanvas

  desktop() {
    return {width: 256, height: 192, defaultColor: this.colorByName('white')};
  } // resolution

  border() {
    return false;
  }

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
