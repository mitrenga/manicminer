/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MiniTextEntity } = await import('./svision/js/platform/canvas2D/miniTextEntity.js?ver='+window.srcVersion);
const { MiniButtonEntity } = await import('./svision/js/platform/canvas2D/miniButtonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import MiniTextEntity from './svision/js/platform/canvas2D/miniTextEntity.js';
import MiniButtonEntity from './svision/js/platform/canvas2D/miniButtonEntity.js';
/**/
// begin code

export class AboutEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'AboutEntity';    
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.app.platform.colorByName('yellow')));
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    var titleEntity = new MiniTextEntity(this, 0, 0, this.width, 9, 'ABOUT GAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), 1, 2);
    titleEntity.justify = 2;
    this.addEntity(titleEntity);
    this.addEntity(new MiniTextEntity(this, 1, 10, this.width-2, 7, 'MANIC`` MINER`` IS`` A` REMAKE`` OF`` THE` ORIGINAL', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 18, this.width-2, 7, '1983` GAME` FOR` THE` SINCLAIR`` ZX` SPECTRUM', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 26, this.width-2, 7, 'BY MATTHEW SMITH.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 38, this.width-2, 7, 'THIS` GAME`` HAS` FASCINATED`` ME` EVER` SINCE', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 46, this.width-2, 7, 'I SAW IT FOR THE FIRST` TIME.` I BELIEVE THAT', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 54, this.width-2, 7, 'MANY``````` PLAYERS`````` WILL`````` ENJOY````` REMINISCING', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 62, this.width-2, 7, 'ABOUT```` THIS```` LEGENDARY```` GAME,```` AND```` NOT', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 70, this.width-2, 7, 'JUST OUT OF NOSTALGIA.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 82, this.width-2, 7, 'IN THIS REMAKE, YOU ALSO HAVE THE OPTION', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 90, this.width-2, 7, 'TO` CONTINUE` IN THE` CAVE` FROM` WHERE` YOU', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 98, this.width-2, 7, 'LEFT```` OFF```` IN``` YOUR```` PREVIOUS```` GAME.``` THIS', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 106, this.width-2, 7, 'GIVES` YOU` THE CHANCE` TO TRY COMPLETING', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 114, this.width-2, 7, 'ALL THE CAVES.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniButtonEntity(this, this.width-38, this.height-15, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), 1, 4));
    // MANIC MINER je remake původní hry z roku 1983 pro Sinclair ZX Spectrum od Matthew Smith. Tato hra mě fascinuje od prvního okamžiku, kdy jsem ji spatřil. Věřím, že si na tuto legendární hru rádo zavzpomíná mnoho hráčů, a to nejen z nostalgie. V tomto remaku máte nyní navíc možnost pokračovat v jeskyni, tam kde jste skončili předchozí hru, takže máte možnost si vyzkoušet úspěšně projít všemi jestkyněmi...
  } // init

  handleEvent(event) {
    switch (event['id']) {
      case 'closeAbout':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class AboutEntity

export default AboutEntity;
