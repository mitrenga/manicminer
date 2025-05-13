/**/
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
/*/
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
/**/
// begin code

export class LogoEntity extends TextEntity {

  constructor(parentEntity, x, y, width, height, logoType) {
    super(parentEntity, x, y, width, height);
    this.id = 'LogoEntity';
    
    this.proportional = true;
    this.justify = 0;
    this.animateState = 0;
    this.logoType = logoType;

    this.logoFonts = {
      ' ': {width: 5, data: []},
      'M': {width: 6, data: [[0,0,1,5], [1,1,1,1], [2,2,1,1], [3,1,1,1], [4,0,1,5]]},
      'A': {width: 6, data: [[0,1,1,4], [1,0,3,1], [1,3,3,1], [4,1,1,4]]},
      'G': {width: 6, data: [[0,1,1,3], [1,0,3,1], [1,4,3,1], [4,2,1,2], [3,2,1,1]]},
      'I': {width: 4, data: [[0,0,3,1], [1,1,1,3], [0,4,3,1]]},
      'C': {width: 6, data: [[0,1,1,3], [1,0,3,1], [4,1,1,1], [1,4,3,1], [4,3,1,1]]},
      'N': {width: 6, data: [[0,0,1,5], [1,1,1,1], [2,2,1,1], [3,3,1,1], [4,0,1,5]]},
      'E': {width: 6, data: [[0,0,1,5], [1,0,4,1], [1,2,3,1], [1,4,4,1]]},
      'R': {width: 6, data: [[0,0,1,5], [1,0,3,1], [1,2,3,1], [4,1,1,1], [2,3,1,1], [3,4,2,1]]}
    }

    this.logoLabel = [
      {char: 'M', color: 'brightRed', flashState: 0, bounce: 0},
      {char: 'A', color: 'brightYellow', flashState: 0, bounce: 1},
      {char: 'N', color: 'brightGreen', flashState: 0, bounce: 0},
      {char: 'I', color: 'brightCyan', flashState: 0, bounce: 2},
      {char: 'C', color: 'brightMagenta', flashState: 0, bounce: 1},
      {char: ' ', color: false, flashState: false, bounce: 1},
      {char: 'M', color: 'brightCyan', flashState: 1, bounce: 2},
      {char: 'I', color: 'brightMagenta', flashState: 1, bounce: 0},
      {char: 'N', color: 'brightRed', flashState: 1, bounce: 1},
      {char: 'E', color: 'brightYellow', flashState: 1, bounce: 0},
      {char: 'R', color: 'brightGreen', flashState: 1, bounce: 2}
    ]
  } // constructor

  animateUpdate() {
    this.animateState++;
    if (this.animateState > 3) {
      this.animateState = 0;
    }
  } // animateUpdate

  getTextChar(position) {
    return this.logoLabel[position];
  } // getTextChar

  getTextLength() {
    return this.logoLabel.length;
  } // getTextLength

  getPenColorChar(position) {
    return this.app.platform.colorByName(this.logoLabel[position]['color']);
  } // getPenColorChar

  getCharData(char, bitMask) {
    var charObject = {};
    charObject['width'] = this.logoFonts[char['char']]['width'];

    charObject['data'] = [];
    for (var x = 0; x < this.logoFonts[char['char']]['data'].length; x++) {
      var piece = this.logoFonts[char['char']]['data'][x];
      charObject['data'].push([piece[0], piece[1]+[0,1,2,1,0,1][char['bounce']+this.animateState], piece[2], piece[3]]);
    }

    return charObject;
  } // getCharData

} // class LogoEntity

export default LogoEntity;
