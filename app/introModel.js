/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { IntroImageEntity } = await import('./introImageEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import IntroImageEntity from './introImageEntity.js';
/**/
// begin code

export class IntroModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'IntroModel';

    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', 'global.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setGlobalData', 'data': data});
      }
    }
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('magenta');
    this.desktopEntity.addEntity(new IntroImageEntity(this.desktopEntity, 0, 0, 32*8, 16*8));
  } // init

  handleEvent(event) {
    if (event['id'] == 'setGlobalData') {
      this.app.setGlobalData(event['data']);
      return true;
    }
    return super.handlEvent(event);
  } // handleEvent

} // class IntroModel

export default IntroModel;
