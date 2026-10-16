const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { RasterEntity } = await import('./svision/js/platform/canvas2D/rasterEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { SpriteTool } = await import('./svision/js/spriteTool.js?ver='+window.srcVersion);
const { Tool } = await import('./svision/js/tool.js?ver='+window.srcVersion);
const { ZXColor } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxColor.js?ver='+window.srcVersion);
// begin code

/**
 * The cave: the layout, the picture of the cave over it and the objects moving
 * in it, drawn in three layers so that the sprites sit between the paper and
 * the ink of the static tiles:
 *
 * ```
 * cache 0 — paper of the layout cells (8x8 rectangles where a cell's paper
 *           differs from the cave's)
 *   |  drawSubEntities() — Willy, guardians, items, conveyors, barriers …
 * cache 1 — ink of the static tiles (floor, wall, nasty, extra) and the
 *           cave's picture
 * ```
 *
 * Both layers are frames of a {@link RasterEntity}, painted once per cave (or
 * per colour change) and blitted every draw. A static tile is decoded once into
 * a `Uint32Array(64)` stamp in `graphicCache` and stamped onto cache 1 for
 * every cell that uses it; until 2026-09-06 each stamp was its own
 * `DrawingCache` canvas put down with `drawImage()`.
 *
 * The light beam recolours the pixels of the sprites it falls on: each sprite
 * is told its lit parts (lightSprites(), SpriteEntity.setTints) and they are
 * drawn last, above the ink — where the cell's attribute puts them.
 */
export class GameAreaEntity extends RasterEntity {

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
    /** static tile attr -> Uint32Array(64) of packed pixels, 0 where transparent */
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty', 'extra'];
    this.backgroundKinds = ['floor', 'wall', 'nasty', 'conveyor', 'extra'];

    this.spriteEntities = {crumblingFloors: [], conveyors: [], guardians: [], items: [], willy: [], barriers: [], switches:[], portal: [], lightBeam: [], swordFish: []};
  } // constructor

  drawEntity() {
    if (this.caveData) {
      var caveBkColor = ZXColor.attrColor(Tool.hexToInt(this.caveData.bkColor), 56, 8);

      this.lightSprites();

      this.app.layout.paint(this, 0, 0, this.width, this.height, this.bkColor);

      var paper = this.drawingCache[0];
      if (paper.preparePaint(this.width, this.height)) {
        var frame = this.frameBytes(paper);
        this.pixels.fill(0);
        // layout - bkColor
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.backgroundKinds.includes(this.caveData.graphicData[attr].kind)) {
                var bkColor = this.bkColorByAttr(Tool.hexToInt(attr));
                if (bkColor == caveBkColor) {
                  bkColor = false;
                }
                if (bkColor != false) {
                  this.paintRect(column*8, r*8, 8, 8, bkColor);
                }
              }
            }
          }
        });
        paper.ctx.putImageData(frame, 0, 0);
      }

      this.blitCache(0);

      this.drawSubEntities();

      var ink = this.drawingCache[1];
      if (ink.preparePaint(this.width, this.height)) {
        var frame = this.frameBytes(ink);
        var px = this.pixels;
        var stride = frame.width;
        px.fill(0);
        // layout - penColor: every static tile stamped where the layout puts it
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.staticKinds.includes(this.caveData.graphicData[attr].kind)) {
                var stamp = this.tileStamp(attr);
                var at = r*8*stride+column*8;
                for (var y = 0; y < 8; y++) {
                  for (var x = 0; x < 8; x++) {
                    var value = stamp[y*8+x];
                    if (value !== 0) {     // transparent pixels leave what is there, as drawImage did
                      px[at+y*stride+x] = value;
                    }
                  }
                }
              }
            }
          }
        });

        // image
        if ('image' in this.caveData) {
          for (var row = 0; row < 8; row++) {
            for (var column = 0; column < 32; column++) {
              var attr = Tool.hexToInt(this.caveData.image.attributes[row].substring(column*2, column*2+2));
              var penColor = this.monochromeColor;
              var bkColor = ZXColor.bkAttrColor(attr);
              var bkColor2 = bkColor;
              if (penColor == false) {
                penColor = ZXColor.penAttrColor(attr);
              } else {
                bkColor2 = this.bkColor;
              }
              if (bkColor != this.bkColor) {
                this.paintRect(column*8, row*8, 8, 8, bkColor2);
              }
              var penValue = RasterEntity.colorValue(penColor);
              for (var line = 0; line < 8; line++) {
                var bits = Tool.hexToInt(this.caveData.image.data[row+line*8].substring(column*2, column*2+2));
                var at = (row*8+line)*stride+column*8;
                for (var point = 0; point < 8; point++) {
                  if (bits & (0x80 >> point)) {
                    px[at+point] = penValue;
                  }
                }
              }
            }
          }
        }
        ink.ctx.putImageData(frame, 0, 0);
      }
      this.blitCache(1);

      // the parts the beam lights go on last — above the ink of the tiles,
      // where the cell's attribute puts them
      if (!this.demo) {
        this.spriteEntities.willy.forEach((willy) => willy.drawTints());
      }
      this.spriteEntities.guardians.forEach((guardian) => guardian.drawTints());
    }

  } // drawEntity

  /**
   * Tells Willy and the guardians which parts of them the light beam lights
   * this frame. Called before the sprites are drawn, so a sprite paints its lit
   * parts in the same frame the beam moved — the beam's parts are positioned by
   * updateData() from the worker's frame, before any drawing.
   */
  lightSprites() {
    // the beam changes the attributes of the cells it crosses, so a sprite
    // standing in it takes the beam's ink there; the sprite paints its lit parts
    // over itself (SpriteEntity.setTints), nothing here touches its pixels
    var objectsArray = [];
    if (!this.demo) {
      objectsArray.push(this.spriteEntities.willy);
    }
    objectsArray.push(this.spriteEntities.guardians);
    for (var a = 0; a < objectsArray.length; a++) {
      var objects = objectsArray[a];
      for (var o = 0; o < objects.length; o++) {
        var obj = objects[o];
        var tints = [];
        var p = 0;
        while (p < this.spriteEntities.lightBeam.length && !this.spriteEntities.lightBeam[p].hide) {
          var part = this.spriteEntities.lightBeam[p];
          if (!(obj.x+obj.width <= part.x || obj.y+obj.height <= part.y || obj.x >= part.x+part.width || obj.y >= part.y+part.height)) {
            var x = Math.max(obj.x, part.x);
            var y = Math.max(obj.y, part.y);
            tints.push({
              x: x-obj.x, y: y-obj.y,
              width: Math.min(obj.x+obj.width, part.x+part.width)-x,
              height: Math.min(obj.y+obj.height, part.y+part.height)-y,
              color: part.penColor
            });
          }
          p++;
        }
        obj.setTints(tints);
      }
    }
  } // lightSprites

  setData(data) {
    this.caveData = data;
    
    this.bkColor = ZXColor.attrColor(Tool.hexToInt(this.caveData.bkColor), 56, 8);
    this.bkColorForRestore = this.bkColor;

    // light beam
    if ('lightBeam' in data) {
      this.initData.lightBeam = [];
      var penColor = ZXColor.penAttrColor(Tool.hexToInt(data.lightBeam.attribute));
      var bkColor = ZXColor.bkAttrColor(Tool.hexToInt(data.lightBeam.attribute));
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
      var penColor = ZXColor.penAttrColor(Tool.hexToInt(data.willy.attribute));
      var entity = new SpriteEntity(this, data.willy.init.x+data.willy.paintCorrections.x, data.willy.init.y, penColor, false, data.willy.init.frame, data.willy.init.direction);
      this.addEntity(entity);
      entity.setGraphicsData(data.willy);
      entity.deferTints = true;    // lit by the beam last, see drawEntity()
      this.spriteEntities.willy.push(entity);
      this.initData.willy.push({
        x: data.willy.init.x,
        y: data.willy.init.y,
        width: data.willy.width,
        height: data.willy.height,
        paintCorrections: data.willy.paintCorrections,
        blankMargins: SpriteTool.buildBlankMargins(data.willy),
        frame: data.willy.init.frame,
        frames: data.willy.frames,
        direction: data.willy.init.direction,
        directions: data.willy.directions
      });
    }

    // the layout caches and the tile stamps are built again on the next draw
    this.cleanCache();

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
          var penColor = ZXColor.penAttrColor(Tool.hexToInt(attr));
          switch (data.graphicData[attr].kind) {
            case 'floor':
              this.initData.floors.push({x: column*8, y: r*8, width: 8, height: 8});
              break;
            case 'crumblingFloor':
              var entity = new SpriteEntity(this, column*8, r*8, penColor, false, 0, 0);
              entity.setGraphicsData(data.graphicData[attr]);
              var crumbleGrid = data.graphicData[attr].sprite;
              for (var c = 1; c <= 7; c++) {
                entity.addFrameData(SpriteTool.shiftCrop(crumbleGrid, 0, c, 8, 8), false);
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
      var penColor = ZXColor.penAttrColor(Tool.hexToInt(conveyorData.attr));
      var entity = new SpriteEntity(this, conveyorData.x*8, conveyorData.y*8, penColor, false, 0, 0);
      entity.setFixSize(8, 8);
      entity.setRepeatX(conveyorData.length);
      entity.setGraphicsData(data.graphicData[conveyorData.attr]);
      var rotateDirection = 1;
      if (data.graphicData[conveyorData.attr].moving == 'right') {
        rotateDirection = -1;
      }
      var conveyorGrid = data.graphicData[conveyorData.attr].sprite;
      for (var f = 1; f <= 3; f++) {
        var grid = SpriteTool.rotateRow(conveyorGrid, 0, -2*f*rotateDirection);
        grid = SpriteTool.rotateRow(grid, 2, 2*f*rotateDirection);
        entity.addFrameData(grid, false);
      }
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
      var itemColor = Tool.hexToInt(item.initAttribute)&7;
      var bkColor = ZXColor.bkAttrColor(Tool.hexToInt(item.initAttribute));
      if (bkColor == ZXColor.bkAttrColor(Tool.hexToInt(data.bkColor))) {
        bkColor = false;
      }
      var tmpColor = itemColor;
      var penColor0 = ZXColor.color(tmpColor);
      tmpColor = Tool.cycleInc(tmpColor, 3, 6);
      var penColor1 = ZXColor.color(tmpColor);
      tmpColor = Tool.cycleInc(tmpColor, 3, 6);
      var penColor2 = ZXColor.color(tmpColor);
      tmpColor = Tool.cycleInc(tmpColor, 3, 6);
      var penColor3 = ZXColor.color(tmpColor);
      var entity = new SpriteEntity(this, item.x*8, item.y*8, false, bkColor, 0, 0);
      this.addEntity(entity);
      entity.setSharedPalette({'#': {0: penColor0, 1: penColor1, 2: penColor2, 3: penColor3}});
      entity.setGraphicsData(data.items);
      for (var f = 0; f < 3; f++) {
        entity.addFrameData(data.items.sprite, false);
      }
      this.spriteEntities.items.push(entity);
      this.initData.items.push({hide: false, x: item.x*8, y: item.y*8, width: 8, height: 8, frame: 0, direction: 0});
      itemColor = Tool.cycleInc(itemColor, 3, 6);
    });

    // guardians
    this.initData['guardians'] = [];
    ['horizontal', 'vertical', 'forDropping', 'falling'].forEach((guardianType) => {
      if (guardianType in data.guardians) {
        var guardianTypeData = data.guardians[guardianType];
        guardianTypeData.figures.forEach((guardian) => {
          var penColor = ZXColor.penAttrColor(Tool.hexToInt(guardian.attribute));
          var paintCorrectionsX = 0;
          var paintCorrectionsY = 0;
          if ('paintCorrections' in guardianTypeData) {
            paintCorrectionsX = guardianTypeData.paintCorrections.x;
            paintCorrectionsY = guardianTypeData.paintCorrections.y;
          }
          var entity = new SpriteEntity(this, guardian.init.x+paintCorrectionsX, guardian.init.y+paintCorrectionsY, penColor, false, guardian.init.frame, guardian.init.direction);
          // build with a palette so pixels carry c='#'; lets the runtime setSharedPalette action recolor per frame
          entity.setSharedPalette({'#': penColor});
          entity.setGraphicsData(guardianTypeData);
          entity.deferTints = true;    // lit by the beam last, see drawEntity()
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
          guardianInitData.blankMargins = SpriteTool.buildBlankMargins(guardianTypeData);
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
        var penColor = ZXColor.penAttrColor(Tool.hexToInt(barrier.attribute));
        var bkColor = ZXColor.bkAttrColor(Tool.hexToInt(barrier.attribute));
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
        var penColor = ZXColor.penAttrColor(Tool.hexToInt(swtch.attribute));
        var bkColor = ZXColor.bkAttrColor(Tool.hexToInt(swtch.attribute));
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
    var penColor = ZXColor.penAttrColor(Tool.hexToInt(data.portal.attribute));
    var bkColor = ZXColor.bkAttrColor(Tool.hexToInt(data.portal.attribute));
    var entity = new SpriteEntity(this, data.portal.x*8, data.portal.y*8, false, false, 0, 0);
    this.addEntity(entity);
    entity.setSharedPalette({'-': {0: bkColor, 1: penColor}, '#': {0: penColor, 1: bkColor}});
    entity.setGraphicsData(data.portal);
    entity.addFrameData(data.portal.sprite, false);
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
          case 'setSharedPalette':
            var palette = {};
            palette[spriteEntity.penChar] = {};
            object.action.data.forEach((attr, frame) => {
              palette[spriteEntity.penChar][frame] = ZXColor.penAttrColor(Tool.hexToInt(attr));
            });
            spriteEntity.setSharedPalette(palette);
            break;
        }
      }
    });
  } // updateData

  /**
   * Invalidates both layout caches and throws the tile stamps away, so that a
   * change of colour (setBkColor, setMonochromeColors) repaints everything;
   * the stamps carry the pen colour, which is why they cannot stay.
   */
  cleanCache() {
    this.drawingCache[0].cleanCache();
    this.drawingCache[1].cleanCache();
    this.graphicCache = {};
  } // cleanCache

  /**
   * The pixels of one static tile as it is drawn now — packed colour where the
   * tile has ink, 0 where it is transparent — decoded on first use and kept
   * until the colours change.
   * @param {string} attr - The tile's attribute, the key into graphicData.
   * @returns {Uint32Array} 64 pixels, row by row.
   */
  tileStamp(attr) {
    var stamp = this.graphicCache[attr];
    if (!stamp) {
      stamp = new Uint32Array(64);
      var value = RasterEntity.colorValue(this.penColorByAttr(Tool.hexToInt(attr)));
      var sprite = this.caveData.graphicData[attr].sprite;
      for (var y = 0; y < sprite.length && y < 8; y++) {
        for (var x = 0; x < sprite[y].length && x < 8; x++) {
          if (sprite[y][x] == '#') {
            stamp[y*8+x] = value;
          }
        }
      }
      this.graphicCache[attr] = stamp;
    }
    return stamp;
  } // tileStamp

  penColorByAttr(attr) {
    if (this.monochromeColor) {
      return this.monochromeColor;
    }
    return ZXColor.penAttrColor(attr);
  } // penColorByAttr

  bkColorByAttr(attr) {
    if (this.monochromeColor) {
      return false;
    }
    return ZXColor.bkAttrColor(attr);
  } // bkColorByAttr

  restoreBkColor() {
    if (this.restoreBkColor !== false) {
      this.bkColor = this.bkColorForRestore;
    }
  } // restoreBkColor

  setMonochromeColors(monochromeColor, bkColor) {
    if (monochromeColor != this.monochromeColor) {
      this.monochromeColor = monochromeColor;
      // setBkColor invalidates the caches only when bkColor changes; the pen color change must do it too
      this.cleanCache();
    }
    this.setBkColor(bkColor);

    Object.keys(this.spriteEntities).forEach((objectsType) => {
      this.spriteEntities[objectsType].forEach((object) => {
        object.bkColor = false;
        object.setPenColor(monochromeColor);
      });
    });
  } // setMonochromeColors

} // GameAreaEntity
