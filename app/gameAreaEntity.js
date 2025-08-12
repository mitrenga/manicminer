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

  constructor(parentEntity, x, y, width, height, caveNumber, initData, demo) {
    super(parentEntity, x, y, width, height);
    this.id = 'GameAreaEntity';

    this.caveNumber = caveNumber;
    this.initData = initData;
    this.demo = demo;
    this.caveData = null;

    this.app.layout.newDrawingCache(this, 0); 
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty', 'extra'];

    this.spriteEntities = {'crumblingFloors': [], 'conveyors': [], 'guardians': [], 'items': [], 'willy': [], "portal": [], "lightBeam": []};
  } // constructor

  drawEntity() {
    if (this.caveData) {
      if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {
        this.app.layout.paintRect(this.drawingCache[0].ctx, 0, 0, this.width, this.height, this.app.platform.zxColorByAttr(this.app.hexToInt(this.caveData.bkColor), 56, 8));

        // layout
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.staticKinds.includes(this.caveData.graphicData[attr].kind)) {
                if (this.graphicCache[attr].needToRefresh(this, 8, 8)) {
                  var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
                  var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr)&63);
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
    this.initData.floors = [];
    this.initData.walls = [];
    this.initData.crumblingFloors = [];
    this.initData.nasties = [];
    this.initData.extra = [];
    data.layout.forEach((row, r) => {
      for (var column = 0; column < row.length/2; column++) {
        var attr = row.substring(column*2, column*2+2);
        if (attr != data.bkColor) {
          var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
          switch (data.graphicData[attr].kind) {
            case 'floor':
              this.initData.floors.push({'x': column*8, 'y': r*8, 'width': 8, 'height': 8});
              break;
            case 'crumblingFloor':
              var entity = new SpriteEntity(this, column*8, r*8, penColor, false, 0, 0);
              entity.setGraphicsData(data.graphicData[attr]);
              this.addEntity(entity);
              this.spriteEntities.crumblingFloors.push(entity);
              this.initData.crumblingFloors.push({'hide': false, 'x': column*8, 'y': r*8, 'width': 8, 'height': 8, 'frame': 0, 'direction': 0});
              break;
            case 'wall':
              this.initData.walls.push({'x': column*8, 'y': r*8, 'width': 8, 'height': 8});
              break;
            case 'conveyor':
              if (conveyorData === false) {
                conveyorData = {'attr': attr, 'x': column, 'y': r, 'length': 1};
              } else {
                conveyorData.length++;
              }
              break;
            case 'nasty':
              this.initData.nasties.push({'x': column*8, 'y': r*8, 'width': 8, 'height': 8});
              break;
            case 'extra':
              this.initData.extra.push({'x': column*8, 'y': r*8, 'width': 8, 'height': 8});
              break;
          }
        }
      }
    });

    // conveyor
    this.initData.conveyors = [];
    if (conveyorData !== false) {
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(conveyorData.attr));
      var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(conveyorData.attr)&63);
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
      this.initData.conveyors.push({
        'x': conveyorData.x*8,
        'y': conveyorData.y*8,
        'width': conveyorData.length*8,
        'height': 8,
        'frame': 0,
        'direction': 0,
        'moving': conveyorData.moving
      });
    }

    // items
    this.initData.items = [];
    data.items.data.forEach((item) => {
      var itemColor = this.app.hexToInt(item.initAttribute)&7;
      var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(item.initAttribute));
      if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(data.bkColor))) {
        bkColor = false;
      }
      var tmpColor = itemColor;
      var penColor0 = this.app.platform.color(tmpColor);
      tmpColor = this.app.rotateInc(tmpColor, 3, 6);
      var penColor1 = this.app.platform.color(tmpColor);
      tmpColor = this.app.rotateInc(tmpColor, 3, 6);
      var penColor2 = this.app.platform.color(tmpColor);
      tmpColor = this.app.rotateInc(tmpColor, 3, 6);
      var penColor3 = this.app.platform.color(tmpColor);
      var entity = new SpriteEntity(this, item.x*8, item.y*8, false, bkColor, 0, 0);
      this.addEntity(entity);
      entity.setColorsMap({'#': {0: penColor0, 1: penColor1, 2: penColor2, 3: penColor3}});
      entity.setGraphicsData(data.items);
      entity.cloneSprite(0);
      entity.cloneSprite(0);
      entity.cloneSprite(0);
      this.spriteEntities.items.push(entity);
      this.initData.items.push({'hide': false, 'x': item.x*8, 'y': item.y*8, 'width': 8, 'height': 8, 'frame': 0, 'direction': 0});
      itemColor = this.app.rotateInc(itemColor, 3, 6);
    });

    // guardians
    this.initData['guardians'] = [];
    ['horizontal', 'vertical', 'forDropping', 'falling'].forEach((guardianType) => {
      if (guardianType in data.guardians) {
        var guardianTypeData = data.guardians[guardianType];
        guardianTypeData.figures.forEach((guardian) => {
          var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
          var entity = new SpriteEntity(this, guardian.init.x+guardianTypeData.paintCorrections.x, guardian.init.y+guardianTypeData.paintCorrections.y, penColor, false, guardian.init.frame, guardian.init.direction);
          entity.setGraphicsData(guardianTypeData);
          this.addEntity(entity);
          this.spriteEntities.guardians.push(entity);
          var guardianInitData = {
            'type': guardianType,
            'speed': guardian.speed,
            'x': guardian.init.x,
            'y': guardian.init.y,
            'width': guardianTypeData.width,
            'height': guardianTypeData.height,
            'paintCorrectionsX': guardianTypeData.paintCorrections.x,
            'paintCorrectionsY': guardianTypeData.paintCorrections.y,
            'frame': guardian.init.frame,
            'frames': guardianTypeData.frames,
            'direction': guardian.init.direction
          };
          switch (guardianType) {
            case 'horizontal':
              guardianInitData.limitLeft = guardian.limits.left;
              guardianInitData.limitRight = guardian.limits.right;
              break;
            case 'vertical':
              guardianInitData.limitUp = guardian.limits.up;
              guardianInitData.limitDown = guardian.limits.down;
              break;
            case 'forDropping':
              break;
            case 'falling':
              guardianInitData.limitUp = guardian.limits.up;
              guardianInitData.limitDown = guardian.limits.down;
              guardianInitData.next = guardian.next;
              break;
          }
          this.initData.guardians.push(guardianInitData);
        });
      }
    });

    // Willy
    this.initData.willy = [];
    if (!this.demo) {
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.willy.attribute));
      var entity = new SpriteEntity(this, data.willy.init.x, data.willy.init.y, penColor, false, data.willy.init.frame, data.willy.init.direction);
      this.addEntity(entity);
      entity.setGraphicsData(data.willy);
      this.spriteEntities.willy.push(entity);
      this.initData.willy.push({
        'x': data.willy.init.x,
        'y': data.willy.init.y,
        'width': data.willy.width,
        'height': data.willy.height,
        'paintCorrectionsX': data.willy.paintCorrections.x,
        'paintCorrectionsY': data.willy.paintCorrections.y,
        'frame': data.willy.init.frame,
        'frames': data.willy.init.frames,
        'direction': data.willy.init.direction
      });
    }

    // portal
    this.initData.portal = [];
    var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.portal.attribute));
    var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(data.portal.attribute));
    var entity = new SpriteEntity(this, data.portal.location.x*8, data.portal.location.y*8, penColor, bkColor, 0, 0);
    this.addEntity(entity);
    entity.setGraphicsData(data.portal);
    this.spriteEntities.portal.push(entity);
    this.initData.portal.push({'x': data.portal.location.x*8, 'y': data.portal.location.y*8, 'width': 16, 'height': 16, 'frame': 0, 'direction': 0});

    // light beam
    if ('lightBeam' in data) {
      this.initData.lightBeam = [];
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.lightBeam.attribute));
      var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(data.lightBeam.attribute));
      var entity = new AbstractEntity(this, data.lightBeam.init.x, data.lightBeam.init.y, data.lightBeam.init.width, data.lightBeam.init.height, false, bkColor);
      this.addEntity(entity);
      this.spriteEntities.lightBeam.push(entity);
      this.initData.lightBeam.push({'x': data.lightBeam.init.x, 'y': data.lightBeam.init.y, 'width': data.lightBeam.init.width, 'height': data.lightBeam.init.height});
      for (var l = 0; l < 14; l++) {
        var entity = new AbstractEntity(this, 0, 0, 0, 0, penColor, bkColor);
        entity.hide = true;
        this.addEntity(entity);
        this.spriteEntities.lightBeam.push(entity);
        this.initData.lightBeam.push({'hide': true, 'x': 0, 'y': 0, 'width': 0, 'height': 0});
      }
    }

  } // setData

  updateData(data, objectsType) {
    data.gameData[objectsType].forEach((object, o) => {
      var x = object.x;
      if ('paintCorrectionsX' in object) {
        x += object.paintCorrectionsX;
      }
      this.spriteEntities[objectsType][o].x = x;
      var y = object.y;
      if ('paintCorrectionsY' in object) {
        y += object.paintCorrectionsY;
      }
      this.spriteEntities[objectsType][o].y = y;
      this.spriteEntities[objectsType][o].frame = object.frame;
      this.spriteEntities[objectsType][o].direction = object.direction;
      if ('width' in object) {
        var width = object.width;
        if ('paintCorrectionsX' in object) {
          width -= object.paintCorrectionsX;
        }
        this.spriteEntities[objectsType][o].width = width;
      }
      if ('height' in object) {
        var height = object.height;
        if ('paintCorrectionsY' in object) {
          height -= object.paintCorrectionsY;
        }
        this.spriteEntities[objectsType][o].height = height;
      }
      if ('hide' in object) {
        this.spriteEntities[objectsType][o].hide = object.hide;
      }
    });
  } // updateData
    
} // class GameAreaEntity

export default GameAreaEntity;
