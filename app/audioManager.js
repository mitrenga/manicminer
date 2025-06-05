/**/
const { AbstractAudioManager } = await import('./svision/js/abstractAudioManager.js?ver='+window.srcVersion);
const { AudioWorkletHandler } = await import('./svision/js/audioWorkletHandler.js?ver='+window.srcVersion);
const { AudioScriptProcessorHandler } = await import('./svision/js/audioScriptProcessorHandler.js?ver='+window.srcVersion);
/*/
import AbstractAudioManager from './svision/js/abstractAudioManager.js';
import AudioWorkletHandler from './svision/js/audioWorkletHandler.js';
import AudioScriptProcessorHandler from './svision/js/audioScriptProcessorHandler.js';
/**/
// begin code

export class AudioManager extends AbstractAudioManager {
  
  constructor(app) {
    super(app);
    this.id = 'AudioManager';
    this.sounds = Number(this.app.getCookie('audioChannelSounds', 0.3));
    this.music = Number(this.app.getCookie('audioChannelMusic', 0.3));
  } // constructor

  createAudioHandler(channel) {
    var audioHandler = false;

    if (this.unsupportedAudioChannel == false) {
      this.unsupportedAudioChannel = this.app.getCookie('unsupportedAudioChannel', false);
    }

    switch (this.unsupportedAudioChannel) {
      case false:
        audioHandler = new AudioWorkletHandler(this.app);
        break;
      case 'AudioWorkletHandler':
        this.app.setCookie('unsupportedAudioChannel', 'AudioWorkletHandler');
        audioHandler = new AudioScriptProcessorHandler(this.app);
        break;
      case 'AudioScriptProcessorHandler':
        this.app.setCookie('unsupportedAudioChannel', 'AudioScriptProcessorHandler');
        break;
    }

    return audioHandler;
  } // createAudioHandler

  audioData(channel, sound, options) {
    var sampleRate = this.channels[channel].ctx.sampleRate;
    switch (sound) {
      case 'tapePilotTone': return this.tapePilotToneData(sampleRate);
      case 'tapeRandomToneData': return this.tapeRandomToneData(sampleRate);
      case 'tapeScreenAttrToneData': return this.tapeScreenAttrToneData(sampleRate);
      case 'pressKeyboardData': return this.pressKeyboardData(sampleRate);
    }
    return false;
  } // audioData

  tapePilotToneData(sampleRate) {
    // T-state is 1/3500000 = 0.0000002867 sec. 
    // leader pulse is 2168 T-states long and is repeated 8063 times for header blocks and 3223 times for data blocks
    var pulse = Math.round(sampleRate*2168/3500000);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // tapePilotToneData

  tapeRandomToneData(sampleRate) {
    // two sync pulses of 667 and 735 T-states
    var f667 = Math.round(sampleRate*667/3500000);
    var f735 = Math.round(sampleRate*735/3500000);
    // data is encoded as two 855 T-state pulses for binary zero, and two 1,710 T-state pulses for binary one
    var f885 = Math.round(sampleRate*855/3500000);
    var f1710 = Math.round(sampleRate*1710/3500000);

    var fragments = [f667, f735, f885, f1710];
    var pulses = [0, 0, 1, 1];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds, 'randomPulses': {'fragments': [2, 3], 'count': 2}};
  } // tapeRandomToneData

  tapeScreenAttrToneData(sampleRate) {
    var screenAttr =
      '00C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0'+ 
      'C0C0D0C0C0C0D0C0C3C3C3C0C0C0E0C0C0C0E6C6C6C6C6C0C0C0C0C0C0C0C0C0'+ 
      'C0C0D0D0C0D0D0C0C0F3F0F0C2C0E0E0C2C0E6C0C0C0C0C0C0D8D8D8C0C0C0C0'+ 
      'C0C0D5C0D0C0D5C0F0C3C0C0F2C2E0C0E2C0E6C6EEEEEEC0DCC4C4C4D8C0C0C0'+ 
      'C0C0D5C5C0C5D5C0F0C3C0C0F2C0E2C0C2E0E6C0C0E8C0C0DCC0C0C0C4C0C0C0'+ 
      'C0C0D5C0C5C0D5C0F3F3F3F0F2C0E0C2C2C0E6C6C6EEC6C0DCC4C4C4D8C0C0C0'+ 
      'C0C0C5C0C0C0C5C0F0C0C0C0F2C0C0C0C2C0C0C0C0E8C0C0C4D8DCD8C0C0C0C0'+ 
      'C0C0C5C0C0C0C5C0C0C0C0C0C0C0C0C0C0C0C0C0E8E8E8C0C4C0C0C4C4C0C0C0';

    // two sync pulses of 667 and 735 T-states
    var f667 = Math.round(sampleRate*667/3500000);
    var f735 = Math.round(sampleRate*735/3500000);
    // data is encoded as two 855 T-state pulses for binary zero, and two 1,710 T-state pulses for binary one
    var f885 = Math.round(sampleRate*855/3500000);
    var f1710 = Math.round(sampleRate*1710/3500000);

    var fragments = [f667, f735, f885, f1710];
    var pulses = [];

    // two sync pulses
    pulses.push(0);
    pulses.push(0);
    pulses.push(1);
    pulses.push(1);

    // data
    for (var x = 0; x < screenAttr.length/2; x++) {
      var binByte = this.app.hexToBin(screenAttr.substring(x*2, x*2+2));
      for (var b = 0; b < binByte.length; b++) {
        var f = 2;
        if (binByte[b] == '1') {
          f = 3;
        }
        pulses.push(f);
        pulses.push(f);
      }
    }

    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // tapeScreenAttrToneData

  pressKeyboardData(sampleRate) {
    var pulse = Math.round(15*sampleRate/44100);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // pressKeyboardData

} // class AudioManager

export default AudioManager;
