/**/
const { TextView } = await import('./rg-lib/js/textView.js?ver='+window.srcVersion);
/*/
import TextView from './rg-lib/js/textView-if.js';
/**/


export class LogoView extends TextView {

  constructor(parentView, x, y, width, height, logoType) {
    super(parentView, x, y, width, height);
    this.id = 'LogoView';
    
    this.proportional = true;
    this.justify = 0;
    this.logoType = logoType;

    this.logoFonts = {
      ' ': {width: 5, data: []},
      M: {width: 6, data: [[0,0,1,5], [1,1,1,1], [2,2,1,1], [3,1,1,1], [4,0,1,5]]},
      A: {width: 6, data: [[0,1,1,4], [1,0,3,1], [1,3,3,1], [4,1,1,4]]},
      G: {width: 6, data: [[0,1,1,3], [1,0,3,1], [1,4,3,1], [4,2,1,2], [3,2,1,1]]},
      I: {width: 4, data: [[0,0,3,1], [1,1,1,3], [0,4,3,1]]},
      C: {width: 6, data: [[0,1,1,3], [1,0,3,1], [4,1,1,1], [1,4,3,1], [4,3,1,1]]},
      N: {width: 6, data: [[0,0,1,5], [1,1,1,1], [2,2,1,1], [3,3,1,1], [4,0,1,5]]},
      E: {width: 6, data: [[0,0,1,5], [1,0,4,1], [1,2,3,1], [1,4,4,1]]},
      R: {width: 6, data: [[0,0,1,5], [1,0,3,1], [1,2,3,1], [4,1,1,1], [2,3,1,1], [3,4,2,1]]}
    }

    this.logoLabel = [
      {char: 'M', zxColor: 'brightRed', flashState: 0, bounce: 0},
      {char: 'A', zxColor: 'brightYellow', flashState: 0, bounce: 1},
      {char: 'G', zxColor: 'brightGreen', flashState: 0, bounce: 0},
      {char: 'I', zxColor: 'brightCyan', flashState: 0, bounce: 2},
      {char: 'C', zxColor: 'brightMagenta', flashState: 0, bounce: 1},
      {char: ' ', zxColor: false, flashState: false, bounce: 1},
      {char: 'M', zxColor: 'brightCyan', flashState: 1, bounce: 2},
      {char: 'I', zxColor: 'brightMagenta', flashState: 1, bounce: 0},
      {char: 'N', zxColor: 'brightRed', flashState: 1, bounce: 1},
      {char: 'E', zxColor: 'brightYellow', flashState: 1, bounce: 0},
      {char: 'R', zxColor: 'brightGreen', flashState: 1, bounce: 2}
    ]
  } // constructor

  getTextChar(position) {
    return this.logoLabel[position];
  } // getTextChar

  getTextLength() {
    return this.logoLabel.length;
  } // getTextLength

  getPenColorChar(position) {
    return this.zxColor(this.logoLabel[position]['zxColor']);
  } // getPenColorChar

  getCharData(char) {
    var charObject = {};
    charObject['width'] = this.logoFonts[char['char']]['width'];

    charObject['data'] = [];
    for (var x = 0; x < this.logoFonts[char['char']]['data'].length; x++) {
      var piece = this.logoFonts[char['char']]['data'][x];
      charObject['data'].push([piece[0], piece[1]+char['bounce'], piece[2], piece[3]]);
    }

    return charObject;
  } // getCharData

} // class LogoView

export default LogoView;
