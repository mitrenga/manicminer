/**/
const { AbstractView } = await import('./rg-lib/js/abstractView.js?ver='+window.srcVersion);
/*/
import AbstractView from './rg-lib/js/abstractView-if.js';
/**/


export class CavernView extends AbstractView {

  constructor(screen, x, y, width, height, cavern) {
    super(screen, x, y, width, height);
    this.id = 'CavernView';

    this.backgroundColor = this.zxColor('black');
    this.dataCavern = null;
    
    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', cavern+'.level');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        this.responser.dataCavern = JSON.parse(http.responseText);
        this.responser.screen.cavernNameView.text = this.responser.dataCavern['cavernName'];
        this.responser.screen.cavernView.backgroundColor = this.responser.zxColorFromAttr(this.responser.hexToInt(this.responser.dataCavern['blankTile']), 56, 8);;
        this.responser.screen.borderView.backgroundColor = this.responser.zxColorFromAttr(this.responser.hexToInt(this.responser.dataCavern['borderColor']), 7, 1);;
        this.responser.screen.drawScreen();
      }
    }
  } // constructor

  drawView() {
    super.drawView();

    if (this.dataCavern != null) {
      this.dataCavern['cavernLayout'].forEach((row, y) => {
        for (var x = 0; x < row.length/2; x++) {
          var attr = row.substring(x*2, x*2+2);
          if (attr != this.dataCavern['blankTile']) {
            var tile = this.dataCavern['graphicData'][attr];
            tile.forEach((row, r) => {
              for (var col = 0; col < row.length; col++) {
                var color = false; 
                if (row[col] == '#') {
                  color = this.zxPenColorFromAttr(this.hexToInt(attr)&63);
                } else {
                  color = this.zxBackgroundColorFromAttr(this.hexToInt(attr)&63);
                }
                this.paint(x*8+col, y*8+r, 1, 1, color);
              }
            });
          }
        }
      });
      
      if ('cavernImageData' in this.dataCavern) {
        for (var y = 0; y < this.dataCavern['cavernImageData'].length; y++) {
          for (var x = 0; x < this.dataCavern['cavernImageData'][y].length/2; x++) {
            var hexByte = this.dataCavern['cavernImageData'][y].substring(x*2, x*2+2);
            var binByte = this.hexToBin(hexByte);
            var attr = this.hexToInt(this.dataCavern['cavernImageAttributes'][(y%8)].substring(x*2, x*2+2));
            for (var b = 0; b < binByte.length; b++) {
              if (binByte[b] == '1') {
                this.paint(x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.zxPenColorFromAttr(attr));
              } else {
                this.paint(x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.zxBackgroundColorFromAttr(attr));
              }
            }
          }
        }
      }
    }
  } // drawView

} // class CavernView

export default CavernView;
