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

    this.clickCounter = 0;
  } // constructor

  init() {
    super.init();
    
    this.addEntity(new AbstractEntity(this, 0, 0, this.width, this.height, false, this.app.platform.colorByName('black')));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, 'ABOUT GAME', {id: 'clickLabel'}, [], this.app.platform.colorByName('brightWhite'), false, {align: 'center', topMargin: 2, member: 'titleBar', hoverColor: this.app.platform.colorByName('black'), clickColor: this.app.platform.colorByName('black')}));
    this.addEntity(new AbstractEntity(this, 1, 9, this.width-2, this.height-10, false, this.app.platform.colorByName('yellow')));

    this.aboutText = 'MANIC MINER IS A REMAKE OF THE ORIGINAL 1983 GAME FOR THE SINCLAIR ZX SPECTRUM BY MATTHEW SMITH.\n' +
                    'THIS GAME HAS FASCINATED ME EVER SINCE I SAW IT FOR THE FIRST TIME. ' +
                    'I BELIEVE THAT MANY PLAYERS WILL ENJOY REMINISCING ABOUT THIS LEGENDARY GAME, AND NOT JUST OUT OF NOSTALGIA.\n' +
                    'IN THIS REMAKE, YOU ALSO HAVE THE OPTION TO CONTINUE IN THE CAVE FROM WHERE YOU LEFT OFF IN YOUR PREVIOUS GAME. ' +
                    'THIS GIVES YOU THE CHANCE TO TRY COMPLETING ALL THE CAVES.';
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 1, 9, this.width-2, this.height-25, this.aboutText, this.app.platform.colorByName('black'), false, {align: 'justify', textWrap: true, margin: 2, member: 'aboutText'}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts3x3, 1, this.height-8, 97, 7, 'github:mitrenga/manicminer', {id: 'openGithub'}, [], '#777777', false, {margin:2, hoverColor: '#f3de25', clickColor: '#cc9410'}));
    
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-39, this.height-16, 36, 13, 'CLOSE', {id: 'closeAbout'}, ['Enter', 'Escape', ' ', 'GamepadOK', 'GamepadExit'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('blue'), {align: 'center', margin: 4}));

    this.statsText = 'error:\nstatistics data not available!';
    this.fetchData('stats.db', false, {});
  } // init

  setData(data) {
    this.statsText = '';
    Object.entries(data.data).forEach(([periodKey, periodValue]) => {
      this.statsText += periodKey + ': [';
      Object.entries(periodValue).forEach(([key, value]) => {
        this.statsText += key + ':' + value + ', ';
      });
      this.statsText = this.statsText.slice(0, -2) + ']\n';
    });
  } // setData

  updateAbout() {
    switch (Math.floor(this.clickCounter/5)) {
      case 1:
        this.sendEvent(0, 0, {id: 'updateEntity', member: 'titleBar', text: 'GAME STATS'});
        this.sendEvent(0, 0, {id: 'updateEntity', member: 'aboutText', text: this.statsText});
        break;
      case 2:
        this.sendEvent(0, 0, {id: 'updateEntity', member: 'titleBar', text: 'SYSTEM INFO'});
        var ipLabelSeparator = ' ';
        if (window.clientIP.indexOf(':') >= 0) {
          ipLabelSeparator = '\n';
        }
        var sysInfoText =
          'version: ' + this.app.version + '\n' +
          'element: ' + this.app.element.clientWidth + ' x ' + this.app.element.clientHeight + '\n' +
          'canvas: ' + this.app.element.width + ' x ' + this.app.element.height + '\n' +
          'ratio: ' + this.app.layout.ratio + '\n' +
          'ip:' + ipLabelSeparator + window.clientIP + '\n';
        this.sendEvent(0, 0, {id: 'updateEntity', member: 'aboutText', text: sysInfoText});
        break;
      default:
        this.sendEvent(0, 0, {id: 'updateEntity', member: 'titleBar', text: 'ABOUT GAME'});
        this.sendEvent(0, 0, {id: 'updateEntity', member: 'aboutText', text: this.aboutText});
        break;
    }
  } // updateAbout

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }
    switch (event.id) {

      case 'closeAbout':
        this.destroy();
        return true;

      case 'clickLabel':
        if (this.clickCounter < 14) {
          this.clickCounter++;
        } else {
          this.clickCounter = 0;
        }
        if (this.clickCounter%5 == 0) {
          this.updateAbout();
        }
        return true;

      case 'resizeModel':
        if (this.clickCounter > 9) {
          this.updateAbout();
        }
        return false;

      case 'openGithub':
        window.open('https://github.com/mitrenga/manicminer', 'github:mm');
        return true;
    }
    return false;
  } // handleEvent

} // AboutEntity

export default AboutEntity;
