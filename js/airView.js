/*/
const { AbstractView } = await import('./rg-lib/js/abstractView.js?ver='+window.srcVersion);
/*/
import AbstractView from './rg-lib/js/abstractView.js';
/**/


export class AirView extends AbstractView {

  constructor(parentView, x, y, width, height) {
    super(parentView, x, y, width, height);
    this.id = 'AirView';
  } // constructor

  drawView() {
    super.drawView();

    this.paint(0, 0, 6*8, 2, this.color('brightRed'));
    this.paint(0, 6, 6*8, 2, this.color('brightRed'));
    this.paint(6*8, 0, this.width-6*8, 2, this.color('brightGreen'));
    this.paint(6*8, 6, this.width-6*8, 2, this.color('brightGreen'));
  } // drawView

} // class AirView

export default AirView;
