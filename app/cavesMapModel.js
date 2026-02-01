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

    this.cavesMapEntities = [];
    this.adjustX = 0;
    this.adjustY = 0;

    this.caveSelectionEntity = null;
    this.selectionX = this.app.cavesOpened%4;
    this.selectionY = Math.floor(this.app.cavesOpened/4);
    this.adjustSelectionX = 0;
    this.adjustSelectionY = 0;

    this.prevTimestamp = false;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('cyan');
    this.desktopEntity.bkColor = false;
    for (var y = 0; y < 5; y++) {
      this.cavesMapEntities.push([]);
      for (var x = 0; x < 4; x++) {
        this.cavesMapEntities[y].push(null);
        var caveNumber = x+y*4;
        var caveMapEntity = new CaveMapEntity(this.desktopEntity, x*64, y*38+3, caveNumber, (caveNumber > this.app.cavesOpened));
        this.desktopEntity.addEntity(caveMapEntity);
        this.cavesMapEntities[y][x] = caveMapEntity;
      }
    }
    this.caveSelectionEntity = new CaveSelectionEntity(this.desktopEntity, this.selectionX*64-3, this.selectionY*38);
    this.desktopEntity.addEntity(this.caveSelectionEntity);

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});
  } // init

  newBorderEntity() {
    return new BorderEntity(true, false);
  } // newBorderEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {id: 'changeFlashState'});
        return true;

      case 'keyPress':
        if (this.desktopEntity.modalEntity == null) {
          var key = event.key;
          if (key.length == 1) {
            key = key.toUpperCase();
          }
          switch (key) {        
            case 'ArrowUp':
            case 'GamepadUp':
              if (this.adjustX == 0 && this.adjustY == 0 && this.adjustSelectionX == 0 && this.adjustSelectionY == 0) {
                if (this.selectionY > 0) {
                  this.selectionY--;
                  this.adjustSelectionY -= 38;
                }
              }
              return true;
            case 'ArrowDown':
            case 'GamepadDown':
              if (this.adjustX == 0 && this.adjustY == 0 && this.adjustSelectionX == 0 && this.adjustSelectionY == 0) {
                if (this.selectionY < 4 && this.selectionX+this.selectionY*4+4 <= this.app.cavesOpened) {
                  this.selectionY++;
                  this.adjustSelectionY += 38;
                }
              }
              return true;
            case 'ArrowLeft':
            case 'GamepadLeft':
              if (this.adjustX == 0 && this.adjustY == 0 && this.adjustSelectionX == 0 && this.adjustSelectionY == 0) {
                if (this.selectionX > 0) {
                  this.selectionX--;
                  this.adjustSelectionX -= 64;
                }
              }
              return true;
            case 'ArrowRight':
            case 'GamepadRight':
              if (this.adjustX == 0 && this.adjustY == 0 && this.adjustSelectionX == 0 && this.adjustSelectionY == 0) {
                if (this.selectionX < 3 && this.selectionX+this.selectionY*4 < this.app.cavesOpened) {
                  this.selectionX++;
                  this.adjustSelectionX += 64;
                }
              }
              return true;
            case 'Enter':
            case 'GamepadOK':
              if (this.adjustX == 0 && this.adjustY == 0 && this.adjustSelectionX == 0 && this.adjustSelectionY == 0) {
                this.app.caveNumber = this.selectionX+this.selectionY*4;
                this.app.startCave(false, true, false);
              }
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
        
    var timeDelta = 0;
    if (this.prevTimestamp !== false) {
      timeDelta = timestamp - this.prevTimestamp;
    }
    this.prevTimestamp = timestamp;
    
    if (this.adjustX != 0 || this.adjustY != 0) {
      var corrX = 0;
      var corrY = 0;
      if (timeDelta > 0) {
        corrX = Math.max(Math.min(Math.abs(this.adjustX), Math.round(timeDelta/3)), 1)*Math.sign(this.adjustX);
        corrY = Math.max(Math.min(Math.abs(this.adjustY), Math.round(timeDelta/6)), 1)*Math.sign(this.adjustY);
      }
      this.adjustX -= corrX;
      this.adjustY -= corrY;

      for (var y = 0; y < this.cavesMapEntities.length; y++) {
        for (var x = 0; x < this.cavesMapEntities[y].length; x++) {
          var caveMapEntity = this.cavesMapEntities[y][x];
          if (caveMapEntity !== null) {
            caveMapEntity.x += corrX;
            caveMapEntity.y += corrY;
          }
        }
      }
      this.caveSelectionEntity.x += corrX;
      this.caveSelectionEntity.y += corrY;
    }

    if (this.adjustSelectionX != 0 || this.adjustSelectionY != 0) {
      var corrX = 0;
      var corrY = 0;
      if (timeDelta > 0) {
        corrX = Math.max(Math.min(Math.abs(this.adjustSelectionX), Math.round(timeDelta/2.5)), 1)*Math.sign(this.adjustSelectionX);
        corrY = Math.max(Math.min(Math.abs(this.adjustSelectionY), Math.round(timeDelta/5)), 1)*Math.sign(this.adjustSelectionY);
      }
      this.adjustSelectionX -= corrX;
      this.adjustSelectionY -= corrY;

      this.caveSelectionEntity.x += corrX;
      this.caveSelectionEntity.y += corrY;
    }
    
    this.caveSelectionEntity.loopEntity(timestamp);
    this.drawModel();
  } // loopModel

} // CavesMapModel

export default CavesMapModel;
