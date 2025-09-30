/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class SignboardEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, animationMode) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'SignboardEntity';
    
    this.animationMode = animationMode;
    this.animateState = 0;
    this.loadTimer = false;
    this.cursorX = 0;
    this.scale = 1;

    this.fontsData = {
      ' ': {width: 5, data: []},
      'M': {width: 6, data: [[0,0,1,5], [1,1,1,1], [2,2,1,1], [3,1,1,1], [4,0,1,5]]},
      'A': {width: 6, data: [[0,1,1,4], [1,0,3,1], [1,3,3,1], [4,1,1,4]]},
      'N': {width: 6, data: [[0,0,1,5], [1,1,1,1], [2,2,1,1], [3,3,1,1], [4,0,1,5]]},
      'I': {width: 4, data: [[0,0,3,1], [1,1,1,3], [0,4,3,1]]},
      'C': {width: 6, data: [[0,1,1,3], [1,0,3,1], [4,1,1,1], [1,4,3,1], [4,3,1,1]]},
      'E': {width: 6, data: [[0,0,1,5], [1,0,4,1], [1,2,3,1], [1,4,4,1]]},
      'R': {width: 6, data: [[0,0,1,5], [1,0,3,1], [1,2,3,1], [4,1,1,1], [2,3,1,1], [3,4,2,1]]}
    }

    this.textData = [
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
    if (animationMode == 'splashScreen') {
      this.textData[6].resetCursor = true;
      this.scale = 8;
    }

    this.app.layout.newDrawingCache(this, 0);
    this.app.layout.newDrawingCache(this, 1);
    if (animationMode == 'menuLabel') {
      this.app.layout.newDrawingCache(this, 2);
      this.app.layout.newDrawingCache(this, 3);
    }
  } // constructor

  handleEvent(event) {
    switch (event.id) {
      case 'changeFlashState':
        this.animateState = {false: 0, true: 1}[this.app.stack.flashState];
        break;
    }
    return super.handleEvent(event);
  } // handleEvent

  getCharData(char) {
    var charObject = {};
    charObject.data = [];
    charObject.width = this.fontsData[char.char].width;

    for (var x = 0; x < this.fontsData[char.char].data.length; x++) {
      var piece = this.fontsData[char.char].data[x];
      switch (this.animationMode) {
        case 'menuLabel':
          charObject.data.push([piece[0], piece[1]+[0,1,2,1,0,1][char.bounce+this.animateState], piece[2], piece[3]]);
          break;
        case 'splashScreen':
          if (char.flashState == this.app.stack.flashState) {
            if (this.loadTimer !== false) {
              var loaded = (this.app.now-this.loadTimer)/1380;
              if (loaded >= 1) {
                this.loadTimer = false;
              } else {
                var loadedY = Math.floor(8*loaded);
                var loadedX = Math.floor(256*loaded-32*loadedY);
                var posX = 2+this.cursorX+piece[0];
                var posY = piece[1]+char.bounce+1;
                var width = piece[2];
                var height = piece[3];
                if ((posY < loadedY) || ((posX < loadedX) && (posY == loadedY))) {
                  if ((posY == loadedY) && (posX+width > loadedX)) {
                    width = Math.floor((loadedX-posX)/8);
                  }
                  if ((posX <= loadedX) && (posY+height > loadedY)) {
                    height = loadedY-posY;
                  }
                  if ((posX > loadedX) && (posY+height > loadedY-1)) {
                    height = loadedY-posY-1;
                  }
                  charObject.data.push([piece[0], (piece[1]+char.bounce), width, height]);
                }
              }
            }
            if (this.loadTimer === false) {
              charObject.data.push([piece[0], (piece[1]+char.bounce), piece[2], piece[3]]);
            }
          }
          break;
        }
    }

    return charObject;
  } // getCharData

  drawSignboard(ctx, posX, posY) {
    this.cursorX = 0;
    for (var ch = 0; ch < this.textData.length; ch++) {
      if (ch == 6 && this.animationMode == 'splashScreen') {
        this.cursorX = 0;
      }
      var penColor = this.app.platform.colorByName(this.textData[ch].color);
      var charData = this.getCharData(this.textData[ch]);
      for (var x = 0; x < charData.data.length; x++) {
        this.app.layout.paintRect(ctx, posX+this.cursorX+charData.data[x][0]*this.scale, posY+charData.data[x][1]*this.scale, charData.data[x][2]*this.scale, charData.data[x][3]*this.scale, penColor);
      }
      this.cursorX += charData.width*this.scale;
    }
  } // drawSignboard

  drawEntity() {
    super.drawEntity();

    if (this.animationMode == 'splashScreen' && this.loadTimer !== false) {
      this.drawSignboard(this.app.stack.ctx, this.parentX+this.x, this.parentY+this.y);
    } else {
      if (this.drawingCache[this.animateState].needToRefresh(this, this.width, this.height)) {
        this.drawSignboard(this.drawingCache[this.animateState].ctx, 0, 0);
      }
      this.app.layout.paintCache(this, this.animateState);
    }

  } // drawEntity

} // class SignboardEntity

export default SignboardEntity;
