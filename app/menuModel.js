/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { LogoEntity } = await import('./logoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import LogoEntity from './logoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class MenuModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MenuModel';

    this.selectedItem = 0;
    this.menuItems = [
      ['START GAME', ''],
      ['SHOW TAPE LOADING', ''],
      ['CONTROLS', ''],
      ['SOUND', 'OFF'],
      ['MUSIC', 'OFF'],
      ['ABOUT GAME', '']
    ];

    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', 'menu.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setMenuData', 'data': data});
      }
    }
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('white');
    this.desktopEntity.bkColor = this.app.platform.colorByName('white');

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 0, 230, 14, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 14, 1, 104, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 118, 230, 1, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 229, 14, 1, 104, false, this.app.platform.colorByName('blue')));

    for (var y = 0; y < this.menuItems.length; y++) {
      var bkColor = false;
      var penColor = this.app.platform.colorByName('blue');
      if (y == this.selectedItem) {
        bkColor = this.app.platform.colorByName('brightBlue');
        penColor = this.app.platform.colorByName('brightWhite');
      }
      var menuItemEntity = new ZXTextEntity(this.desktopEntity, 10, 22+y*16, 170, 12, this.menuItems[y][0], penColor, bkColor, 0, true);
      menuItemEntity.margin = 2;
      this.desktopEntity.addEntity(menuItemEntity);
      menuItemEntity = new ZXTextEntity(this.desktopEntity, 180, 22+y*16, 40, 12, this.menuItems[y][1], penColor, bkColor, 0, true);
      menuItemEntity.margin = 2;
      menuItemEntity.justify = 1;
      this.desktopEntity.addEntity(menuItemEntity);
    }

    this.desktopEntity.addEntity(new LogoEntity(this.desktopEntity, 84, 4, 61, 7, 0));

    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true));
  } // init

  setData(data) {
    var bwColor = '#7c7c7c';

    var willy =  data['willy'];
    var willySprite = willy['sprite'][0];
    var spriteData = [];
    var spriteWidth = 0;
    var spriteHeight = 0;
    willySprite.forEach((row, r) => {
      for (var col = 0; col < row.length; col++) {
        if (row[col] == '#') {
          spriteData.push({'x': col, 'y': r});
          if (col+1 > spriteWidth) {
            spriteWidth = col+1;
          }
        }
      }
      spriteHeight++;
    });
    this.desktopEntity.addEntity(
      new SpriteEntity(
        this.desktopEntity,
        8+willy['paintCorrections']['x'],
        140+willy['paintCorrections']['y'],
        spriteWidth,
        spriteHeight,
        spriteData,
        bwColor,
        false
      )
    );

    var guardian = data['guardian'];
    var guardianSprite = guardian['sprite'][0];
    var spriteData = [];
    var spriteWidth = 0;
    var spriteHeight = 0;
    guardianSprite.forEach((row, r) => {
      for (var col = 0; col < row.length; col++) {
        if (row[col] == '#') {
          spriteData.push({'x': col, 'y': r});
          if (col+1 > spriteWidth) {
            spriteWidth = col+1;
          }
        }
      }
      spriteHeight++;
    });
    this.desktopEntity.addEntity(
      new SpriteEntity(
        this.desktopEntity,
        48+willy['paintCorrections']['x'],
        140+willy['paintCorrections']['y'],
        spriteWidth,
        spriteHeight,
        spriteData,
        bwColor,
        false
      )
    );

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 156, 230, 1, false, bwColor));
    
    super.setData(data);
  } // setData

  handleEvent(event) {
    switch (event['id']) {
      case 'setMenuData':
        var willy = Object.assign(
          event['data']['willy'],
          {
            'sprite': this.app.globalData['willy']['sprite'],
            'paintCorrections': this.app.globalData['willy']['paintCorrections'],
            'width': this.app.globalData['willy']['width'],
            'height': this.app.globalData['willy']['height']
          }
        );
        this.setData(Object.assign(event['data'], {'willy': willy}));
        return true;
    }
    return super.handlEvent(event);
  } // handleEvent

} // class MenuModel

export default MenuModel;
