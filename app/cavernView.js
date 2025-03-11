/**/
const { AbstractView } = await import('./svision/js/abstractView.js?ver='+window.srcVersion);
const { SpriteView } = await import('./svision/js/spriteView.js?ver='+window.srcVersion);
/*/
import AbstractView from './svision/js/abstractView.js';
import SpriteView from './svision/js/spriteView.js';
/**/
// begin code

export class CavernView extends AbstractView {

  constructor(parentView, x, y, width, height) {
    super(parentView, x, y, width, height);
    this.id = 'CavernView';

    this.bkColor = this.color('black');
    this.cavernImageData = null;
  } // constructor

  drawView() {
    super.drawView();

    if (this.cavernImageData != null) {
      for (var y = 0; y < this.cavernImageData['data'].length; y++) {
        for (var x = 0; x < this.cavernImageData['data'][y].length/2; x++) {
          var hexByte = this.cavernImageData['data'][y].substring(x*2, x*2+2);
          var binByte = this.hexToBin(hexByte);
          var attr = this.hexToInt(this.cavernImageData['attributes'][(y%8)].substring(x*2, x*2+2));
          for (var b = 0; b < binByte.length; b++) {
            if (binByte[b] == '1') {
              this.paint(x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.penColorByAttribut(attr));
            } else {
              this.paint(x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.bkColorByAttribut(attr));
            }
          }
        }
      }
    }
  } // drawView

  setData(data) {
    var dataCavern = data['dataCavern'];
    this.bkColor = this.app.platform.zxColorByAttribut(this.hexToInt(dataCavern['blankTile']), 56, 8);

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
          var penColor = this.penColorByAttribut(this.hexToInt(attr)&63);
          var bkColor = this.bkColorByAttribut(this.hexToInt(attr)&63);
          if (bkColor == this.bkColorByAttribut(this.hexToInt(dataCavern['blankTile']))) {
            bkColor = false;
          }
          this.addView(new SpriteView(this, x*8, y*8, 8, 8, spriteData, penColor, bkColor));
        }
      }
    });

    // portal
    var attr = dataCavern['portalAttribute'];
    var portal = dataCavern['portalGraphicData'];
    var penColor = this.penColorByAttribut(this.hexToInt(attr));
    var bkColor = this.bkColorByAttribut(this.hexToInt(attr));
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
    this.addView(new SpriteView(this, dataCavern['portalLocation']['x']*8, dataCavern['portalLocation']['y']*8, 16, 16, spriteData, penColor, bkColor));

    if ('cavernImageData' in dataCavern) {
      this.cavernImageData = dataCavern['cavernImageData'];
    }
    super.setData(data);
  } // setData
    

} // class CavernView

export default CavernView;
