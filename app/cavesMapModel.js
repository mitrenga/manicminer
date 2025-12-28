/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { CaveMapEntity } = await import('./caveMapEntity.js?ver='+window.srcVersion);
const { CaveSelectionEntity } = await import('./caveSelectionEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
import CaveMapEntity from './caveMapEntity.js';
import CaveSelectionEntity from './caveSelectionEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
/**/
// begin code

export class CavesMapModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'CavesMapModel';

    this.caveSelectionEntity = null;
    this.selectionCave = this.app.cavesOpened;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('cyan');
    this.desktopEntity.bkColor = false;
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 5; y++) {
        var caveNumber = x+y*4;
        var caveMapEntity = new CaveMapEntity(this.desktopEntity, x*64+3, y*38+3, caveNumber, (caveNumber > this.app.cavesOpened));
        this.desktopEntity.addEntity(caveMapEntity);
      }
    }
    this.caveSelectionEntity = new CaveSelectionEntity(this.desktopEntity, this.selectionCave%4*64, Math.floor(this.selectionCave/4)*38);
    this.desktopEntity.addEntity(this.caveSelectionEntity);
  } // init

  newBorderEntity() {
    return new BorderEntity(true, false);
  } // newBorderEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'keyPress':
        if (this.desktopEntity.modalEntity == null) {
          var key = event.key;
          if (key.length == 1) {
            key = key.toUpperCase();
          }
          switch (key) {        
            case 'ArrowUp':
            case 'GamepadUp':
              if (this.selectionCave >= 4) {
                this.selectionCave -= 4;
                this.caveSelectionEntity.y -= 38;
              }
              return true;
            case 'ArrowDown':
            case 'GamepadDown':
              if (this.selectionCave < 16 && this.selectionCave+4 <= this.app.cavesOpened) {
                this.selectionCave += 4;
                this.caveSelectionEntity.y += 38;
              }
              return true;
            case 'ArrowLeft':
            case 'GamepadLeft':
              if (this.selectionCave % 4 > 0) {
                this.selectionCave -= 1;
                this.caveSelectionEntity.x -= 64;
              }
              return true;
            case 'ArrowRight':
            case 'GamepadRight':
              if (this.selectionCave % 4 < 3 && this.selectionCave+1 <= this.app.cavesOpened) {
                this.selectionCave += 1;
                this.caveSelectionEntity.x += 64;
              }
              return true;
            case 'Enter':
            case 'GamepadOK':
              this.app.caveNumber = this.selectionCave;
              this.app.startCave(false, true, false);
              return true;
            case 'Escape':
            case 'GamepadExit':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'OPTIONS', 'MenuModel'));
              return true;
          }
        }
        break;        
    }
    
    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);
    
    this.caveSelectionEntity.loopEntity(timestamp);
    this.drawModel();
  } // loopModel

} // CavesMapModel

export default CavesMapModel;
