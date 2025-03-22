/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class CavernEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height);
    this.id = 'CavernEntity';

    this.bkColor = this.app.platform.colorByName('black');
    this.imageData = null;
  } // constructor

  drawEntity() {
    super.drawEntity();

    if (this.imageData != null) {
      for (var y = 0; y < this.imageData['data'].length; y++) {
        for (var x = 0; x < this.imageData['data'][y].length/2; x++) {
          var hexByte = this.imageData['data'][y].substring(x*2, x*2+2);
          var binByte = this.app.hexToBin(hexByte);
          var attr = this.app.hexToInt(this.imageData['attributes'][(y%8)].substring(x*2, x*2+2));
          for (var b = 0; b < binByte.length; b++) {
            if (binByte[b] == '1') {
              this.app.layout.paint(this, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.penColorByAttribut(attr));
            } else {
              this.app.layout.paint(this, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.bkColorByAttribut(attr));
            }
          }
        }
      }
    }
  } // drawEntity

  setData(data) {
    var cavernData = data['cavernData'];
    this.bkColor = this.app.platform.zxColorByAttribut(this.app.hexToInt(cavernData['bkColor']), 56, 8);

    // layout
    cavernData['layout'].forEach((row, y) => {
      for (var x = 0; x < row.length/2; x++) {
        var attr = row.substring(x*2, x*2+2);
        if (attr != cavernData['bkColor']) {
          var graphicData = cavernData['graphicData'][attr]
          //if (['floor', 'wall'].includes(graphicData['kind'])) {
          {
            var spriteData = [];
            var tile = graphicData['data'];
            tile.forEach((line, l) => {
              for (var col = 0; col < line.length; col++) {
                if (line[col] == '#') {
                  spriteData.push({'x': col, 'y': l});
                }
              }
            });
            var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr));
            var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr)&63);
            if (bkColor == this.app.platform.bkColorByAttribut(this.app.hexToInt(cavernData['bkColor']))) {
              bkColor = false;
            }
            this.addEntity(new SpriteEntity(this, x*8, y*8, 8, 8, spriteData, penColor, bkColor));
          }
        }
      }
    });

    // portal
    var portal =  cavernData['portal'];
    var attr = portal['attribute'];
    var data = portal['data'];
    var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr));
    var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr));
    var spriteData = [];
    data.forEach((row, r) => {
      for (var col = 0; col < row.length; col++) {
        var penColor = false; 
        var bkColor = false; 
        if (row[col] == '#') {
          spriteData.push({'x': col, 'y': r});
        }
      }
    });
    this.addEntity(new SpriteEntity(this, portal['location']['x']*8, portal['location']['y']*8, 16, 16, spriteData, penColor, bkColor));

    if ('image' in cavernData) {
      this.imageData = cavernData['image'];
    }
    
    super.setData(data);
  } // setData
    

} // class CavernEntity

export default CavernEntity;
