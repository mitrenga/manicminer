/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { InputEntity } = await import('./svision/js/platform/canvas2D/inputEntity.js?ver='+window.srcVersion);
const { KeyboardEntity } = await import('./svision/js/platform/canvas2D/keyboardEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import InputEntity from './svision/js/platform/canvas2D/inputEntity.js';
import KeyboardEntity from './svision/js/platform/canvas2D/keyboardEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class PlayerNameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, autoStartGame) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'PlayerNameEntity';

    this.inputEntity = null;
    this.autoStartGame = autoStartGame;

    this.keyboardLayout = {
      options: {
        specialKeys: {blank: '∅', enter: '⏎', backspace: '⌫'},
        buttons: {
          default: {
            width: 16, height: 16, keySpacing: 1, align: 'center', topMargin: 4,
            fonts: this.app.fonts.zxFonts8x8Keys,
            penColor: this.app.platform.colorByName('brightBlack'),
            bkColor: this.app.platform.colorByName('brightWhite')},

          'ENTER': {width: 21, fonts: this.app.fonts.fonts3x3, topMargin: 7},
          'CAPS\nSHIFT': {width: 19, fonts: this.app.fonts.fonts3x3},
          'SYMBOL\nSHIFT': {width: 25, penColor: this.app.platform.colorByName('brightRed'), fonts: this.app.fonts.fonts3x3},
          ' ': {width: 25},
        },
        rows: [{shift: 0}, {shift: 8}, {shift: 16}, {shift: 0}]
      },
      keys: {
        ' ': [
          ['1','2','3','4','5','6','7','8','9','0'],
          ['q','w','e','r','t','y','u','i','o','p'],
          ['a','s','d','f','g','h','j','k','l', 'ENTER'],
          ['CAPS\nSHIFT', 'z','x','c','v','b','n','m', 'SYMBOL\nSHIFT', ' ']
        ],
        '⇧': [
          ['∅','∅','∅','∅','←','↓','↑','➔','∅','⌫'],
          ['Q','W','E','R','T','Y','U','I','O','P'],
          ['A','S','D','F','G','H','J','K','L', '⏎'],
          ['⇧', 'Z','X','C','V','B','N','M', '⌥', ' ']
        ],
        '⌥': [
          ['!','@','#','$','%','&','\'','(',')','_'],
          ['~','∅','∅','<','>','{','}','∅',';','"'],
          ['|','∅','∅','[',']','∅','-','+','=', '⏎'],
          ['⇧', ':','£','?','/','*',',','.', '⌥', ' ']
        ]
      }
    };
  } // constructor

  init() {
    super.init();

    this.addEntity(new AbstractEntity(this, 0, 0, this.width, this.height, false, this.app.platform.colorByName('black')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, 'PLAYER NAME', this.app.platform.colorByName('brightWhite'), false, {align: 'center', topMargin: 2}));
    this.addEntity(new AbstractEntity(this, 1, 9, this.width-2, this.height-10, false, this.app.platform.colorByName('yellow')));

    this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 6, 18, this.width-12, 8, 'Enter your player name:', this.app.platform.colorByName('black'), false, {}));
    this.inputEntity = new InputEntity(this.app, this.app.fonts.zxFonts8x8, 6, 28, this.width-12, 8, this.app.playerName, this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), 15, {leftMargin: 1});
    this.addEntity(this.inputEntity);

    this.addEntity(new KeyboardEntity(this, 6, 42, 190, 67, this.keyboardLayout, false));

    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-100, this.height-18, 46, 13, 'CANCEL', 'cancel', ['Escape'], this.app.platform.colorByName('white'), this.app.platform.colorByName('red'), {align: 'center', margin: 4}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-52, this.height-18, 46, 13, 'OK', 'ok', ['Enter'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('green'), {align: 'center', margin: 4}));
  } // init

  handleEvent(event) {
    switch (event.id) { 
      case 'cancel':
        this.destroy();
        return true;

      case 'ok':
        if (this.inputEntity.value.length > 0) {
          this.app.playerName = this.inputEntity.value;
          this.app.setCookie('playerName', this.app.playerName);
          if (this.autoStartGame) {
            this.app.setModel('MainModel');
          } else {
            this.sendEvent(0, 0, {'id': 'refreshMenu'});
            this.destroy();
          }
        }
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class PlayerNameEntity

export default PlayerNameEntity;
