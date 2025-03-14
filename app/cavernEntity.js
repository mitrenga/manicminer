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
    this.cavernImageData = null;
  } // constructor

  drawEntity() {
    super.drawEntity();

    if (this.cavernImageData != null) {
      for (var y = 0; y < this.cavernImageData['data'].length; y++) {
        for (var x = 0; x < this.cavernImageData['data'][y].length/2; x++) {
          var hexByte = this.cavernImageData['data'][y].substring(x*2, x*2+2);
          var binByte = this.app.hexToBin(hexByte);
          var attr = this.app.hexToInt(this.cavernImageData['attributes'][(y%8)].substring(x*2, x*2+2));
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
    var dataCavern = data['dataCavern'];
    this.bkColor = this.app.platform.zxColorByAttribut(this.app.hexToInt(dataCavern['blankTile']), 56, 8);

    // layout
    dataCavern['cavernLayout'].forEach((row, y) => {
      for (var x = 0; x < row.length/2; x++) {
        var attr = row.substring(x*2, x*2+2);
        if (attr != dataCavern['blankTile']) {
          var spriteData = [];
          var tile = dataCavern['graphicData'][attr];
          tile.forEach((row, r) => {
            for (var col = 0; col < row.length; col++) {
              if (row[col] == '#') {
                spriteData.push({'x': col, 'y': r});
              }
            }
          });
          var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr)&63);
          var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr)&63);
          if (bkColor == this.app.platform.bkColorByAttribut(this.app.hexToInt(dataCavern['blankTile']))) {
            bkColor = false;
          }
          this.addEntity(new SpriteEntity(this, x*8, y*8, 8, 8, spriteData, penColor, bkColor));
        }
      }
    });

    // portal
    var attr = dataCavern['portalAttribute'];
    var portal = dataCavern['portalGraphicData'];
    var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr));
    var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr));
    var spriteData = [];
    portal.forEach((row, r) => {
      for (var col = 0; col < row.length; col++) {
        var penColor = false; 
        var bkColor = false; 
        if (row[col] == '#') {
          spriteData.push({'x': col, 'y': r});
        }
      }
    });
    this.addEntity(new SpriteEntity(this, dataCavern['portalLocation']['x']*8, dataCavern['portalLocation']['y']*8, 16, 16, spriteData, penColor, bkColor));

    if ('cavernImageData' in dataCavern) {
      this.cavernImageData = dataCavern['cavernImageData'];
    }
    super.setData(data);
  } // setData
    

} // class CavernEntity

export default CavernEntity;
