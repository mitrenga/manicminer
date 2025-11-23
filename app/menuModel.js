/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
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

    this.gameFrame = 0;
    this.dataLoaded = false;

    this.selection = 0;
    this.hoverColor = '#a9a9a9ff';
    this.selectionHoverColor = this.app.platform.colorByName('blue');
    this.selectionEntity = null;
    this.itemPenColor = this.app.platform.colorByName('blue');
    this.selectionItemPenColor = this.app.platform.colorByName('brightWhite');
    this.menuEntities = [];
    this.menuItems = [
      {label: 'START GAME', event: 'startGame'},
      {label: 'PLAYER NAME', event: 'setPlayerName'},
      {label: 'HALL OF FAME', event: 'showHallOfFame'},
      {label: 'SOUNDS', event: 'setSounds'},
      {label: 'MUSIC', event: 'setMusic'},
      {label: 'CONTROLS', event: 'setControls'},
      {label: 'SHOW TAPE LOADING', event: 'startTapeLoading'},
      {label: 'ABOUT GAME', event: 'showAbout'}
    ];

    this.animationObjects = [
      {id: 'willy', x: 61, y: 160},
      {id: 'guardian', x: 21, y: 160},
      {id: 'floor', x: 13, y: 176}
    ];
    this.animationColor = '#7c7c7c';
    this.animationObjectsEntities = [];
    this.signboardEntity = null;
    this.copyrightEntity = null;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('white');
    this.desktopEntity.bkColor = this.app.platform.colorByName('white');

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 13, 0, 230, 154, false, this.app.platform.colorByName('blue')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 14, 14, 228, 139, false, this.desktopEntity.bkColor));

    this.selectionEntity = new AbstractEntity(this.desktopEntity, 23, 22+this.selection*16, 210, 12, false, this.app.platform.colorByName('brightBlue'));
    this.desktopEntity.addEntity(this.selectionEntity);

    for (var y = 0; y < this.menuItems.length; y++) {
      var penColor = this.itemPenColor;
      if (y == this.selection) {
        penColor = this.selectionItemPenColor;
      }
      this.menuEntities[y] = [];
      this.menuEntities[y][0] = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 23, 22+y*16, 210, 12, this.menuItems[y].label, penColor, false, {topMargin: 2, leftMargin: 3});
      if (y != this.selection) {
        this.menuEntities[y][0].hoverColor = this.hoverColor;
      } else {
        this.menuEntities[y][0].hoverColor = this.selectionHoverColor;
      }
      this.desktopEntity.addEntity(this.menuEntities[y][0]);
      this.menuEntities[y][1] = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 119, 22+y*16, 114, 12, this.menuParamValue(this.menuItems[y].event), penColor, false, {topMargin: 2, rightMargin: 3, align: 'right'});
      this.desktopEntity.addEntity(this.menuEntities[y][1]);
    }

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

  menuParamValue(event) {
    switch (event) {
      case 'setPlayerName':
        return this.app.playerName;
      case 'setSounds':
        switch (this.app.audioManager.volume.sounds) {
          case 0:
            return 'OFF';
          case 10:
            return 'MAX';
        }
        return (this.app.audioManager.volume.sounds*10)+'%';
      case 'setMusic':
        switch (this.app.audioManager.volume.music) {
          case 0:
            return 'OFF';
          case 10:
            return 'MAX';
        }
        return (this.app.audioManager.volume.music*10)+'%';
    }
    return '';
  } // menuParamValue

  refreshMenu() {
    for (var y = 0; y < this.menuItems.length; y++) {
      this.menuEntities[y][0].setText(this.menuItems[y].label);
      this.menuEntities[y][1].setText(this.menuParamValue(this.menuItems[y].event));
    }
  } // refreshMenu

  changeMenuItem(newSelection) {
    if (newSelection < 0 || newSelection >= this.menuItems.length) {
      return;
    }
    this.menuEntities[this.selection][0].hoverColor = this.hoverColor;
    this.menuEntities[this.selection][0].setPenColor(this.itemPenColor);
    this.menuEntities[this.selection][1].setPenColor(this.itemPenColor);
    this.selection = newSelection;
    this.menuEntities[this.selection][0].hoverColor = this.selectionHoverColor;
    this.menuEntities[this.selection][0].setPenColor(this.selectionItemPenColor);
    this.menuEntities[this.selection][1].setPenColor(this.selectionItemPenColor);
    this.selectionEntity.y = 22+this.selection*16;
  } // changeMenuItem

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

      case 'refreshMenu': 
        this.refreshMenu();
        return true;
      
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
  
      case 'keyPress':
        switch (event.key) {
          case 'Enter':
            this.sendEvent(0, {id: this.menuItems[this.selection].event});
            return true;
          case 'ArrowDown':
            this.changeMenuItem(this.selection+1);
            return true;
          case 'ArrowUp':
            this.changeMenuItem(this.selection-1);
            return true;
          case 'Mouse1':
            for (var i = 0; i < this.menuItems.length; i++) {
              if ((this.menuEntities[i][0].pointOnEntity(event) || this.menuEntities[i][1].pointOnEntity(event))) {
                this.app.inputEventsManager.keysMap.Mouse1 = this.menuEntities[i][0];
                return true;
              }
            }
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
            for (var i = 0; i < this.menuItems.length; i++) {
              if ((this.menuEntities[i][0].pointOnEntity(event) || this.menuEntities[i][1].pointOnEntity(event))) {
                if (this.app.inputEventsManager.keysMap.Mouse1 === this.menuEntities[i][0]) {
                  this.changeMenuItem(i);
                  this.sendEvent(0, {id: this.menuItems[this.selection].event});
                  return true;
                }
              }
            }
        }
        break;
        
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
