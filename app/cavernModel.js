/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { CavernEntity } = await import('./cavernEntity.js?ver='+window.srcVersion);
const { AirEntity } = await import('./airEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from '././svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import CavernEntity from './cavernEntity.js';
import AirEntity from './airEntity.js';
/**/
// begin code

export class CavernModel extends AbstractModel {
  
  constructor(app, cavernNumber) {
    super(app);
    this.id = 'CavernModel';

    this.cavernNumber = cavernNumber;
    this.cavernEntity = null;
    this.airEntity = null;
    this.cavernNameEntity = null;
    this.scoreEntity = null;
    
    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', this.cavernNumber.toString().padStart(2, '0')+'.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var dataCavern = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setDataCavern', 'dataCavern': dataCavern});
      }
    }
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.cavernEntity = new CavernEntity(this.desktopEntity, 0, 0, 32*8, 16*8);
    this.desktopEntity.addEntity(this.cavernEntity);
    this.cavernNameEntity = new ZXTextEntity(this.desktopEntity, 0, 16*8, 32*8, 8, '', this.app.platform.colorByName('black'), this.app.platform.colorByName('yellow'), 0, false);
    this.cavernNameEntity.justify = 2;
    this.desktopEntity.addEntity(this.cavernNameEntity);
    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 0, 17*8, 4*8, 8, 'AIR', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightRed'), 0, false));
    this.desktopEntity.addEntity(new AirEntity(this.desktopEntity, 4*8, 17*8, 28*8, 8));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 18*8, 32*8, 8, false, this.app.platform.colorByName('black')));
    this.scoreEntity = new ZXTextEntity(this.desktopEntity, 0, 19*8, 32*8, 8, 'High Score 000000   Score 000000', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, false);
    this.desktopEntity.addEntity(this.scoreEntity);
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 20*8, 32*8, 8, false, this.app.platform.colorByName('black')));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 21*8, 32*8, 3*8, false, this.app.platform.colorByName('black')));
  } // init

  setData(data) {
    var dataCavern = data['dataCavern'];
    this.cavernNameEntity.text = dataCavern['name'];
    this.borderEntity.bkColor = this.app.platform.zxColorByAttribut(this.app.hexToInt(dataCavern['borderColor']), 7, 1);
    
    super.setData(data);
  } // setData

  handleEvent(event) {
    if (event['id'] == 'setDataCavern') {
      this.setData(event);
      return true;
    }

    return super.handlEvent(event);
  } // handleEvent

} // class CavernModel

export default CavernModel;
