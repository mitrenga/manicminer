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
    this.addEntity(new MiniTextEntity(this, 1, 10, this.width-2, 7, 'JET SET WILLY` IS A REMAKE` OF THE ORIGINAL', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 17, this.width-2, 7, '1984`` GAME` BY`` MATTHEW` SMITH.`` THE` FUNNY', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 24, this.width-2, 7, 'THING`` IS` THAT` WHILE` CREATING`` THIS` GAME,', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 31, this.width-2, 7, 'WHILE```` STUDYING```` THE``` ORIGINAL```` CODE``` FOR', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 38, this.width-2, 7, 'THE SINCLAIR` ZX` SPECTRUM,` I CAME` ACROSS', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 45, this.width-2, 7, 'ERRORS`````` THAT`````` DID`````` NOT`````` ALLOW`````` ME`````` TO', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 52, this.width-2, 7, 'SUCCESSFULLY COMPLETE THE GAME.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 59, this.width-2, 7, 'WHILE SEARCHING` FOR INFORMATION,` I FOUND', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 66, this.width-2, 7, 'OUT` THAT`` THESE` ERRORS` WERE` PUBLISHED', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 73, this.width-2, 7, 'IN`` THE`` 80\'S,``` INCLUDING``` INSTRUCTIONS`` FOR', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 80, this.width-2, 7, 'FIXING THEM.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 87, this.width-2, 7, 'AND I ONLY` FOUND` OUT` 40 YEARS` LATER`` :-)', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 94, this.width-2, 7, 'HOW MANY` MONTHS` AND` SLEEPLESS` NIGHTS', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 101, this.width-2, 7, 'DID MY FRIENDS AND I SPEND EXPERIMENTING', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 108, this.width-2, 7, 'IN`` THE`` ROOMS`` OF`` "THE`` BANYAN`` TREE"`` OR', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 115, this.width-2, 7, '"THE CONSERVATORY ROOF"...', this.app.platform.colorByName('black'), false, 1, 1));
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
