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

    this.borderEntity.bkColor = this.app.platform.colorByName('magenta');
    this.desktopEntity.addEntity(new MainImageEntity(this.desktopEntity, 0, 0, 32*8, 16*8));

    if (this.app.audioManager.music > 0) {
      this.sendEvent(500, {'id': 'openAudioChannel', 'channel': 'music'});
      this.sendEvent(750, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
    }
  } // init

} // class MainModel

export default MainModel;
