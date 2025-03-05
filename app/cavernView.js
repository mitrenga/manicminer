/**/
const { AbstractView } = await import('./rg-lib/js/abstractView.js?ver='+window.srcVersion);
const { SpriteView } = await import('./rg-lib/js/spriteView.js?ver='+window.srcVersion);
/*/
import AbstractView from './rg-lib/js/abstractView-if.js';
import SpriteView from './rg-lib/js/spriteView-if.js';
/**/


export class CavernView extends AbstractView {

  constructor(parentView, x, y, width, height, cavern) {
    super(parentView, x, y, width, height);
    this.id = 'CavernView';

    this.bkColor = this.color('black');
    this.dataCavern = null;
    
    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', cavern+'.level');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        this.responser.dataCavern = JSON.parse(http.responseText);
        this.responser.screen.cavernNameView.text = this.responser.dataCavern['cavernName'];
        this.responser.screen.cavernView.bkColor = this.responser.app.platform.zxColorByAttribut(this.responser.hexToInt(this.responser.dataCavern['blankTile']), 56, 8);
        this.responser.screen.borderView.bkColor = this.responser.app.platform.zxColorByAttribut(this.responser.hexToInt(this.responser.dataCavern['borderColor']), 7, 1);
        
        // layout
        this.responser.dataCavern['cavernLayout'].forEach((row, y) => {
          for (var x = 0; x < row.length/2; x++) {
            var attr = row.substring(x*2, x*2+2);
            if (attr != this.responser.dataCavern['blankTile']) {
              var spriteData = [];
              var tile = this.responser.dataCavern['graphicData'][attr];
              tile.forEach((row, r) => {
                for (var col = 0; col < row.length; col++) {
                  if (row[col] == '#') {
                    spriteData.push({'x': col, 'y': r});
                  }
                }
              });
              var penColor = this.responser.penColorByAttribut(this.responser.hexToInt(attr)&63);
              var bkColor = this.responser.bkColorByAttribut(this.responser.hexToInt(attr)&63);
              if (bkColor == this.responser.bkColorByAttribut(this.responser.hexToInt(this.responser.dataCavern['blankTile']))) {
                bkColor = false;
              }
              this.responser.addView(new SpriteView(this.responser, x*8, y*8, 8, 8, spriteData, penColor, bkColor));
            }
          }
        });

        // portal
        var attr = this.responser.dataCavern['portalAttribute'];
        var portal = this.responser.dataCavern['portalGraphicData'];
        var penColor = this.responser.penColorByAttribut(this.responser.hexToInt(attr));
        var bkColor = this.responser.bkColorByAttribut(this.responser.hexToInt(attr));
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
        this.responser.addView(new SpriteView(this.responser, this.responser.dataCavern['portalLocation']['x']*8, this.responser.dataCavern['portalLocation']['y']*8, 16, 16, spriteData, penColor, bkColor));
        
        this.responser.screen.drawScreen();
      }
    }
  } // constructor

  drawView() {
    super.drawView();

    if (this.dataCavern != null) {
      if ('cavernImageData' in this.dataCavern) {
        for (var y = 0; y < this.dataCavern['cavernImageData'].length; y++) {
          for (var x = 0; x < this.dataCavern['cavernImageData'][y].length/2; x++) {
            var hexByte = this.dataCavern['cavernImageData'][y].substring(x*2, x*2+2);
            var binByte = this.hexToBin(hexByte);
            var attr = this.hexToInt(this.dataCavern['cavernImageAttributes'][(y%8)].substring(x*2, x*2+2));
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
    }
  } // drawView

} // class CavernView

export default CavernView;
