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
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'GameAreaEntity';

    this.caveNumber = caveNumber;
    this.initData = initData;
    this.demo = demo;
    this.caveData = null;
    this.bkColorForRestore = false;
    this.monochromeColor = false;

    this.app.layout.newDrawingCache(this, 0); 
    this.app.layout.newDrawingCache(this, 1); 
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty', 'extra'];
    this.backgroundKinds = ['floor', 'wall', 'nasty', 'conveyor', 'extra'];

    this.spriteEntities = {crumblingFloors: [], conveyors: [], guardians: [], items: [], willy: [], barriers: [], switches:[], portal: [], lightBeam: [], swordFish: []};
  } // constructor

  drawEntity() {
    if (this.caveData) {
      var caveBkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(this.caveData.bkColor), 56, 8);

      this.app.layout.paint(this, 0, 0, this.width, this.height, this.bkColor);

      if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {
        // layout - bkColor
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.backgroundKinds.includes(this.caveData.graphicData[attr].kind)) {
                var bkColor = this.bkColorByAttr(this.app.hexToInt(attr));
                if (bkColor == caveBkColor) {
                  bkColor = false;
                }
                if (bkColor != false) {
                  this.app.layout.paintRect(this.drawingCache[0].ctx, column*8, r*8, 8, 8, bkColor);
                }
              }
            }
          }
        });
      }

      this.app.layout.paintCache(this, 0);

      super.drawSubEntities();

      if (this.drawingCache[1].needToRefresh(this, this.width, this.height)) {
        // layout - penColor
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.staticKinds.includes(this.caveData.graphicData[attr].kind)) {
                if (this.graphicCache[attr].needToRefresh(this, 8, 8)) {
                  var penColor = this.penColorByAttr(this.app.hexToInt(attr));
                  for (var y = 0; y < this.caveData.graphicData[attr].sprite.length; y++) {
                    for (var x = 0; x < this.caveData.graphicData[attr].sprite[y].length; x++) {
                      if (this.caveData.graphicData[attr].sprite[y][x] == '#') {
                        this.app.layout.paintRect(this.graphicCache[attr].ctx, x, y, 1, 1, penColor);
                      }
                    }
                  }
                }
                this.drawingCache[1].ctx.drawImage(this.graphicCache[attr].canvas, column*8*this.app.layout.ratio, r*8*this.app.layout.ratio);
              }
            }
          }
        });

        // image
        if ('image' in this.caveData) {
          for (var row = 0; row < 8; row++) {
            for (var column = 0; column < 32; column++) {
              var attr = this.app.hexToInt(this.caveData.image.attributes[row].substring(column*2, column*2+2));
              var penColor = this.monochromeColor;
              var bkColor = this.app.platform.bkColorByAttr(attr);
              var bkColor2 = bkColor;
              if (penColor == false) {
                penColor = this.app.platform.penColorByAttr(attr);
              } else {
                bkColor2 = this.bkColor;
              }
              if (bkColor != this.bkColor) {
                this.app.layout.paintRect(this.drawingCache[1].ctx, column*8, row*8, 8, 8, bkColor2);
              }
              for (var line = 0; line < 8; line++) {
                var binMask = this.app.hexToBin(this.caveData.image.data[row+line*8].substring(column*2, column*2+2))
                for (var point = 0; point < 8; point++) {
                  if (binMask[point] == '1') {
                    this.app.layout.paintRect(this.drawingCache[1].ctx, column*8+point, row*8+line, 1, 1, penColor);
                  }
                }
              }
            }
          }
        }
        
      }
      this.app.layout.paintCache(this, 1);
    }

    // draw attribute efects on Willy and guardians due light beam
    var objectsArray = [];
    if (!this.demo) {
      objectsArray.push(this.spriteEntities.willy);
    }
    objectsArray.push(this.spriteEntities.guardians);
    var p = 0;
    while (p < this.spriteEntities.lightBeam.length && !this.spriteEntities.lightBeam[p].hide) {
      var part = this.spriteEntities.lightBeam[p];
      for (var a = 0; a < objectsArray.length; a++) {
        var objects = objectsArray[a];
        for (var o = 0; o < objects.length; o++) {
          var obj = objects[o];
          if (!(obj.x+obj.width <= part.x || obj.y+obj.height <= part.y || obj.x >= part.x+part.width || obj.y >= part.y+part.height)) {
            var x = Math.max(obj.x, part.x);
            var y = Math.max(obj.y, part.y);
            var w = Math.min(obj.x+obj.width, part.x+part.width)-x;
            var h = Math.min(obj.y+obj.height, part.y+part.height)-y;
            var d = obj.direction;
            if (obj.directions == 1) {
              d = 0;
            }
            obj.spriteData[obj.frame+d*obj.frames].forEach((pixel) => {
              if (pixel.x >= x-obj.x && pixel.y >= y-obj.y && pixel.x < x-obj.x+w && pixel.y < y-obj.y+h) {
                this.app.layout.paintRect(this.app.stack.ctx, obj.parentX+obj.x+pixel.x, obj.parentY+obj.y+pixel.y, 1, 1, part.penColor);
              }
            });
          }
        }
      }
      p++;
    }
  } // drawEntity

  setData(data) {
    this.caveData = data;
    
    this.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(this.caveData.bkColor), 56, 8);
    this.bkColorForRestore = this.bkColor;

    // light beam
    if ('lightBeam' in data) {
      this.initData.lightBeam = [];
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.lightBeam.attribute));
      var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(data.lightBeam.attribute));
      var entity = new AbstractEntity(this, data.lightBeam.init.x, data.lightBeam.init.y, data.lightBeam.init.width, data.lightBeam.init.height, penColor, bkColor);
      this.addEntity(entity);
      this.spriteEntities.lightBeam.push(entity);
      this.initData.lightBeam.push({x: data.lightBeam.init.x, y: data.lightBeam.init.y, width: data.lightBeam.init.width, height: data.lightBeam.init.height});
      for (var l = 0; l < 14; l++) {
        var entity = new AbstractEntity(this, 0, 0, 0, 0, penColor, bkColor);
        entity.hide = true;
        this.addEntity(entity);
        this.spriteEntities.lightBeam.push(entity);
        this.initData.lightBeam.push({hide: true, x: 0, y: 0, width: 0, height: 0});
      }
    }

    // Willy
    this.initData.willy = [];
    if (!this.demo) {
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.willy.attribute));
      var entity = new SpriteEntity(this, data.willy.init.x+data.willy.paintCorrections.x, data.willy.init.y, penColor, false, data.willy.init.frame, data.willy.init.direction);
      this.addEntity(entity);
      entity.setGraphicsData(data.willy);
      this.spriteEntities.willy.push(entity);
      this.initData.willy.push({
        x: data.willy.init.x,
        y: data.willy.init.y,
        width: data.willy.width,
        height: data.willy.height,
        paintCorrections: data.willy.paintCorrections,
        touchCorrections: data.willy.touchCorrections,
        frame: data.willy.init.frame,
        frames: data.willy.frames,
        direction: data.willy.init.direction,
        directions: data.willy.directions
      });
    }

    // prepare drawing caches for layout
    this.drawingCache[0].cleanCache();
    this.drawingCache[1].cleanCache();
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
              this.initData.floors.push({x: column*8, y: r*8, width: 8, height: 8});
              break;
            case 'crumblingFloor':
              var entity = new SpriteEntity(this, column*8, r*8, penColor, false, 0, 0);
              entity.setGraphicsData(data.graphicData[attr]);
              for (var c = 0; c < 7; c++) {
                entity.cloneSprite(0);
                entity.moveSpriteWithCrop(c+1, 0, c+1, 8, 8);
              }
              this.addEntity(entity);
              this.spriteEntities.crumblingFloors.push(entity);
              this.initData.crumblingFloors.push({crumbling: true, hide: false, x: column*8, y: r*8, width: 8, height: 8, frame: 0, direction: 0});
              break;
            case 'wall':
              this.initData.walls.push({x: column*8, y: r*8, width: 8, height: 8});
              break;
            case 'conveyor':
              if (conveyorData === false) {
                conveyorData = {attr: attr, x: column, y: r, length: 1};
              } else {
                conveyorData.length++;
              }
              break;
            case 'nasty':
              this.initData.nasties.push({x: column*8, y: r*8, width: 8, height: 8});
              break;
            case 'extra':
              this.initData.extra.push({x: column*8, y: r*8, width: 8, height: 8});
              break;
          }
        }
      }
    });

    // conveyor
    this.initData.conveyors = [];
    if (conveyorData !== false) {
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(conveyorData.attr));
      var entity = new SpriteEntity(this, conveyorData.x*8, conveyorData.y*8, penColor, false, 0, 0);
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
        x: conveyorData.x*8,
        y: conveyorData.y*8,
        width: conveyorData.length*8,
        height: 8,
        frame: 0,
        direction: 0,
        moving: data.graphicData[conveyorData.attr].moving
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
      this.initData.items.push({hide: false, x: item.x*8, y: item.y*8, width: 8, height: 8, frame: 0, direction: 0});
      itemColor = this.app.rotateInc(itemColor, 3, 6);
    });

    // guardians
    this.initData['guardians'] = [];
    ['horizontal', 'vertical', 'forDropping', 'falling'].forEach((guardianType) => {
      if (guardianType in data.guardians) {
        var guardianTypeData = data.guardians[guardianType];
        guardianTypeData.figures.forEach((guardian) => {
          var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
          var paintCorrectionsX = 0;
          var paintCorrectionsY = 0;
          if ('paintCorrections' in guardianTypeData) {
            paintCorrectionsX = guardianTypeData.paintCorrections.x;
            paintCorrectionsY = guardianTypeData.paintCorrections.y;
          }
          var entity = new SpriteEntity(this, guardian.init.x+paintCorrectionsX, guardian.init.y+paintCorrectionsY, penColor, false, guardian.init.frame, guardian.init.direction);
          entity.setGraphicsData(guardianTypeData);
          this.addEntity(entity);
          this.spriteEntities.guardians.push(entity);
          var guardianInitData = {
            type: guardianType,
            speed: guardian.speed,
            x: guardian.init.x,
            y: guardian.init.y,
            width: guardianTypeData.width,
            height: guardianTypeData.height,
            frame: guardian.init.frame,
            frames: guardianTypeData.frames,
            direction: guardian.init.direction,
            directions: guardianTypeData.directions
          };
          if ('paintCorrections' in guardianTypeData) {
            guardianInitData.paintCorrections = guardianTypeData.paintCorrections;
          }
          if ('touchCorrections' in guardianTypeData) {
            guardianInitData.touchCorrections = guardianTypeData.touchCorrections;
          }
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
              guardianInitData.limitDown = guardian.limits.down;
              guardianInitData.hide = false;
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

    // barriers
    this.initData.barriers = [];
    if ('barriers' in data) {
      data.barriers.data.forEach((barrier) => {
        var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(barrier.attribute));
        var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(barrier.attribute));
        var entity = new SpriteEntity(this, barrier.x*8, barrier.y*8, penColor, bkColor, 0, 0);
        this.addEntity(entity);
        entity.setGraphicsData(barrier);
        this.spriteEntities.barriers.push(entity);
        this.initData.barriers.push({
          x: barrier.x*8,
          y: barrier.y*8,
          width: barrier.width,
          height: barrier.height,
          frame: 0,
          direction: 0,
          frames: barrier.frames,
          directions: barrier.directions,
          actions: barrier.actions
        });
      });
    }

    // switches
    this.initData.switches = [];
    if ('switches' in data) {
      data.switches.data.forEach((swtch) => {
        var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(swtch.attribute));
        var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(swtch.attribute));
        var entity = new SpriteEntity(this, swtch.x*8, swtch.y*8, penColor, bkColor, 0, 0);
        this.addEntity(entity);
        entity.setGraphicsData(data.switches);
        this.spriteEntities.switches.push(entity);
        this.initData.switches.push({
          x: swtch.x*8,
          y: swtch.y*8,
          width: 8,
          height: 8,
          frame: 0,
          direction: 0,
          frames: data.switches.frames,
          directions: data.switches.directions,
          actions: swtch.actions
        });
      });
    }

    // portal
    this.initData.portal = [];
    var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.portal.attribute));
    var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(data.portal.attribute));
    var entity = new SpriteEntity(this, data.portal.x*8, data.portal.y*8, false, false, 0, 0);
    this.addEntity(entity);
    entity.setColorsMap({'-': {0: bkColor, 1: penColor}, '#': {0: penColor, 1: bkColor}});
    entity.setGraphicsData(data.portal);
    entity.cloneSprite(0);
    this.spriteEntities.portal.push(entity);
    var portalInitData = {
      x: data.portal.x*8,
      y: data.portal.y*8,
      width: 16,
      height: 16,
      frame: 0,
      direction: 0,
      flashShiftFrames: 0
    };
    if ('actions' in data.portal) {
      portalInitData.actions = data.portal.actions;
    }
    this.initData.portal.push(portalInitData);
  } // setData

  updateData(gameData, objectsType) {
    gameData[objectsType].forEach((object, o) => {
      var spriteEntity = this.spriteEntities[objectsType][o];
      var paintCorrectionX = 0;
      var paintCorrectionY = 0;
      if ('paintCorrections' in object) {
        paintCorrectionX = object.paintCorrections.x;
        paintCorrectionY = object.paintCorrections.y;
      }
      spriteEntity.x = object.x+paintCorrectionX;
      spriteEntity.y = object.y+paintCorrectionY;
      var flashShiftFrames = 0;
      if (('flashShiftFrames' in object) && this.app.stack.flashState) {
        flashShiftFrames = object.flashShiftFrames;
      }
      spriteEntity.frame = object.frame+flashShiftFrames;
      spriteEntity.direction = object.direction;
      if ('width' in object) {
        spriteEntity.width = object.width-paintCorrectionX;
      }
      if ('height' in object) {
        spriteEntity.height = object.height-paintCorrectionY;
      }
      if ('hide' in object) {
        spriteEntity.hide = object.hide;
      }
      if ('action' in object) {
        switch (object.action.id) {
          case 'setColorsMap':
            var colorsMap = {};
            colorsMap[spriteEntity.penChar] = {};
            object.action.data.forEach((attr, frame) => {
              colorsMap[spriteEntity.penChar][frame] = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
            });
            spriteEntity.setColorsMap(colorsMap);
            break;
        }
      }
    });
  } // updateData

  cleanCache() {
    this.drawingCache[0].cleanCache();
    this.drawingCache[1].cleanCache();
    Object.keys(this.graphicCache).forEach((attr) => {
      this.graphicCache[attr].cleanCache();
    });
  } // cleanCache

  penColorByAttr(attr) {
    if (this.monochromeColor) {
      return this.monochromeColor;
    }
    return this.app.platform.penColorByAttr(attr);
  } // penColorByAttr

  bkColorByAttr(attr) {
    if (this.monochromeColor) {
      return false;
    }
    return this.app.platform.bkColorByAttr(attr);
  } // bkColorByAttr

  restoreBkColor() {
    if (this.restoreBkColor !== false) {
      this.bkColor = this.bkColorForRestore;
    }
  } // restoreBkColor

  setMonochromeColors(monochromeColor, bkColor) {
    this.monochromeColor = monochromeColor;
    this.setBkColor(bkColor);

    Object.keys(this.spriteEntities).forEach((objectsType) => {
      this.spriteEntities[objectsType].forEach((object) => {
        object.bkColor = false;
        object.setPenColor(monochromeColor);
      });
    });
  } // setMonochromeColors

} // GameAreaEntity

export default GameAreaEntity;
