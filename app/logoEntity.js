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
    this.scale = [1, 8];
    this.logoType = logoType;
    this.loadTimer = false;

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
      {char: 'M', color: 'brightRed', flashState: false, bounce: 0},
      {char: 'A', color: 'brightYellow', flashState: false, bounce: 1},
      {char: 'N', color: 'brightGreen', flashState: false, bounce: 0},
      {char: 'I', color: 'brightCyan', flashState: false, bounce: 2},
      {char: 'C', color: 'brightMagenta', flashState: false, bounce: 1},
      {char: ' ', color: 'white', flashState: false, bounce: 0},
      {char: 'M', color: 'brightCyan', flashState: true, bounce: 2},
      {char: 'I', color: 'brightMagenta', flashState: true, bounce: 0},
      {char: 'N', color: 'brightRed', flashState: true, bounce: 1},
      {char: 'E', color: 'brightYellow', flashState: true, bounce: 0},
      {char: 'R', color: 'brightGreen', flashState: true, bounce: 2}
    ]

    if (logoType == 1) {
      this.logoLabel[6].resetCursor = true;
    }
  } // constructor

  animateUpdate() {
    this.animateState++;
    if (this.animateState > 3) {
      this.animateState = 0;
    }
  } // animateUpdate

  getTextChar(position) {
    if ((this.logoType == 1) && (position == 6)) {
      this.cursorX = 0;
      if (this.proportional == true) {
        this.cursorX++;
      }
  }
    return this.logoLabel[position];
  } // getTextChar

  getTextLength() {
    return this.logoLabel.length;
  } // getTextLength

  getPenColorChar(position) {
    return this.app.platform.colorByName(this.logoLabel[position].color);
  } // getPenColorChar

  getCharData(char, bitMask) {
    var charObject = {};
    charObject.width = this.logoFonts[char.char].width*this.scale[this.logoType];

    charObject.data = [];
    for (var x = 0; x < this.logoFonts[char.char].data.length; x++) {
      var piece = this.logoFonts[char.char].data[x];
      switch (this.logoType) {
        case 0:
          charObject.data.push([piece[0], piece[1]+[0,1,2,1,0,1][char.bounce+this.animateState], piece[2], piece[3]]);
          break;
        case 1:
          if (char.flashState == this.app.stack.flashState) {
            if (this.loadTimer !== false) {
              var loaded = (this.app.now-this.loadTimer)/1380;
              if (loaded >= 1) {
                this.loadTimer = false;
              } else {
                var loadedY = Math.floor(8*loaded);
                var loadedX = Math.floor(2048*loaded-loadedY*256);
                var posX = 16+this.cursorX+piece[0]*8;
                var posY = piece[1]+char.bounce+1;
                var width = piece[2]*8;
                var height = piece[3];
                if ((posY < loadedY) || ((posX < loadedX) && (posY == loadedY))) {
                  if ((posY == loadedY) && (posX+width > loadedX)) {
                    width = Math.floor((loadedX-posX)/8)*8;
                  }
                  if ((posX <= loadedX) && (posY+height > loadedY)) {
                    height = loadedY-posY;
                  }
                  if ((posX > loadedX) && (posY+height > loadedY-1)) {
                    height = loadedY-posY-1;
                  }
                  charObject.data.push([piece[0]*8, (piece[1]+char.bounce)*8, width, height*8]);
                }
              }
            }
            if (this.loadTimer === false) {
              charObject.data.push([piece[0]*8, (piece[1]+char.bounce)*8, piece[2]*8, piece[3]*8]);
            }
          }
          break;
        }
    }

    return charObject;
  } // getCharData

} // class LogoEntity

export default LogoEntity;
