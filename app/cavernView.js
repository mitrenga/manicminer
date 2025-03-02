/**/
const { AbstractView } = await import('./rg-lib/js/abstractView.js?ver='+window.srcVersion);
/*/
import AbstractView from './rg-lib/js/abstractView-if.js';
/**/


export class CavernView extends AbstractView {

  constructor(screen, x, y, width, height) {
    super(screen, x, y, width, height);
    this.id = 'CavernView';
  } // constructor

  drawView() {
    super.drawView();

    this.screen.cavernLayout.forEach((row, y) => {
      for (var x = 0; x < row.length/2; x++) {
        var attr = row.substring(x*2, x*2+2);
        var tile = this.screen.graphicData[attr];
        tile.forEach((row, r) => {
          for (var col = 0; col < row.length; col++) {
            var color = false; 
            if (row[col] == '#') {
              color = this.zxPenColorFromAttr(this.hexToInt(attr));
            } else {
              color = this.zxBackgroundColorFromAttr(this.hexToInt(attr));
            }
            this.paint(x*8+col, y*8+r, 1, 1, color);
          }
        });
      }
    });
  } // drawView

} // class CavernView

export default CavernView;
