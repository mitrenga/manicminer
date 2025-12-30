/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class AboutEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'AboutEntity';

    this.sysInfoCounter = 0;
  } // constructor

  init() {
    super.init();
    
    this.addEntity(new AbstractEntity(this, 0, 0, this.width, this.height, false, this.app.platform.colorByName('black')));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, 'ABOUT GAME', {id: 'sysInfo'}, [], this.app.platform.colorByName('brightWhite'), false, {align: 'center', topMargin: 2, member: 'titleBar', hoverColor: this.app.platform.colorByName('black'), clickColor: this.app.platform.colorByName('black')}));
    this.addEntity(new AbstractEntity(this, 1, 9, this.width-2, this.height-10, false, this.app.platform.colorByName('yellow')));

    var aboutText = 'MANIC MINER IS A REMAKE OF THE ORIGINAL 1983 GAME FOR THE SINCLAIR ZX SPECTRUM BY MATTHEW SMITH.\n' +
                    'THIS GAME HAS FASCINATED ME EVER SINCE I SAW IT FOR THE FIRST TIME. ' +
                    'I BELIEVE THAT MANY PLAYERS WILL ENJOY REMINISCING ABOUT THIS LEGENDARY GAME, AND NOT JUST OUT OF NOSTALGIA.\n' +
                    'IN THIS REMAKE, YOU ALSO HAVE THE OPTION TO CONTINUE IN THE CAVE FROM WHERE YOU LEFT OFF IN YOUR PREVIOUS GAME. ' +
                    'THIS GIVES YOU THE CHANCE TO TRY COMPLETING ALL THE CAVES.';
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 1, 9, this.width-2, this.height-25, aboutText, this.app.platform.colorByName('black'), false, {align: 'justify', textWrap: true, margin: 2, member: 'aboutText'}));
    
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-39, this.height-16, 36, 13, 'CLOSE', {id: 'closeAbout'}, ['Enter', 'Escape', ' ', 'GamepadOK', 'GamepadExit'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('blue'), {align: 'center', margin: 4}));
  } // init

  updateSysInfo() {
    this.sendEvent(0, 0, {id: 'updateEntity', member: 'aboutText', text:
      'version: ' + this.app.version + '\n' +
      'canvas size: ' + this.app.element.clientWidth + ' x ' + this.app.element.clientHeight + '\n' +
      'pixels ratio: ' + this.app.layout.ratio + '\n' +
      'client ip: ' + window.clientIP + '\n' +
      'server ip: ' + window.serverIP + '\n'          
    });
  } // updateSysInfo

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }
    switch (event.id) {

      case 'closeAbout':
        this.destroy();
        return true;

      case 'sysInfo':
        if (this.sysInfoCounter == 4) {
          this.sendEvent(0, 0, {id: 'updateEntity', member: 'titleBar', text: 'SYSTEM INFO'});
          this.updateSysInfo();
        }
        if (this.sysInfoCounter < 4) {
          this.sysInfoCounter++;
        }
        return true;
      case 'resizeModel':
        if (this.sysInfoCounter == 4) {
          this.updateSysInfo();
        }
        return false;

    }
    return false;
  } // handleEvent

} // AboutEntity

export default AboutEntity;
