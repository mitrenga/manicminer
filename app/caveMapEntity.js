/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class CaveMapEntity extends AbstractEntity {
  
  constructor(parentEntity, x, y, caveNumber, locked) {
    super(parentEntity, x, y, 64, 38, false, false);
    this.id = 'CaveMapEntity';

    this.caveNumber = caveNumber;
    this.locked = locked;
    this.caveData = null;
    this.mapKinds = ['floor', 'crumblingFloor', 'wall', 'nasty', 'conveyor'];
    this.caveNameEntity = null;

    this.app.layout.newDrawingCache(this, 0);
  } // constructor

  init() {
    super.init();

    this.caveNameEntity = new TextEntity(this, this.app.fonts.fonts3x3, 0, 33, 64, 3, '', this.app.platform.colorByName('brightWhite'), false, {align: 'center'});
    this.addEntity(this.caveNameEntity);
    if (this.locked) {
      this.addEntity(new AbstractEntity(this, 0, 0, this.width, this.height, false, '#9a9595c0'));
      var padlockEntity = new SpriteEntity(this, Math.floor((this.width-11)/2), Math.floor((this.height-13)/2), this.app.platform.colorByName('red'), false, 0, 0);
      padlockEntity.setCompressedGraphicsData('lP100B00D0B040307050209010F080A0G012334140414041415671815696A656', false);
      this.addEntity(padlockEntity);
    } 
    var caveId = 'cave'+this.caveNumber.toString().padStart(2, '0');
    this.fetchData(caveId+'.data', {key: caveId, when: 'required'}, {});
  } // init

  setData(data) {
    this.caveData = data.data;
    this.caveNameEntity.setText(data.data.shortName);
  } // setData

  drawEntity() {
    if (this.caveData) {

      this.bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.bkColor));
      this.app.layout.paint(this, 0, 0, this.width, this.height-6, this.bkColor);
      this.app.layout.paint(this, 0, this.height-6, this.width, 6, this.app.platform.colorByName('black'));

      if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {

        // layout
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.mapKinds.includes(this.caveData.graphicData[attr].kind)) {
                var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr));
                if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.bkColor))) {
                  bkColor = false;
                }
                if (bkColor != false) {
                  this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 2, bkColor);
                }
                var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
                switch (this.caveData.graphicData[attr].kind) {
                  case 'floor':
                  case 'crumblingFloor':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 1, penColor);
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2+1, r*2+1, 1, 1, penColor);
                    break;
                  case 'wall':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 1, 1, penColor);
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2+1, r*2+1, 1, 1, penColor);
                    break;
                  case 'conveyor':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 1, penColor);
                    break;
                  case 'nasty':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 1, penColor);
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2+1, 1, 1, penColor);
                    break;
                  default:
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 2, penColor);
                    break;
                }
              }
            }
          }
        });

        // image
        if ('image' in this.caveData) {
          for (var row = 0; row < 8; row++) {
            for (var column = 0; column < 32; column++) {
              var attr = this.app.hexToInt(this.caveData.image.attributes[row].substring(column*2, column*2+2));
              var penColor = this.app.platform.penColorByAttr(attr);
              var bkColor = this.app.platform.bkColorByAttr(attr);
              if (bkColor != this.bkColor) {
                this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, row*2, 2, 2, bkColor);
              }
              for (var line = 0; line < 2; line++) {
                for (var point = 0; point < 2; point++) {
                  var points = 0;
                  for (var y = 0; y < 4; y++) {
                    for (var x = 0; x < 4; x++) {
                      var binMask = this.app.hexToBin(this.caveData.image.data[row+line*32+y*8].substring(column*2, column*2+2))
                      if (binMask[point*4+x] == '1') {
                        points++;
                      }
                    }
                  }
                  if (points > 7) {
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2+point, row*2+line, 1, 1, penColor);
                  } else {
                    var redColor1 = this.app.hexToInt(penColor.substring(1, 3));
                    var greenColor1 = this.app.hexToInt(penColor.substring(3, 5));
                    var blueColor1 = this.app.hexToInt(penColor.substring(5, 7));
                    var redColor2 = this.app.hexToInt(bkColor.substring(1, 3));
                    var greenColor2 = this.app.hexToInt(bkColor.substring(3, 5));
                    var blueColor2 = this.app.hexToInt(bkColor.substring(5, 7));
                    var mixColor = '#'+this.app.intToHex(Math.floor((redColor1*points+redColor2*(16-points))/16), 2)+this.app.intToHex(Math.floor((greenColor1*points+greenColor2*(16-points))/16), 2)+this.app.intToHex(Math.floor((blueColor1*points+blueColor2*(16-points))/16), 2);
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2+point, row*2+line, 1, 1, mixColor.toLowerCase());
                  }
                }
              }
            }
          }
        }

        // light beam
        if ('lightBeam' in this.caveData) {
          var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.lightBeam.attribute));
          this.app.layout.paintRect(
            this.drawingCache[0].ctx,
            Math.round(this.caveData.lightBeam.init.x/4),
            Math.round(this.caveData.lightBeam.init.y/4),
            Math.round(this.caveData.lightBeam.init.width/4),
            Math.round(this.caveData.lightBeam.init.height/4),
            bkColor
          );
        }

        // items
        this.caveData.items.data.forEach((item) => {
          var itemColor = this.app.platform.color(this.app.hexToInt(item.initAttribute)&7);
          var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(item.initAttribute));
          if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.bkColor))) {
            bkColor = false;
          }
          if (bkColor != false) {
            this.app.layout.paintRect(this.drawingCache[0].ctx, item.x*2, item.y*2, 2, 2, bkColor);          
          }
          this.app.layout.paintRect(this.drawingCache[0].ctx, item.x*2, item.y*2, 1, 1, itemColor);
          this.app.layout.paintRect(this.drawingCache[0].ctx, item.x*2+1, item.y*2+1, 1, 1, itemColor);
        });

        // gurdians
        ['horizontal', 'vertical', 'forDropping', 'falling'].forEach((guardianType) => {
          if (guardianType in this.caveData.guardians) {
            var guardianTypeData = this.caveData.guardians[guardianType];
            guardianTypeData.figures.forEach((guardian) => {
              var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
              if ('mapSprite' in guardianTypeData) {
                for (var r = 0; r < guardianTypeData.mapSprite.length; r++) {
                  for (var c = 0; c < guardianTypeData.mapSprite[r].length; c++) {
                    if (guardianTypeData.mapSprite[r][c] == '#') {
                      if (guardian.init.direction == 1) {
                        this.app.layout.paintRect(this.drawingCache[0].ctx, Math.floor(guardian.init.x/4)+guardianTypeData.mapSprite[r].length-c-1, Math.floor(guardian.init.y/4)+r, 1, 1, penColor);
                      } else {
                        this.app.layout.paintRect(this.drawingCache[0].ctx, Math.floor(guardian.init.x/4)+c, Math.floor(guardian.init.y/4)+r, 1, 1, penColor);
                      }
                    }
                  }
                }
              } else {
                this.app.layout.paintRect(
                  this.drawingCache[0].ctx,
                  Math.floor(guardian.init.x/4),
                  Math.floor(guardian.init.y/4),
                  Math.floor(guardianTypeData.width/4),
                  Math.floor(guardianTypeData.height/4),
                  penColor
                );
              }
            });
          }
        });

        // barriers
        if ('barriers' in this.caveData) {
          this.caveData.barriers.data.forEach((barrier) => {
            var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(barrier.attribute));
            var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(barrier.attribute));
            for (var x = 0; x < Math.round(barrier.width/8); x++) {
              for (var y = 0; y < Math.round(barrier.height/8); y++) {
                this.app.layout.paintRect(this.drawingCache[0].ctx, (barrier.x+x)*2, (barrier.y+y)*2, 2, 2, bkColor);
                this.app.layout.paintRect(this.drawingCache[0].ctx, (barrier.x+x)*2, (barrier.y+y)*2, 1, 1, penColor);
                this.app.layout.paintRect(this.drawingCache[0].ctx, (barrier.x+x)*2+1, (barrier.y+y)*2+1, 1, 1, penColor);
              }
            }
          });
        }

        // switches
        if ('switches' in this.caveData) {
          this.caveData.switches.data.forEach((swtch) => {
            var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(swtch.attribute));
            var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(swtch.attribute));
            if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.bkColor))) {
              bkColor = false;
            }
            if (bkColor != false) {
              this.app.layout.paintRect(this.drawingCache[0].ctx, swtch.x*2, swtch.y*2, 2, 2, bkColor);          
            }
            this.app.layout.paintRect(this.drawingCache[0].ctx, swtch.x*2+1, swtch.y*2, 1, 1, penColor);
            this.app.layout.paintRect(this.drawingCache[0].ctx, swtch.x*2, swtch.y*2+1, 1, 1, penColor);
          });
        }

        // portal
        var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(this.caveData.portal.attribute));
        var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.portal.attribute));
        this.app.layout.paintRect(this.drawingCache[0].ctx, this.caveData.portal.x*2, this.caveData.portal.y*2, 4, 4, bkColor);
        this.app.layout.paintRect(this.drawingCache[0].ctx, this.caveData.portal.x*2+1, this.caveData.portal.y*2+1, 2, 2, penColor);
      }
      this.app.layout.paintCache(this, 0);
    }
    this.drawSubEntities();
  } // drawEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'keyPress':
        switch (event.key) {            
          case 'Mouse1':
            if (!this.locked && this.pointOnEntity(event)) {
              this.app.inputEventsManager.keysMap.Mouse1 = this;
              this.clickState = true;
              return true;
            }
            return false;
          case 'Touch':
            if (!this.locked && this.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this;
              this.clickState = true;
              return true;
            }
            return false;
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
            if (this.pointOnEntity(event)) {
              if (this.app.inputEventsManager.keysMap.Mouse1 === this) {
                this.app.caveNumber = this.caveNumber;
                this.app.startCave(false, true, false);
                return true;
              }
            }
            break;
          case 'Touch':
            if (this.pointOnEntity(event)) {
              if (this.app.inputEventsManager.touchesMap[event.identifier] === this) {
                this.app.caveNumber = this.caveNumber;
                this.app.startCave(false, true, false);
                return true;
              }
            }
            break;
        }
        break;
    }
    return false;
  } // handleEvent

} // CaveMapEntity

export default CaveMapEntity;
