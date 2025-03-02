/**/
const { AbstractScreen } = await import('./rg-lib/js/abstractScreen.js?ver='+window.srcVersion);
const { AbstractView } = await import('./rg-lib/js/abstractView.js?ver='+window.srcVersion);
const { ZXTextView } = await import('./rg-lib/js/platforms/zxSpectrum/zxTextView.js?ver='+window.srcVersion);
const { LogoView } = await import('./logoView.js?ver='+window.srcVersion);
/*/
import AbstractScreen from './rg-lib/js/abstractScreen-if.js';
import AbstractView from './rg-lib/js/abstractView-if.js';
import ZXTextView from './rg-lib/js/platforms/zxSpectrum/zxTextView-if.js';
import LogoView from './logoView-if.js';
/**/

export class MenuScreen extends AbstractScreen {
  
  constructor(canvas, ctx) {
    super(canvas, ctx, 'MenuScreen');

    this.selectedItem = 0;
    this.menuItems = [
      ['START GAME', ''],
      ['SOUND', 'OFF'],
      ['MUSIC', 'OFF'],
      ['CONTROLS', ''],
      ['SCALE', '100%'],
      ['HOW TO PLAY', ''],
      ['RESET GAME', '']
    ];
  } // constructor

  init() {
    super.init();

    this.borderView.backgroundColor = '#666666';
    this.desktopView.backgroundColor = '#666666';

    this.desktopView.addView(new AbstractView(this, 0, 0, this.desktopWidth, 14, false, this.zxColor('black')));
    this.desktopView.addView(new AbstractView(this, 0, 14, 1, this.desktopHeight-15, false, this.zxColor('black')));
    this.desktopView.addView(new AbstractView(this, 0, this.desktopHeight-1, this.desktopWidth, 1, false, this.zxColor('black')));
    this.desktopView.addView(new AbstractView(this, this.desktopWidth-1, 14, 1, this.desktopHeight-15, false, this.zxColor('black')));

    for (var y = 0; y < this.menuItems.length; y++) {
      var backgroudColor = false;
      var penColor = this.zxColor('blue');
      if (y == this.selectedItem) {
        backgroudColor = this.zxColor('brightBlue');
        penColor = this.zxColor('brightWhite');
      }
      var menuItemView = new ZXTextView(this, 3*8, (6+y*2)*8-2, 15*8, 8+4, this.menuItems[y][0], penColor, backgroudColor, 1, true);
      menuItemView.margin = 2;
      this.desktopView.addView(menuItemView);
      menuItemView = new ZXTextView(this, 18*8, (6+y*2)*8-2, 5*8, 8+4, this.menuItems[y][1], penColor, backgroudColor, 1, true);
      menuItemView.margin = 2;
      menuItemView.justify = 1;
      this.desktopView.addView(menuItemView);
    }

    this.desktopView.addView(new LogoView(this, this.desktopWidth-64, 4, 60, 7, 0));
  } // init

  loopScreen() {
    super.loopScreen();
  } // loopScreen

  drawScreen2() {
    introLabel.forEach((il) => {
        var c = this.zxColors[il['zxColor']];
        this.ctx.fillStyle = 'rgba('+Number('0x'+c[1]+c[2])+','+Number('0x'+c[3]+c[4])+','+Number('0x'+c[5]+c[6])+', 1)';
        introFonts[il['font']].forEach((f) => {
          this.ctx.fillRect(this.borderWidth+188+il['flashState']*34+(il['x']+f[0]), this.borderHeight+(4+il['y']+f[1]), 1, 1);
        });
    });
  } // drawScreen2

} // class MenuScreen

export default MenuScreen;
