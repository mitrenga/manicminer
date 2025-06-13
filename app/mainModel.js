/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import MainImageEntity from './mainImageEntity.js';
/**/
// begin code

export class MainModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MainModel';
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.desktopEntity.addEntity(new MainImageEntity(this.desktopEntity, 0, 0, 32*8, 16*8));

    if (this.app.audioManager.music > 0) {
      this.sendEvent(500, {'id': 'openAudioChannel', 'channel': 'music'});
      this.sendEvent(750, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
    }
  } // init

  
  handleEvent(event) {
    switch (event.id) {

      case 'pianoKey':
        var a = event.data.k2;
        var attr = 31-Math.floor((a-8)/8);
        var border = attr&7;
        this.borderEntity.bkColor = this.app.platform.color(border);
        return true;

      case 'melodyCompleted':
        console.log('melodyCompleted');
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent


  /*
      a = tone[1];
      var attr = 31-Math.floor((a-8)/8);
      var border = attr&7;
      var pos = 256+224+attr;
      console.log(22528+pos+' ('+pos%32+';'+Math.floor(pos/32)+')');
      //this.setPianoKeyAttribute(tone[1], 56);
      a = tone[2];
      var attr = 31-Math.floor((a-8)/8);
      var border = attr&7;
      var pos = 256+224+attr;
      console.log(22528+pos+' ('+pos%32+';'+Math.floor(pos/32)+') '+border);
    */

  loopModel(timestamp) {
    super.loopModel(timestamp);
    
    this.drawModel();
  } // loopModel

} // class MainModel

export default MainModel;
