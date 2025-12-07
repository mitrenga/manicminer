/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { SignboardEntity } = await import('./signboardEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import SignboardEntity from './signboardEntity.js';
/**/
// begin code

export class TapeLoadingModel extends AbstractModel {
  
  constructor(app) {
    super(app);   
    this.id = 'TapeLoadingModel';
    
    this.inputLineEntity = null;
    this.commandPhase = 0;
    this.command = ['K', 'LOAD L', 'LOAD "L', 'LOAD ""L', ''];
    this.programNameEntity = null;
    this.copyrightLine1 = null;
    this.copyrightLine2 = null;
    this.signboardEntity = null;
    this.app.stack.flashState = false;
    this.tapeBreak = false;
    this.tapeBreakLine = '0:1';
    this.tapePhase = false;
    this.tape = [
      {id: 'pause', duration: 1000},
      
      {id: 'pilot', duration: 3000},
      {id: 'data', duration: 100},
      {id: 'pause', duration: 800, 'event': 'setProgramName'},
      {id: 'pilot', duration: 1500},
      {id: 'data', duration: 840},
      
      {id: 'pause', duration: 1000, event: 'printCopyright'},
      
      {id: 'pilot', duration: 3000},
      {id: 'data', duration: 100},
      {id: 'pause', duration: 800},
      {id: 'pilot', duration: 1500},
      {id: 'data', duration: 1380, event: 'showSignboard'},

      {id: 'pause', duration: 1000, event: 'beginLoadCode'},
      
      {id: 'pilot', duration: 3000},
      {id: 'data', duration: 100},
      {id: 'pause', duration: 800, event: 'scrollScreen'},
      {id: 'pilot', duration: 1500},
      {id: 'data', duration: 5000}
    ];
  } // constructor

  newBorderEntity() {
    return new BorderEntity(null, 0, 0, 0, 0, false, false);
  } // newBorderEntity

  init() {
    super.init();

    this.inputLineEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, {align: 'center'});
    this.desktopEntity.addEntity(this.inputLineEntity);

    this.programNameEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 1*8, 32*8, 8, 'Program: MANICMINER', this.app.platform.colorByName('black'), false, {leftMargin: 1});
    this.programNameEntity.hide = true;
    this.desktopEntity.addEntity(this.programNameEntity);

    this.copyrightLine1 = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8Mono, 6*8, 18*8, 20*8, 8, ' ©SOFTWARE PROJECTS ', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center'});
    this.copyrightLine1.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine1);
    this.copyrightLine2 = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8Mono, 6*8, 19*8, 20*8, 8, '  by Matthew Smith  ', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center'});
    this.copyrightLine2.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine2);

    this.signboardEntity = new SignboardEntity(this.desktopEntity, 2*8+4, 9*8, 27*8, 7*8, 'splashScreen');
    this.signboardEntity.hide = true;
    this.desktopEntity.addEntity(this.signboardEntity);

    this.sendEvent(0, {id: 'openAudioChannel', channel: 'sounds', options: {}});
    this.sendEvent(1000, {id: 'updateCommand'});

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});
  } // init

  shutdown() {
    this.app.audioManager.closeAllChannels();
  } // shutdown

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {id: 'changeFlashState'});
        return true;

      case 'updateCommand':
        this.inputLineEntity.options.align = 'left';
        this.inputLineEntity.fonts = this.app.fonts.zxFonts8x8Mono;
        this.inputLineEntity.options.animationMode = 'flashReverseColors';
        this.inputLineEntity.setText(this.command[this.commandPhase]);
        this.inputLineEntity.options.flashMask = '';
        if (this.command[this.commandPhase].length > 0) {
          this.inputLineEntity.options.flashMask = this.inputLineEntity.options.flashMask.padStart (this.command[this.commandPhase].length-1, ' ')+'#';
        }
        this.commandPhase++;
        this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'keyboardSound', options: false});
        if (this.commandPhase < this.command.length) {
          this.sendEvent(800, {id: 'updateCommand'});
        } else {
          this.inputLineEntity.hide = true;
          this.tapePhase = 0;
          this.sendEvent(1, {id: 'updateTape'});
        }
        return true;

      case 'updateTape':
        switch (this.tape[this.tapePhase].id) {
          case 'pilot':
            this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'tapePilotToneSound', options: {repeat: true}});
            this.sendEvent(0, {id: 'setBorderAnimation', value: 'pilotTone'});
            break;
          case 'data':
            if ('event' in this.tape[this.tapePhase] && this.tape[this.tapePhase].event == 'showSignboard') {
              this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'tapeScreenAttrSound', options: false});
            } else {
              this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'tapeRndDataSound', options: false});
            }
            this.sendEvent(0, {id: 'setBorderAnimation', 'value': 'dataTone'});
            break;
          case 'pause':
            this.sendEvent(0, {id: 'stopAudioChannel', channel: 'sounds'});
            this.sendEvent(0, {id: 'setBorderAnimation', value: false});
            break;
        }
        if ('event' in this.tape[this.tapePhase]) {
          this.sendEvent(0, {id: this.tape[this.tapePhase].event});
        }
        this.tapePhase++;
        if (this.tapePhase < this.tape.length) {
          this.sendEvent(this.tape[this.tapePhase-1].duration, {id: 'updateTape'});
        } else {
          this.sendEvent(this.tape[this.tapePhase-1].duration, {id: 'setMenuModel'});
        }
      return true;

      case 'setProgramName':
        this.programNameEntity.hide = false;
        return true;

      case 'printCopyright':
        this.programNameEntity.destroy();
        this.programNameEntity = null;
        this.copyrightLine1.hide = false;
        this.copyrightLine2.hide = false;
        this.desktopEntity.bkColor = this.app.platform.colorByName('black');
        this.borderEntity.bkColor = this.app.platform.colorByName('black');
        this.inputLineEntity.setPenColor(this.app.platform.colorByName('white'));
        this.tapeBreakLine = '10:7';
        return true;

      case 'showSignboard':
        this.signboardEntity.hide = false;
        this.signboardEntity.loadTimer = this.app.now;
        return true;

      case 'beginLoadCode':
        this.tapeBreakLine = '10:8';
        return true;

      case 'scrollScreen':
        this.copyrightLine1.y -= 8;
        this.copyrightLine2.y -= 8;
        this.signboardEntity.y -= 8;
        return true;

      case 'setMenuModel':
        this.app.setModel('MenuModel');
        return true;

      case 'keyPress':
        switch (event.key) {
          case 'Escape':
          case 'GamepadExit':
            this.app.setModel('MenuModel');
            return true;
          case ' ':
          case 'GamepadOK':
            if (this.break()) {
              return true;
            }
            break;
          case 'Mouse1':
          case 'Mouse2':
          case 'Mouse4':
            this.app.inputEventsManager.keysMap[event.key] = this;
            return true;
          case 'Touch':
            this.app.inputEventsManager.touchesMap[event.identifier] = this;
            return true;
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
          case 'Mouse2':
          case 'Mouse4':
            if (this.app.inputEventsManager.keysMap[event.key] === this && this.break()) {
              return true;
            }
            return true;
          case 'Touch':
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this && this.break()) {
              return true;
            }
            return true;
        }
        break;

      case 'errorAudioChannel':
        this.app.showErrorMessage(event.error, 'reopen');
        return true;
    }

    return false;
  } // handleEvent

  break() {
    if (this.tapeBreak) {
      this.app.setModel('MenuModel');
      return true;
    }

    if (this.tapePhase !== false) {
      this.cancelEvent('updateTape');
      this.cancelEvent('setMenuModel');
      this.sendEvent(0, {id: 'stopAudioChannel', channel: 'sounds'});
      this.tapeBreak = true;
      this.signboardEntity.breakTimer = this.app.now;
      this.inputLineEntity.setText('D BREAK - CONT repeats, '+this.tapeBreakLine);
      this.inputLineEntity.hide = false;
      this.sendEvent(0, {id: 'setBorderAnimation', value: false});
      this.sendEvent(5000, {id: 'setMenuModel'});
      return true;
    }
    return false;
  } // break

  loopModel(timestamp) {
    super.loopModel(timestamp);

    this.drawModel();
  } // loopModel

} // TapeLoadingModel

export default TapeLoadingModel;
