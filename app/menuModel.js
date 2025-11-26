/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { MenuEntity } = await import('./svision/js/platform/canvas2D/menuEntity.js?ver='+window.srcVersion);
const { SignboardEntity } = await import('./signboardEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { ZXPlayerNameEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxPlayerNameEntity.js?ver='+window.srcVersion);
const { HallOfFameEntity } = await import('./hallOfFameEntity.js?ver='+window.srcVersion);
const { ZXVolumeEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxVolumeEntity.js?ver='+window.srcVersion);
const { ZXControlsEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxControlsEntity.js?ver='+window.srcVersion);
const { AboutEntity } = await import('./aboutEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import MenuEntity from './svision/js/platform/canvas2D/menuEntity.js';
import SignboardEntity from './signboardEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import ZXPlayerNameEntity from './svision/js/platform/canvas2D/zxSpectrum/zxPlayerNameEntity.js';
import HallOfFameEntity from './hallOfFameEntity.js';
import ZXVolumeEntity from './svision/js/platform/canvas2D/zxSpectrum/zxVolumeEntity.js';
import ZXControlsEntity from './svision/js/platform/canvas2D/zxSpectrum/zxControlsEntity.js';
import AboutEntity from './aboutEntity.js';
/**/
// begin code

export class MenuModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MenuModel';

    this.menuItems = [
      {t1: 'START GAME', event: 'startGame'},
      {t1: 'PLAYER NAME', event: 'setPlayerName'},
      {t1: 'HALL OF FAME', event: 'showHallOfFame'},
      {t1: 'SOUNDS', event: 'setSounds'},
      {t1: 'MUSIC', event: 'setMusic'},
      {t1: 'CONTROLS', event: 'setControls'},
      {t1: 'SHOW TAPE LOADING', event: 'startTapeLoading'},
      {t1: 'ABOUT GAME', event: 'showAbout'}
    ];
    this.menuOptions = {
      fonts: this.app.fonts.zxFonts8x8,
      leftMargin: 9,
      rightMargin: 9,
      topMargin: 8,
      itemHeight: 12,
      t1LeftMargin: 3,
      t1TopMargin: 2, 
      t2Width: 114,
      t2RightMargin: 3,
      t2TopMargin: 2, 
      textColor: this.app.platform.colorByName('blue'),
      selectionTextColor: this.app.platform.colorByName('brightWhite'),
      selectionBarColor: this.app.platform.colorByName('brightBlue'),
      hoverColor: '#a9a9a9ff',
      selectionHoverColor: this.app.platform.colorByName('blue'),
      clickColor: '#9a9a9aff',
      selectionClickColor: '#0a2277ff'
    }

    this.signboardEntity = null;
    this.copyrightEntity = null;

    this.animationObjects = [
      {id: 'willy', x: 61, y: 160},
      {id: 'guardian', x: 21, y: 160},
      {id: 'floor', x: 13, y: 176}
    ];
    this.animationColor = '#7c7c7c';
    this.animationObjectsEntities = [];
    this.gameFrame = 0;
    this.dataLoaded = false;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('white');
    this.desktopEntity.bkColor = this.app.platform.colorByName('white');

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 13, 0, 230, 154, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new MenuEntity(this.desktopEntity, 14, 14, 228, 139, this.desktopEntity.bkColor, this.menuOptions, this, this.getMenuData));

    this.signboardEntity = new SignboardEntity(this.desktopEntity, 98, 4, 61, 7, 'menuLabel');
    this.desktopEntity.addEntity(this.signboardEntity);

    this.copyrightEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, {align: 'center'});
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.animationObjects.forEach((object, o) => {
      this.animationObjectsEntities[o] = new SpriteEntity(this.desktopEntity, 0, 0, this.animationColor, false, 0, 0);
      this.desktopEntity.addEntity(this.animationObjectsEntities[o]);
    });

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});

    this.fetchData('menu.data', {key: 'menu', when: 'required'}, {});
    
    this.app.audioManager.closeAllChannels();
  } // init

  getMenuData(self, key, row) {
    switch (key) {
      
      case 'numberOfItems':
        return self.menuItems.length;

      case 't2':
        switch (row) {
          case 1:
            return self.app.playerName;
          case 3:
            switch (self.app.audioManager.volume.sounds) {
              case 0:
                return 'OFF';
              case 10:
                return 'MAX';
            }
            return (self.app.audioManager.volume.sounds*10)+'%';
          case 4:
            switch (self.app.audioManager.volume.music) {
              case 0:
                return 'OFF';
              case 10:
                return 'MAX';
            }
            return (self.app.audioManager.volume.music*10)+'%';
        }
        break;

      default:
        if (key in self.menuItems[row]) {
          return self.menuItems[row][key];
        }
        break;

    }
    return '';
  } // getMenuData

  setData(data) {
    data.data.willy = this.app.globalData.willy;
    this.animationObjects.forEach((object, o) => {
      this.animationObjectsEntities[o].setGraphicsData(data.data[object.id]);
      this.animationObjectsEntities[o].x = object.x;
      this.animationObjectsEntities[o].y = object.y;
    });
    this.dataLoaded = true;
    super.setData(data.data);
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'startGame':
        if (!this.app.playerName.length) {
          this.desktopEntity.addModalEntity(new ZXPlayerNameEntity(this.desktopEntity, 27, 24, 202, 134, true));
        } else {
          this.app.setModel('MainModel');
        }
        return true;
      
      case 'setPlayerName':
        this.desktopEntity.addModalEntity(new ZXPlayerNameEntity(this.desktopEntity, 27, 24, 202, 134, false));
      return true;

      case 'showHallOfFame':
        this.desktopEntity.addModalEntity(new HallOfFameEntity(this.desktopEntity, 27, 24, 202, 134));
      return true;

      case 'setSounds':
        this.desktopEntity.addModalEntity(new ZXVolumeEntity(this.desktopEntity, 27, 24, 202, 134, 'sounds', 'audioChannelSounds', 'exampleJumpSound'));
        return true;

      case 'setMusic':
        this.desktopEntity.addModalEntity(new ZXVolumeEntity(this.desktopEntity, 27, 24, 202, 134, 'music', 'audioChannelMusic', 'exampleInGameMelody'));
        return true;

      case 'setControls':
        this.desktopEntity.addModalEntity(new ZXControlsEntity(this.desktopEntity, 27, 24, 202, 134));
        return true;

      case 'startTapeLoading': 
        this.app.setModel('TapeLoadingModel');
        return true;

      case 'showAbout':
        this.desktopEntity.addModalEntity(new AboutEntity(this.desktopEntity, 27, 24, 202, 134));
        return true;
          
      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {id: 'changeFlashState'});
        return true;
    }
    
    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer === false) {
      this.timer = timestamp;
    } else {
      if (this.dataLoaded) {
        var counter = Math.round((timestamp-this.timer)/250);
        this.signboardEntity.animateState = counter%4;

        counter = Math.round((timestamp-this.timer)/80);
        this.animationObjectsEntities.forEach((entity) => {
          entity.frame = counter%entity.frames;
        });
      }
    }

    if (this.desktopEntity.modalEntity) {
      this.desktopEntity.modalEntity.loopEntity(timestamp);
    }

    this.drawModel();
  } // loopModel

} // MenuModel

export default MenuModel;
