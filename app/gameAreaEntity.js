/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { DrawingCache } = await import('./svision/js/platform/canvas2D/drawingCache.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import DrawingCache from './svision/js/platform/canvas2D/drawingCache.js';
/**/
// begin code

export class GameAreaEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, caveNumber) {
    super(parentEntity, x, y, width, height);
    this.id = 'GameAreaEntity';

    this.caveNumber = caveNumber;
    this.data = null;

    this.app.layout.newDrawingCache(this, 0); 
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty'];
  } // constructor

  drawEntity() {
    if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {
      if (this.data) {
        this.app.layout.paintRect(this.drawingCache[0].ctx, 0, 0, this.width, this.height, this.app.platform.zxColorByAttr(this.app.hexToInt(this.data.bkColor), 56, 8));
        this.data.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.data.bkColor) {
              if (this.staticKinds.includes(this.data.graphicData[attr].kind)) {
                if (this.graphicCache[attr].needToRefresh(this, 8, 8)) {
                  var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
                  var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr));
                  if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.data.bkColor))) {
                    bkColor = false;
                  }
                  if (bkColor != false) {
                    this.app.layout.paintRect(this.graphicCache[attr].ctx, 0, 0, 8, 8, bkColor);
                  }
                  for (var y = 0; y < this.data.graphicData[attr].sprite.length; y++) {
                    for (var x = 0; x < this.data.graphicData[attr].sprite[y].length; x++) {
                      if (this.data.graphicData[attr].sprite[y][x] == '#') {
                        this.app.layout.paintRect(this.graphicCache[attr].ctx, x, y, 1, 1, penColor);
                      }
                    }
                  }
                }
                this.drawingCache[0].ctx.drawImage(this.graphicCache[attr].canvas, column*8*this.app.layout.ratio, r*8*this.app.layout.ratio);
              }
            }
          }
        });
        if ('image' in this.data) {
          for (var y = 0; y < this.data.image.data.length; y++) {
            for (var x = 0; x < this.data.image.data[y].length/2; x++) {
              var hexByte = this.data.image.data[y].substring(x*2, x*2+2);
              var binByte = this.app.hexToBin(hexByte);
              var attr = this.app.hexToInt(this.data.image.attributes[(y%8)].substring(x*2, x*2+2));
              for (var b = 0; b < binByte.length; b++) {
                if (binByte[b] == '1') {
                  this.app.layout.paintRect(this.drawingCache[0].ctx, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.penColorByAttr(attr));
                } else {
                  if (this.app.platform.bkColorByAttr(attr) != this.bkColor) {
                    this.app.layout.paintRect(this.drawingCache[0].ctx, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.bkColorByAttr(attr));
                  }
                }
              }
            }
          }
        }
      }
    }
    this.app.layout.paintCache(this, 0);
    super.drawSubEntities();
  } // drawEntity

  setData(data) {
    this.data = data;
    this.drawingCache[0].cleanCache();
    this.graphicCache = {};
    Object.keys(data.graphicData).forEach((key) => {
      if (this.staticKinds.includes(data.graphicData[key].kind)) {
        this.graphicCache[key] = new DrawingCache(this.app);
      }
    });
  } // setData
    
} // class GameAreaEntity

export default GameAreaEntity;
