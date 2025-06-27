/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { DrawingCache } = await import('./svision/js/platform/canvas2D/drawingCache.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import DrawingCache from './svision/js/platform/canvas2D/drawingCache.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class GameAreaEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, caveNumber, initData) {
    super(parentEntity, x, y, width, height);
    this.id = 'GameAreaEntity';

    this.caveNumber = caveNumber;
    this.initData = initData;
    this.caveData = null;

    this.app.layout.newDrawingCache(this, 0); 
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty', 'extra'];

    this.spriteEntities = {'crumblingFloor': [], 'conveyors': [], 'guardians': []};
  } // constructor

  drawEntity() {
    if (this.caveData) {
      if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {

        // layout
        this.app.layout.paintRect(this.drawingCache[0].ctx, 0, 0, this.width, this.height, this.app.platform.zxColorByAttr(this.app.hexToInt(this.caveData.bkColor), 56, 8));
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.staticKinds.includes(this.caveData.graphicData[attr].kind)) {
                if (this.graphicCache[attr].needToRefresh(this, 8, 8)) {
                  var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
                  var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr));
                  if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.bkColor))) {
                    bkColor = false;
                  }
                  if (bkColor != false) {
                    this.app.layout.paintRect(this.graphicCache[attr].ctx, 0, 0, 8, 8, bkColor);
                  }
                  for (var y = 0; y < this.caveData.graphicData[attr].sprite.length; y++) {
                    for (var x = 0; x < this.caveData.graphicData[attr].sprite[y].length; x++) {
                      if (this.caveData.graphicData[attr].sprite[y][x] == '#') {
                        this.app.layout.paintRect(this.graphicCache[attr].ctx, x, y, 1, 1, penColor);
                      }
                    }
                  }
                }
                this.drawingCache[0].ctx.drawImage(this.graphicCache[attr].canvas, column*8*this.app.layout.ratio, r*8*this.app.layout.ratio);
              }
            }
          }
        });

        // image
        if ('image' in this.caveData) {
          for (var row = 0; row < 8; row++) {
            for (var column = 0; column < 32; column++) {
              var attr = this.app.hexToInt(this.caveData.image.attributes[row].substring(column*2, column*2+2));
              var bkColor = this.app.platform.bkColorByAttr(attr);
              var penColor = this.app.platform.penColorByAttr(attr);
              this.app.layout.paintRect(this.drawingCache[0].ctx, column*8, (row)*8, 8, 8, bkColor);
              for (var line = 0; line < 8; line++) {
                var binMask = this.app.hexToBin(this.caveData.image.data[row+line*8].substring(column*2, column*2+2))
                for (var point = 0; point < 8; point++) {
                  if (binMask[point] == '1') {
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*8+point, row*8+line, 1, 1, penColor);
                  }
                }
              }
            }
          }
        }
        
      }
      this.app.layout.paintCache(this, 0);
      super.drawSubEntities();
    }
  } // drawEntity

  setData(data) {
    this.caveData = data;

    // prepare drawing caches for layout
    this.drawingCache[0].cleanCache();
    this.graphicCache = {};
    Object.keys(data.graphicData).forEach((key) => {
      if (this.staticKinds.includes(data.graphicData[key].kind)) {
        this.graphicCache[key] = new DrawingCache(this.app);
      }
    });

    // layout
    var conveyorData = false;
    this.initData['crumblingFloor'] = [];
    data.layout.forEach((row, r) => {
      for (var column = 0; column < row.length/2; column++) {
        var attr = row.substring(column*2, column*2+2);
        if (attr != data.bkColor) {
          var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
          switch (data.graphicData[attr].kind) {
            case 'floor':
              break;
            case 'crumblingFloor':
              var entity = new SpriteEntity(this, column*8, r*8, penColor, false, 0, 0);
              entity.setGraphicsData(data.graphicData[attr]);
              this.addEntity(entity);
              this.spriteEntities.crumblingFloor.push(entity);
              //this.initData.crumblingFloor.push({'visible': true, 'type': guardianType, 'x': guardian.init.x, 'y': guardian.init.y, 'width': guardianTypeData.width, 'height': guardianTypeData.height, 'frame': guardian.init.frame, 'direction': guardian.init.direction, 'limitLeft': guardian.limits.left, 'limitRight': guardian.limits.right, 'paintCorrectionsX': guardianTypeData.paintCorrections.x, 'paintCorrectionsY': guardianTypeData.paintCorrections.y});
              break;
            case 'wall':
              break;
            case 'conveyor':
              if (conveyorData === false) {
                conveyorData = {'attr': attr, 'x': column, 'y': r, 'length': 1};
              } else {
                conveyorData.length++;
              }
              break;
            case 'nasty':
              break;
            case 'extra':
              break;
          }
        }
      }
    });

    // conveyor
    this.initData['conveyors'] = [];
    if (conveyorData !== false) {
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(conveyorData.attr));
      var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(conveyorData.attr));
      if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(data.bkColor))) {
        bkColor = false;
      }
      var entity = new SpriteEntity(this, conveyorData.x*8, conveyorData.y*8, penColor, bkColor, 0, 0);
      entity.setFixSize(8, 8);
      entity.setRepeatX(conveyorData.length);
      entity.setGraphicsData(data.graphicData[conveyorData.attr]);
      entity.cloneSprite(0);
      var rotateDirection = 1;
      if (data.graphicData[conveyorData.attr].moving == 'right') {
        rotateDirection = -1;
      }
      entity.rotateSpriteRow(1, 0, -2*rotateDirection);
      entity.rotateSpriteRow(1, 2, 2*rotateDirection);
      entity.cloneSprite(1);
      entity.rotateSpriteRow(2, 0, -2*rotateDirection);
      entity.rotateSpriteRow(2, 2, 2*rotateDirection);
      entity.cloneSprite(2);
      entity.rotateSpriteRow(3, 0, -2*rotateDirection);
      entity.rotateSpriteRow(3, 2, 2*rotateDirection);
      this.addEntity(entity);
      this.spriteEntities.conveyors.push(entity);
      this.initData.conveyors.push({'visible': true, 'moving': conveyorData.moving, 'x': conveyorData.x*8, 'y': conveyorData.y*8, 'length': conveyorData.length*8, 'height': 8, 'frame': 0, 'direction': 0});
    }

    // guardians
    this.initData['guardians'] = [];
    ['horizontal', 'vertical', 'forDropping', 'falling'].forEach((guardianType, type) => {
      if (guardianType in data.guardians) {
        var guardianTypeData = data.guardians[guardianType];
        guardianTypeData.figures.forEach((guardian) => {
          var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
          var entity = new SpriteEntity(this, guardian.init.x+guardianTypeData.paintCorrections.x, guardian.init.y+guardianTypeData.paintCorrections.y, penColor, false, guardian.init.frame, guardian.init.direction);
          entity.setGraphicsData(guardianTypeData);
          this.addEntity(entity);
          this.spriteEntities.guardians.push(entity);
          this.initData.guardians.push({'visible': true, 'type': guardianType, 'x': guardian.init.x, 'y': guardian.init.y, 'width': guardianTypeData.width, 'height': guardianTypeData.height, 'frame': guardian.init.frame, 'direction': guardian.init.direction, 'limitLeft': guardian.limits.left, 'limitRight': guardian.limits.right, 'paintCorrectionsX': guardianTypeData.paintCorrections.x, 'paintCorrectionsY': guardianTypeData.paintCorrections.y});
        });
      }
    });
  } // setData
    
} // class GameAreaEntity

export default GameAreaEntity;
