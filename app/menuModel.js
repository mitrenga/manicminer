const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
const { MenuEntity } = await import('./svision/js/platform/canvas2D/menuEntity.js?ver='+window.srcVersion);
const { SignboardEntity } = await import('./signboardEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { ZXPlayerNameEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxPlayerNameEntity.js?ver='+window.srcVersion);
const { HallOfFameEntity } = await import('./hallOfFameEntity.js?ver='+window.srcVersion);
const { ZXVolumeEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxVolumeEntity.js?ver='+window.srcVersion);
const { ZXSettingsEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxSettingsEntity.js?ver='+window.srcVersion);
const { AboutEntity } = await import('./aboutEntity.js?ver='+window.srcVersion);
const { ZXWaitForAudioEventEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxWaitForAudioEventEntity.js?ver='+window.srcVersion);
const { ZXColor } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxColor.js?ver='+window.srcVersion);
const { ZXDialogEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxDialogEntity.js?ver='+window.srcVersion);
const { ZXDialogProperties } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxDialogProperties.js?ver='+window.srcVersion);
// begin code

export class MenuModel extends AbstractModel {
  
  constructor(app, selectionItem) {
    super(app);
    this.id = 'MenuModel';

    this.menuItems = [
      {t1: 'START GAME', event: {id: 'startGame'}},
      {t1: 'PLAYER NAME', event: {id: 'setPlayerName'}},
      {t1: 'HALL OF FAME', event: {id: 'showHallOfFame'}},
      {t1: 'SOUNDS', event: {id: 'setSounds'}},
      {t1: 'MUSIC', event: {id: 'setMusic'}},
      {t1: 'SETTINGS', event: {id: 'setSettings'}},
      {t1: 'SHOW TAPE LOADING', event: {id: 'startTapeLoading'}},
      {t1: 'ABOUT GAME', event: {id: 'showAbout'}}
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
      textColor: ZXColor.blue,
      selectionTextColor: ZXColor.brightWhite,
      selectionBarColor: ZXColor.brightBlue,
      hoverColor: '#a9a9a9ff',
      selectionHoverColor: ZXColor.blue,
      clickColor: '#9a9a9aff',
      selectionClickColor: '#0a2277ff',
      selection: selectionItem
    }
    // the dialogs opened from the menu: the window (ZXDialogEntity), its place
    // and colours, and the colours of the contents from svision. Everything is
    // the default — the defaults of ZXDialogProperties are the look of this game
    this.dialogProperties = ZXDialogProperties.merge({});

    this.signboardEntity = null;
    this.copyrightEntity = null;
    this.versionEntity = null;
    this.newVersionAvailable = false;

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

  newBorderEntity() {
    return new BorderEntity(false, false);
  } // newBorderEntity

  init() {
    super.init();

    this.borderEntity.bkColor = ZXColor.white;
    this.desktopEntity.bkColor = ZXColor.white;

    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 13, 0, 230, 154, false, ZXColor.blue));
    this.desktopEntity.addEntity(new MenuEntity(this.desktopEntity, 14, 14, 228, 139, this.desktopEntity.bkColor, this.menuOptions, this, this.getMenuData));

    this.versionEntity = new ButtonEntity(this.desktopEntity, this.app.fonts.fonts5x5, 180, 151, 55, 5, 'Ⓥ'+this.app.version, {id: 'upgradeApp'}, [], ZXColor.blue, ZXColor.white, {align: 'center'});
    this.desktopEntity.addEntity(this.versionEntity);
    // suppress the hover/click colors resolved in init(), so the button always
    // looks like plain text
    this.versionEntity.hoverColor = false;
    this.versionEntity.clickColor = false;
    this.checkServerVersion();

    this.signboardEntity = new SignboardEntity(this.desktopEntity, 98, 4, 61, 7, 'menuLabel');
    this.desktopEntity.addEntity(this.signboardEntity);

    this.copyrightEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 23*8, 32*8, 8, this.app.copyright, ZXColor.black, false, {align: 'center'});
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.animationObjects.forEach((object, o) => {
      this.animationObjectsEntities[o] = new SpriteEntity(this.desktopEntity, 0, 0, this.animationColor, false, 0, 0);
      this.desktopEntity.addEntity(this.animationObjectsEntities[o]);
    });

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});

    this.fetchData('menu.data', {key: 'menu', when: 'required'}, {});
    
    this.sendEvent(0, {id: 'closeAllAudioBuses'});
  } // init

  checkServerVersion() {
    // A dedicated receiver, so the request does not clash with the model's own
    // menu.data fetch (one fetchDataId slot and setData per receiver).
    var receiver = {
      id: this.id+'Version',
      fetchDataId: '',
      setData: (data) => {
        if (data.data.version && data.data.version !== 'unknown' && data.data.version !== this.app.version) {
          this.newVersionAvailable = true;
          this.versionEntity.setText('UPGRADE !');
          this.versionEntity.setPenColor(ZXColor.brightRed);
        }
      },
      errorData: () => {}
    };
    receiver.fetchDataId = this.app.fetchData('version.db', false, {}, receiver);
  } // checkServerVersion

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

  /**
   * Opens a dialog from the menu: the window with the title (ZXDialogEntity),
   * placed and coloured by the dialog properties, and the contents the factory
   * makes for it, as the modal of the desktop.
   * @param {string} title - The text of the title bar.
   * @param {Function} contentFactory - Called with the window, returns the contents entity.
   */
  openDialog(title, contentFactory) {
    var p = this.dialogProperties;
    this.desktopEntity.addModalEntity(new ZXDialogEntity(this.desktopEntity, p.x, p.y, p.width, p.height, title, p, contentFactory));
  } // openDialog

  /**
   * Asks for the browser's gesture for audio before an action that plays
   * sound: ZXWaitForAudioEventEntity in a window without a title, centred on
   * the screen, coloured by the `waitForAudioEvent` dialog properties.
   * @param {string} continueEvent - The event sent when the gesture comes.
   */
  openWaitForAudioEvent(continueEvent) {
    var p = this.dialogProperties.waitForAudioEvent;
    this.desktopEntity.addModalEntity(new ZXDialogEntity(this.desktopEntity, 66, 77, 124, 41, false, p, (dialog) => new ZXWaitForAudioEventEntity(dialog, dialog.innerX, dialog.innerY, dialog.innerWidth, dialog.innerHeight, continueEvent, p)));
  } // openWaitForAudioEvent

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'startGame':
        if (!this.app.playerName.length) {
          this.openDialog('PLAYER NAME', (dialog) => new ZXPlayerNameEntity(dialog, dialog.innerX, dialog.innerY, dialog.innerWidth, dialog.innerHeight, true, this.dialogProperties));
          return true;
        } else {
          if (this.app.inputEventsManager.needEventForAudio()) {
            this.openWaitForAudioEvent('startGame2');
            return true;
          }
        }
      case 'startGame2':
        this.app.setModel('MainModel');
        return true;
      
      case 'setPlayerName':
        this.openDialog('PLAYER NAME', (dialog) => new ZXPlayerNameEntity(dialog, dialog.innerX, dialog.innerY, dialog.innerWidth, dialog.innerHeight, false, this.dialogProperties));
      return true;

      case 'showHallOfFame':
        this.desktopEntity.addModalEntity(new HallOfFameEntity(this.desktopEntity, 27, 24, 202, 134, this.dialogProperties.bkColor));
      return true;

      case 'setSounds':
        this.openDialog('sounds', (dialog) => new ZXVolumeEntity(dialog, dialog.innerX, dialog.innerY, dialog.innerWidth, dialog.innerHeight, 'sounds', 'audioBusSoundsLevel', 'exampleJumpSound', this.dialogProperties));
        return true;

      case 'setMusic':
        this.openDialog('music', (dialog) => new ZXVolumeEntity(dialog, dialog.innerX, dialog.innerY, dialog.innerWidth, dialog.innerHeight, 'music', 'audioBusMusicLevel', 'exampleInGameMelody', this.dialogProperties));
        return true;

      case 'setSettings':
        this.openDialog('SETTINGS', (dialog) => new ZXSettingsEntity(dialog, dialog.innerX, dialog.innerY, dialog.innerWidth, dialog.innerHeight, this.app.controlsOptions, this.dialogProperties));
        return true;

      case 'startTapeLoading':
        if (this.app.inputEventsManager.needEventForAudio()) {
          this.openWaitForAudioEvent('startTapeLoading2');
          return true;
        }
      case 'startTapeLoading2':
        this.app.setModel('TapeLoadingModel');
        return true;

      case 'showAbout':
        this.desktopEntity.addModalEntity(new AboutEntity(this.desktopEntity, 27, 24, 202, 134, this.dialogProperties.bkColor));
        return true;
          
      case 'upgradeApp':
        if (this.newVersionAvailable) {
          this.app.upgradeApp();
        }
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
