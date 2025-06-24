/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class CaveEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, caveNumber) {
    super(parentEntity, x, y, width, height);
    this.id = 'CaveEntity';

    this.caveNumber = caveNumber;
    this.bkColor = this.app.platform.colorByName('black');
    this.lightBeam = false
    this.imageData = false;
  } // constructor

  drawEntity() {
    super.drawEntity();

    if (this.lightBeam !== false) {
      this.app.layout.paint(
        this,
        this.lightBeam.init.x,
        this.lightBeam.init.y,
        this.lightBeam.width,
        this.lightBeam.height*15,
        this.app.platform.bkColorByAttr(this.app.hexToInt(this.lightBeam.attribute))
      );
    }

    if (this.imageData !== false) {
      for (var y = 0; y < this.imageData.data.length; y++) {
        for (var x = 0; x < this.imageData.data[y].length/2; x++) {
          var hexByte = this.imageData.data[y].substring(x*2, x*2+2);
          var binByte = this.app.hexToBin(hexByte);
          var attr = this.app.hexToInt(this.imageData.attributes[(y%8)].substring(x*2, x*2+2));
          for (var b = 0; b < binByte.length; b++) {
            if (binByte[b] == '1') {
              this.app.layout.paint(this, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.penColorByAttr(attr));
            } else {
              if (this.app.platform.bkColorByAttr(attr) != this.bkColor) {
                this.app.layout.paint(this, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.bkColorByAttr(attr));
              }
            }
          }
        }
      }
    }
  } // drawEntity

  setData(data) {
    this.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.bkColor), 56, 8);

    // layout
    data.layout.forEach((row, y) => {
      for (var x = 0; x < row.length/2; x++) {
        var attr = row.substring(x*2, x*2+2);
        if (attr != data.bkColor) {
          //if (['floor', 'wall'].includes(data.graphicData.kind)) {
          {
            var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
            var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr));
            if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(data.bkColor))) {
              bkColor = false;
            }
            var layoutEntity = new SpriteEntity(this, x*8, y*8, penColor, bkColor, 0, 0);
            this.addEntity(layoutEntity);
            layoutEntity.setGraphicsData(data.graphicData[attr]);
          }
        }
      }
    });

    //items
    data.items.data.forEach((item) => {
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(item.initAttribute));
      var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(item.initAttribute));
      var itemEntity = new SpriteEntity(this, item.x*8, item.y*8, penColor, bkColor, 0, 0);
      this.addEntity(itemEntity);
      itemEntity.setGraphicsData(data.items);
    });

    // Willy
    var willy = data.willy;
    var penColor = this.app.platform.colorByName('white');
    var willyEntity = new SpriteEntity(this, willy.init.x+willy.paintCorrections.x, willy.init.y+willy.paintCorrections.y, penColor, false, willy.init.frame, willy.init.direction);
    this.addEntity(willyEntity);
    willyEntity.setGraphicsData(willy);

    // guardians
    ['horizontal', 'vertical', 'forDropping', 'falling'].forEach((guardianType) => {
      if (guardianType in data.guardians) {
        var guardianTypeData = data.guardians[guardianType];
        guardianTypeData.figures.forEach((guardian) => {
          var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
          var guardianEntity = new SpriteEntity(this, guardian.init.x+guardianTypeData.paintCorrections.x, guardian.init.y+guardianTypeData.paintCorrections.y, penColor, false, guardian.init.frame, guardian.init.direction);
          this.addEntity(guardianEntity);
          guardianEntity.setGraphicsData(guardianTypeData);
        });
      }
    });

    // portal
    var portal =  data.portal;
    var attr = portal.attribute;
    var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
    var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr));
    var portalEntity = new SpriteEntity(this, portal.location.x*8, portal.location.y*8, penColor, bkColor, 0, 0);
    this.addEntity(portalEntity);
    portalEntity.setGraphicsData(data.portal);
    
    if ('lightBeam' in data) {
      this.lightBeam = data.lightBeam;
    }

    if ('image' in data) {
      this.imageData = data.image;
    }
    
    super.setData(data);
  } // setData    

} // class CaveEntity

export default CaveEntity;
