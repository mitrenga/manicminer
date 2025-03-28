/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class CavernEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height);
    this.id = 'CavernEntity';

    this.bkColor = this.app.platform.colorByName('black');
    this.imageData = null;
  } // constructor

  drawEntity() {
    super.drawEntity();

    if (this.imageData != null) {
      for (var y = 0; y < this.imageData['data'].length; y++) {
        for (var x = 0; x < this.imageData['data'][y].length/2; x++) {
          var hexByte = this.imageData['data'][y].substring(x*2, x*2+2);
          var binByte = this.app.hexToBin(hexByte);
          var attr = this.app.hexToInt(this.imageData['attributes'][(y%8)].substring(x*2, x*2+2));
          for (var b = 0; b < binByte.length; b++) {
            if (binByte[b] == '1') {
              this.app.layout.paint(this, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.penColorByAttribute(attr));
            } else {
              this.app.layout.paint(this, x*8+b, (y%8)*8+Math.floor(y%64/8), 1, 1, this.app.platform.bkColorByAttribute(attr));
            }
          }
        }
      }
    }
  } // drawEntity

  setData(data) {
    this.bkColor = this.app.platform.zxColorByAttribute(this.app.hexToInt(data['bkColor']), 56, 8);

    // layout
    data['layout'].forEach((row, y) => {
      for (var x = 0; x < row.length/2; x++) {
        var attr = row.substring(x*2, x*2+2);
        if (attr != data['bkColor']) {
          var graphicData = data['graphicData'][attr]
          //if (['floor', 'wall'].includes(graphicData['kind'])) {
          {
            var spriteData = [];
            var tile = graphicData['sprite'];
            tile.forEach((line, l) => {
              for (var col = 0; col < line.length; col++) {
                if (line[col] == '#') {
                  spriteData.push({'x': col, 'y': l});
                }
              }
            });
            var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(attr));
            var bkColor = this.app.platform.bkColorByAttribute(this.app.hexToInt(attr));
            if (bkColor == this.app.platform.bkColorByAttribute(this.app.hexToInt(data['bkColor']))) {
              bkColor = false;
            }
            this.addEntity(new SpriteEntity(this, x*8, y*8, 8, 8, spriteData, penColor, bkColor));
          }
        }
      }
    });

    //items
    var spriteData = [];
    data['items']['sprite'].forEach((line, l) => {
      for (var col = 0; col < line.length; col++) {
        if (line[col] == '#') {
          spriteData.push({'x': col, 'y': l});
        }
      }
    });

    data['items']['data'].forEach((item) => {
      var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(item['initColor']));
      var bkColor = this.app.platform.bkColorByAttribute(this.app.hexToInt(item['initColor']));
      this.addEntity(new SpriteEntity(this, item['x']*8, item['y']*8, 8, 8, spriteData, penColor, bkColor));
    });

    // portal
    var portal =  data['portal'];
    var attr = portal['attribute'];
    var portalSprite = portal['sprite'];
    var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(attr));
    var bkColor = this.app.platform.bkColorByAttribute(this.app.hexToInt(attr));
    var spriteData = [];
    portalSprite.forEach((row, r) => {
      for (var col = 0; col < row.length; col++) {
        if (row[col] == '#') {
          spriteData.push({'x': col, 'y': r});
        }
      }
    });
    this.addEntity(new SpriteEntity(this, portal['location']['x']*8, portal['location']['y']*8, 16, 16, spriteData, penColor, bkColor));

    // Willy
    var willy =  data['willy'];
    var willySprite = willy['sprite'][willy['init']['animationFrame']];
    var penColor = this.app.platform.colorByName('white');
    var spriteData = [];
    var spriteWidth = 0;
    var spriteHeight = 0;
    willySprite.forEach((row, r) => {
      for (var col = 0; col < row.length; col++) {
        if (row[col] == '#') {
          spriteData.push({'x': col, 'y': r});
          if (col+1 > spriteWidth) {
            spriteWidth = col+1;
          }
        }
      }
      spriteHeight++;
    });
    this.addEntity(
      new SpriteEntity(
        this,
        willy['init']['x']+willy['paintCorrections']['x'],
        willy['init']['y']+willy['paintCorrections']['y'],
        spriteWidth,
        spriteHeight,
        spriteData,
        penColor,
        false
      )
    );

    // guardians
    ['horizontal', 'vertical'].forEach((guardianType) => {
      if (guardianType in data['guardians']) {
        var guardianTypeData = data['guardians'][guardianType];
        data['guardians'][guardianType]['figures'].forEach((guardian) => {
          var guardianSprite = data['guardians'][guardianType]['sprite'][guardian['init']['animationFrame']];
          var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(guardian['attribute']));
          var spriteData = [];
          var spriteWidth = 0;
          var spriteHeight = 0;
          guardianSprite.forEach((row, r) => {
            for (var col = 0; col < row.length; col++) {
              if (row[col] == '#') {
                spriteData.push({'x': col, 'y': r});
                if (col+1 > spriteWidth) {
                  spriteWidth = col+1;
                }
              }
            }
            spriteHeight++;
          });
          this.addEntity(
            new SpriteEntity(
              this,
              guardian['init']['x']+guardianTypeData['paintCorrections']['x'],
              guardian['init']['y']+guardianTypeData['paintCorrections']['y'],
              spriteWidth,
              spriteHeight,
              spriteData,
              penColor,
              false
            )
          );
        });
      }
    });
    
    if ('image' in data) {
      this.imageData = data['image'];
    }
    
    super.setData(data);
  } // setData
    

} // class CavernEntity

export default CavernEntity;
