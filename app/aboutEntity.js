/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
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
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, 'ABOUT GAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), {align: 'center', margin: 2}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 11, this.width-4, 5, 'MANIC`` MINER`` IS`` A` REMAKE`` OF`` THE` ORIGINAL', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 19, this.width-4, 5, '1983` GAME` FOR` THE` SINCLAIR`` ZX` SPECTRUM', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 27, this.width-4, 5, 'BY MATTHEW SMITH.', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 39, this.width-4, 5, 'THIS` GAME`` HAS` FASCINATED`` ME` EVER` SINCE', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 47, this.width-4, 5, 'I SAW IT FOR THE FIRST` TIME.` I BELIEVE THAT', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 55, this.width-4, 5, 'MANY``````` PLAYERS`````` WILL`````` ENJOY````` REMINISCING', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 63, this.width-4, 5, 'ABOUT```` THIS```` LEGENDARY```` GAME,```` AND```` NOT', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 71, this.width-4, 5, 'JUST OUT OF NOSTALGIA.', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 83, this.width-4, 5, 'IN THIS REMAKE, YOU ALSO HAVE THE OPTION', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 91, this.width-4, 5, 'TO` CONTINUE` IN THE` CAVE` FROM` WHERE` YOU', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 99, this.width-4, 5, 'LEFT```` OFF```` IN``` YOUR```` PREVIOUS```` GAME.``` THIS', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 107, this.width-4, 5, 'GIVES` YOU` THE CHANCE` TO TRY COMPLETING', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 115, this.width-4, 5, 'ALL THE CAVES.', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-38, this.height-15, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', margin: 4}));
  } // init

  handleEvent(event) {
    switch (event.id) {
      case 'closeAbout':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class AboutEntity

export default AboutEntity;
