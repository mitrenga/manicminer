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

    this.gameFrame = 0;
    this.bwColor = '#7c7c7c';
    this.redraw = false;
    this.selectedItem = 0;
    this.menuEntities = [];
    this.menuItemColor = this.app.platform.colorByName('blue');
    this.menuSelectedItemColor = this.app.platform.colorByName('brightWhite');
    this.menuSelectedItemBkColor = this.app.platform.colorByName('brightBlue');
    this.menuItems = [
      ['START GAME', ''],
      ['PLAYER NAME', 'libmit'],
      ['HALL OF FAME', ''],
      ['SOUND', 'OFF'],
      ['MUSIC', 'OFF'],
      ['CONTROLS', ''],
      ['SHOW TAPE LOADING', ''],
      ['ABOUT GAME', '']
    ];
    this.logoEntity = null;
    this.objects = [
      {'id': 'willy', 'x': 61, 'y': 160},
      {'id': 'guardian', 'x': 21, 'y': 160},
      {'id': 'floor', 'x': 13, 'y': 176}
    ];
    this.objectsEntities = [];
    this.copyrightEntity = null;

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

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 13, 0, 230, 14, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 13, 14, 1, 136, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 13, 150, 230, 1, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 242, 14, 1, 136, false, this.app.platform.colorByName('blue')));

    for (var y = 0; y < this.menuItems.length; y++) {
      var bkColor = false;
      var penColor = this.menuItemColor;
      if (y == this.selectedItem) {
        bkColor = this.menuSelectedItemBkColor;
        penColor = this.menuSelectedItemColor;
      }
      this.menuEntities[y] = [];
      this.menuEntities[y][1] = new ZXTextEntity(this.desktopEntity, 133, 22+y*16, 100, 12, this.menuItems[y][1], penColor, bkColor, 0, true);
      this.menuEntities[y][1].margin = 2;
      this.menuEntities[y][1].justify = 1;
      this.desktopEntity.addEntity(this.menuEntities[y][1]);
      this.menuEntities[y][0] = new ZXTextEntity(this.desktopEntity, 23, 22+y*16, 140, 12, this.menuItems[y][0], penColor, bkColor, 0, true);
      this.menuEntities[y][0].margin = 2;
      this.desktopEntity.addEntity(this.menuEntities[y][0]);
    }

    this.logoEntity = new LogoEntity(this.desktopEntity, 97, 4, 61, 7, 0);
    this.desktopEntity.addEntity(this.logoEntity);

    this.copyrightEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true);
    this.copyrightEntity.justify = 2;
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.objects.forEach((object, o) => {
      this.objectsEntities[o] = new SpriteEntity(this.desktopEntity, 0, 0, this.bwColor, false, 0, 0);
      this.desktopEntity.addEntity(this.objectsEntities[o]);
    });

    this.sendEvent(250, {'id': 'updateLogo'});
  } // init

  setData(data) {
    this.objects.forEach((object, o) => {
      this.objectsEntities[o].setGraphicsData(data[object['id']]);
      this.objectsEntities[o].x = object['x'];
      this.objectsEntities[o].y = object['y'];
    });
    
    this.redraw = true;
    super.setData(data);
  } // setData

  changeMenuItem(newItem) {
    if (newItem < 0 || newItem >= this.menuItems.length) {
      return;
    }
    this.menuEntities[this.selectedItem][0].bkColor = false;
    this.menuEntities[this.selectedItem][1].bkColor = false;
    this.menuEntities[this.selectedItem][0].penColor = this.menuItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.menuItemColor;
    this.selectedItem = newItem;
    this.menuEntities[this.selectedItem][0].bkColor = this.menuSelectedItemBkColor;
    this.menuEntities[this.selectedItem][1].bkColor = this.menuSelectedItemBkColor;
    this.menuEntities[this.selectedItem][0].penColor = this.menuSelectedItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.menuSelectedItemColor;
    this.redraw = true;
} // changeMenuItem

  handleEvent(event) {
    var result = super.handleEvent(event);
    if (result == true) {
      return true;
    }

    switch (event['id']) {
      case 'keyPress':
        switch (event['key']) {
          case 'ArrowDown':
            this.changeMenuItem(this.selectedItem+1);
            return true;
          case 'ArrowUp':
            this.changeMenuItem(this.selectedItem-1);
            return true;
          }
        break;
      case 'mouseClick':
        for (var i = 0; i < this.menuItems.length; i++) {
          if ((this.menuEntities[i][0].parentX+this.menuEntities[i][0].x)*this.app.layout.ratio <= event['x'] &&
            (this.menuEntities[i][0].parentY+this.menuEntities[i][0].y)*this.app.layout.ratio <= event['y'] &&
            (this.menuEntities[i][1].parentX+this.menuEntities[i][1].x+this.menuEntities[i][1].width)*this.app.layout.ratio >= event['x'] &&
            (this.menuEntities[i][1].parentY+this.menuEntities[i][1].y+this.menuEntities[i][1].height)*this.app.layout.ratio >= event['y']
          ) {
            this.changeMenuItem(i);
            return true;
          }
        }        
        break;
      case 'updateScene':

      this.gameFrame = this.app.rotateInc(this.gameFrame, 0, 14);

      this.objectsEntities.forEach((entity) => {
          entity.incFrame();
        });
        this.redraw = true;
        return true;
      case 'updateLogo':
        this.logoEntity.animateUpdate();
        this.redraw = true;
        this.sendEvent(250, {'id': 'updateLogo'});
        return true;
      case 'setMenuData':
        var willy = Object.assign(
          event['data']['willy'],
          {
            'sprite': this.app.globalData['willy']['sprite'],
            'paintCorrections': this.app.globalData['willy']['paintCorrections'],
            'width': this.app.globalData['willy']['width'],
            'height': this.app.globalData['willy']['height'],
            'frames': this.app.globalData['willy']['frames'],
            'directions': this.app.globalData['willy']['directions']
          }
        );
        this.setData(Object.assign(event['data'], {'willy': willy}));
        return true;
    }
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.redraw == true) {
      this.redraw = false;
      this.drawModel();
    }
  }

} // class MenuModel

export default MenuModel;
