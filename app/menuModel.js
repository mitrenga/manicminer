/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { LogoEntity } = await import('./logoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { PlayerNameEntity } = await import('./playerNameEntity.js?ver='+window.srcVersion);
const { HallOfFameEntity } = await import('./hallOfFameEntity.js?ver='+window.srcVersion);
const { AboutEntity } = await import('./aboutEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import LogoEntity from './logoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import PlayerNameEntity from './playerNameEntity.js';
import HallOfFameEntity from './hallOfFameEntity.js';
import AboutEntity from './aboutEntity.js';
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
    this.menuSelectedRow = null;
    this.penMenuItemColor = this.app.platform.colorByName('blue');
    this.penSelectedMenuItemColor = this.app.platform.colorByName('brightWhite');
    this.menuEntities = [];
    this.menuItems = [
      {'label': 'START GAME', 'event': 'startGame'},
      {'label': 'PLAYER NAME', 'event': 'setPlayerName'},
      {'label': 'HALL OF FAME', 'event': 'showHallOfFame'},
      {'label': 'SOUNDS', 'event': 'setSounds'},
      {'label': 'MUSIC', 'event': 'setMusic'},
      {'label': 'CONTROLS', 'event': 'showControls'},
      {'label': 'SHOW TAPE LOADING', 'event': 'startTapeLoading'},
      {'label': 'ABOUT GAME', 'event': 'showAbout'}
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

    this.menuSelectedRow = new ZXTextEntity(this.desktopEntity, 23, 22+this.selectedItem*16, 210, 12, '', false, this.app.platform.colorByName('brightBlue'), 0, false);
    this.desktopEntity.addEntity(this.menuSelectedRow);

    for (var y = 0; y < this.menuItems.length; y++) {
      var penColor = this.penMenuItemColor;
      if (y == this.selectedItem) {
        penColor = this.penSelectedMenuItemColor;
      }
      this.menuEntities[y] = [];
      this.menuEntities[y][1] = new ZXTextEntity(this.desktopEntity, 133, 22+y*16, 100, 12, this.menuParamValue(this.menuItems[y]['event']), penColor, false, 0, true);
      this.menuEntities[y][1].margin = 2;
      this.menuEntities[y][1].justify = 1;
      this.desktopEntity.addEntity(this.menuEntities[y][1]);
      this.menuEntities[y][0] = new ZXTextEntity(this.desktopEntity, 23, 22+y*16, 140, 12, this.menuItems[y]['label'], penColor, false, 0, true);
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

  menuParamValue(event) {
    switch (event) {
      case 'setPlayerName':
        return 'libmit';
      case 'setSounds':
        if (this.app.audioManager.sounds == 0) {
          return 'OFF';
        }
        return 'ON';
      case 'setMusic':
        if (this.app.audioManager.music == 0) {
          return 'OFF';
        }
        return 'ON';
    }
    return '';
  } // menuParamValue

  refreshMenu() {
    for (var y = 0; y < this.menuItems.length; y++) {
      this.menuEntities[y][0].text = this.menuItems[y]['label'];
      this.menuEntities[y][1].text = this.menuParamValue(this.menuItems[y]['event']);
    }
  } // refreshMenu

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
    this.menuEntities[this.selectedItem][0].penColor = this.penMenuItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.penMenuItemColor;
    this.selectedItem = newItem;
    this.menuEntities[this.selectedItem][0].penColor = this.penSelectedMenuItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.penSelectedMenuItemColor;
    this.menuSelectedRow.y = 22+this.selectedItem*16;
    this.redraw = true;
} // changeMenuItem

  handleEvent(event) {
    var result = super.handleEvent(event);
    if (result == true) {
      return true;
    }

    switch (event['id']) {

      case 'startGame': 
        this.app.model.shutdown();
        this.app.model = this.app.newModel('MainModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;
      
      case 'startTapeLoading': 
        this.app.model.shutdown();
        this.app.model = this.app.newModel('TapeLoadingModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;

      case 'setSounds':
        if (this.app.audioManager.sounds == 0) {
          this.app.audioManager.sounds = 0.3;
        } else {
          this.app.audioManager.sounds = 0;
        }
        this.app.setCookie('audioChannelSounds', this.app.audioManager.sounds);
        this.refreshMenu();
        return true;

      case 'setMusic':
        if (this.app.audioManager.music == 0) {
          this.app.audioManager.music = 0.3;
        } else {
          this.app.audioManager.music = 0;
        }
        this.app.setCookie('audioChannelMusic', this.app.audioManager.music);
        this.refreshMenu();
        return true;

      case 'setPlayerName':
        this.desktopEntity.addModalEntity(new PlayerNameEntity(this.desktopEntity, 28, 42, 200, 100));
      return true;

      case 'showHallOfFame':
        this.desktopEntity.addModalEntity(new HallOfFameEntity(this.desktopEntity, 28, 26, 200, 132));
      return true;

      case 'showAbout':
        this.desktopEntity.addModalEntity(new AboutEntity(this.desktopEntity, 27, 24, 202, 134));
      return true;
  
      case 'keyPress':
        switch (event['key']) {
          case 'Enter':
            this.sendEvent(0, {'id': this.menuItems[this.selectedItem]['event']});
            return true;
          case 'ArrowDown':
            this.changeMenuItem(this.selectedItem+1);
            return true;
          case 'ArrowUp':
            this.changeMenuItem(this.selectedItem-1);
            return true;
          }
        break;
        
      case 'mouseClick':
        if (event['key'] == 'left') {
          for (var i = 0; i < this.menuItems.length; i++) {
            if ((this.menuEntities[i][0].pointOnEntity(event)) || (this.menuEntities[i][1].pointOnEntity(event))) {
              this.changeMenuItem(i);
              this.sendEvent(0, {'id': this.menuItems[this.selectedItem]['event']});
              return true;
            }
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
