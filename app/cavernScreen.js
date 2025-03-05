/**/
const { AbstractScreen } = await import('./rg-lib/js/abstractScreen.js?ver='+window.srcVersion);
const { AbstractView } = await import('./rg-lib/js/abstractView.js?ver='+window.srcVersion);
const { ZXTextView } = await import('./rg-lib/js/platforms/zxSpectrum/zxTextView.js?ver='+window.srcVersion);
const { CavernView } = await import('./cavernView.js?ver='+window.srcVersion);
const { AirView } = await import('./airView.js?ver='+window.srcVersion);
/*/
import AbstractScreen from './rg-lib/js/abstractScreen-if.js';
import AbstractView from './rg-lib/js/abstractView-if.js';
import ZXTextView from '././rg-lib/js/platforms/zxSpectrum/zxTextView-if.js';
import CavernView from './cavernView-if.js';
import AirView from './airView-if.js';
/**/

export class CavernScreen extends AbstractScreen {
  
  constructor(app, ctx, cavernNumber) {
    super(app, ctx, 'CavernScreen');

    this.cavernNumber = cavernNumber;
    this.cavernView = null;
    this.airView = null;
    this.cavernNameView = null;
    this.scoreView = null;
  } // constructor

  init() {
    super.init();

    this.borderView.bkColor = this.color('black');
    this.cavernView = new CavernView(this.desktopView, 0, 0, 32*8, 16*8, this.cavernNumber.toString().padStart(2, '0'));
    this.desktopView.addView(this.cavernView);
    this.cavernNameView = new ZXTextView(this.desktopView, 0, 16*8, 32*8, 8, '', this.color('black'), this.color('yellow'), 0, false);
    this.cavernNameView.justify = 2;
    this.desktopView.addView(this.cavernNameView);
    this.desktopView.addView(new ZXTextView(this.desktopView, 0, 17*8, 4*8, 8, 'AIR', this.color('brightWhite'), this.color('brightRed'), 0, false));
    this.desktopView.addView(new AirView(this.desktopView, 4*8, 17*8, 28*8, 8));
    this.desktopView.addView(new AbstractView(this.desktopView, 0, 18*8, 32*8, 8, false, this.color('black')));
    this.scoreView = new ZXTextView(this.desktopView, 0, 19*8, 32*8, 8, 'High Score 000000   Score 000000', this.color('brightYellow'), this.color('brightBlack'), 0, false);
    this.desktopView.addView(this.scoreView);
    this.desktopView.addView(new AbstractView(this.desktopView, 0, 20*8, 32*8, 8, false, this.color('black')));
    this.desktopView.addView(new AbstractView(this.desktopView, 0, 21*8, 32*8, 3*8, false, this.color('black')));
  } // init

  loopScreen() {
    super.loopScreen();

  } // loopScreen

} // class CavernScreen

export default CavernScreen;
