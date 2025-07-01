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
    this.sounds = Number(this.app.getCookie('audioChannelSounds', 0.2));
    this.music = Number(this.app.getCookie('audioChannelMusic', 0.2));
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
      case 'titleScreenMelody': return this.titleScreenMelody(sampleRate);
      case 'inGameMelody': return this.inGameMelody(sampleRate, options.caveNumber, options.demo);
      case 'tapePilotToneSound': return this.tapePilotToneSound(sampleRate);
      case 'tapeRndDataSound': return this.tapeRndDataSound(sampleRate);
      case 'tapeScreenAttrSound': return this.tapeScreenAttrSound(sampleRate);
      case 'keyboardSound': return this.keyboardSound(sampleRate);
    }
    return false;
  } // audioData

  extendArray(array, addition) {
    var newArray = new Uint8Array(array.length+addition);
    newArray.set(array, 0);
    return newArray;
  } // extendArray

  resizeArray(array, length) {
    var newArray = new Uint8Array(length);
    newArray.set(array.slice(0, length), 0);
    return newArray;
  } // resizeArray

  addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter) {
    var newPos = Math.round(frame*k);
    var pulse = newPos-lastPos;
    if (!(pulse in (fKeys))) {
      fKeys[pulse] = fragments.length;
      fragments.push(pulse);
    }
    pulses[pulsesCounter] = fKeys[pulse];
    return newPos;
  } // addPulse

  titleScreenMelody(sampleRate) {
    var titleScreenTuneData = [
      [0x50,0x80,0x81],[0x50,0x66,0x67],[0x50,0x56,0x57],[0x32,0x56,0x57],[0x32,0xAB,0xCB],[0x32,0x2B,0x33],[0x32,0x2B,0x33],[0x32,0xAB,0xCB],[0x32,0x33,0x40],[0x32,0x33,0x40],
      [0x32,0xAB,0xCB],[0x32,0x80,0x81],[0x32,0x80,0x81],[0x32,0x66,0x67],[0x32,0x56,0x57],[0x32,0x60,0x56],[0x32,0xAB,0xC0],[0x32,0x2B,0x30],[0x32,0x2B,0x30],[0x32,0xAB,0xC0],
      [0x32,0x30,0x44],[0x32,0x30,0x44],[0x32,0xAB,0xC0],[0x32,0x88,0x89],[0x32,0x88,0x89],[0x32,0x72,0x73],[0x32,0x4C,0x4D],[0x32,0x4C,0x4D],[0x32,0xAB,0xC0],[0x32,0x26,0x30],
      [0x32,0x26,0x30],[0x32,0xAB,0xC0],[0x32,0x30,0x44],[0x32,0x30,0x44],[0x32,0xAB,0xC0],[0x32,0x88,0x89],[0x32,0x88,0x89],[0x32,0x72,0x73],[0x32,0x4C,0x4D],[0x32,0x4C,0x4D],
      [0x32,0xAB,0xCB],[0x32,0x26,0x33],[0x32,0x26,0x33],[0x32,0xAB,0xCB],[0x32,0x33,0x40],[0x32,0x33,0x40],[0x32,0xAB,0xCB],[0x32,0x80,0x81],[0x32,0x80,0x81],[0x32,0x66,0x67],
      [0x32,0x56,0x57],[0x32,0x40,0x41],[0x32,0x80,0xAB],[0x32,0x20,0x2B],[0x32,0x20,0x2B],[0x32,0x80,0xAB],[0x32,0x2B,0x33],[0x32,0x2B,0x33],[0x32,0x80,0xAB],[0x32,0x80,0x81],
      [0x32,0x80,0x81],[0x32,0x66,0x67],[0x32,0x56,0x57],[0x32,0x40,0x41],[0x32,0x80,0x98],[0x32,0x20,0x26],[0x32,0x20,0x26],[0x32,0x80,0x98],[0x32,0x26,0x30],[0x32,0x26,0x30],
      [0x32,0x00,0x00],[0x32,0x72,0x73],[0x32,0x72,0x73],[0x32,0x60,0x61],[0x32,0x4C,0x4D],[0x32,0x4C,0x99],[0x32,0x4C,0x4D],[0x32,0x4C,0x4D],[0x32,0x4C,0x99],[0x32,0x5B,0x5C],
      [0x32,0x56,0x57],[0x32,0x33,0xCD],[0x32,0x33,0x34],[0x32,0x33,0x34],[0x32,0x33,0xCD],[0x32,0x40,0x41],[0x32,0x66,0x67],[0x64,0x66,0x67],[0x32,0x72,0x73],[0x64,0x4C,0x4D],
      [0x32,0x56,0x57],[0x32,0x80,0xCB],[0x19,0x80,0x00],[0x19,0x80,0x81],[0x32,0x80,0xCB]
    ];

    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array(32000);
    var pulsesCounter = 0;
    var events = {};

    var k = Math.round(sampleRate/630)/100;
    var frame = 0;
    var lastPos = -1;
    var a = 0;

    for (var t = 0; t < titleScreenTuneData.length; t++) {
      var tone = titleScreenTuneData[t];
      var c = tone[0]*260;
      var d = tone[1];
      var e = tone[2];
      events[pulsesCounter] = {'id': 'pianoKey', 'k1': d, 'k2': e};      
      a = 1-a;
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 5000);
      }
      lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
      pulsesCounter++;

      do {
        d--;
        if (d == 0) {
          d = tone[1];
          if (pulsesCounter == pulses.length) {
            pulses = this.extendArray(pulses, 5000);
          }
          lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
          pulsesCounter++;
          a = 1-a;
        }
        e--;
        if (e == 0) {
          e = tone[2];
          if (pulsesCounter == pulses.length) {
            pulses = this.extendArray(pulses, 5000);
          }
          lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
          pulsesCounter++
          a = 1-a;
        }
        c--;
        frame++;
      } while (c > 0)
    }
    pulses = this.resizeArray(pulses, pulsesCounter);
    events[pulsesCounter] = {'id': 'melodyEnd'};
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.music, 'events': events};
  } // titleScreenMelody

  inGameMelody(sampleRate, caveNumber, demo) {
    var inGameTuneData = [
      0x80,0x72,0x66,0x60,0x56,0x66,0x56,0x56,0x51,0x60,0x51,0x51,0x56,0x66,0x56,0x56,0x80,0x72,0x66,0x60,0x56,0x66,0x56,0x56,0x51,0x60,0x51,0x51,0x56,0x56,0x56,0x56,
      0x80,0x72,0x66,0x60,0x56,0x66,0x56,0x56,0x51,0x60,0x51,0x51,0x56,0x66,0x56,0x56,0x80,0x72,0x66,0x60,0x56,0x66,0x56,0x40,0x56,0x66,0x80,0x66,0x56,0x56,0x56,0x56
    ];

    var data = [];
    if (demo) {
      if (caveNumber%2 == 0) {
        data = inGameTuneData.slice(0, inGameTuneData.length/2-1); 
      } else {
        data = inGameTuneData.slice(inGameTuneData.length/2); 
      }
    } else {
      data = inGameTuneData;
    }

    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array(1500);
    var pulsesCounter = 0;
    var events = {};

    var k = Math.round(sampleRate/787)/100;
    var frame = 0;
    var lastPos = -1;

    var m = 0;
    for (var r = 0; r < 2; r++) {
      for (var t = 0; t < data.length; t++) {
        m++;
        var n = (m&126)>>1;
        var e = data[n];
        var b = 256;
        var c = 3;
        do {
          do {
            e--;
            if (e == 0) {
              e = data[n];
              if (pulsesCounter == pulses.length) {
                pulses = this.extendArray(pulses, 500);
              }
              lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
              pulsesCounter++;
            }
            b--;
            frame++;
          } while (b > 0)
          b = 256;
          c--;
        } while (c > 0)
        frame = frame+6700;
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 500);
        }
        lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
        pulsesCounter++;
      }
    }
    pulses = this.resizeArray(pulses, pulsesCounter);
    if (demo) {
      events[pulsesCounter] = {'id': 'newDemoCave'};
    }
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.music, 'events': events};
  } // inGameMelody

  tapePilotToneSound(sampleRate) {
    // T-state is 1/3500000 = 0.0000002867 sec. 
    // leader pulse is 2168 T-states long and is repeated 8063 times for header blocks and 3223 times for data blocks
    var pulse = Math.ceil(sampleRate*2168/3500000);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // tapePilotToneSound

  tapeRndDataSound(sampleRate) {
    // two sync pulses of 667 and 735 T-states
    var f667 = Math.ceil(sampleRate*667/3500000);
    var f735 = Math.ceil(sampleRate*735/3500000);
    // data is encoded as two 855 T-state pulses for binary zero, and two 1710 T-state pulses for binary one
    var f885 = Math.ceil(sampleRate*855/3500000);
    var f1710 = Math.ceil(sampleRate*1710/3500000);

    var fragments = [f667, f735, f885, f1710];
    var pulses = [0, 0, 1, 1];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds, 'infinityRndPulses': {'fragments': [2, 3], 'quantity': 2}};
  } // tapeRndDataSound

  tapeScreenAttrSound(sampleRate) {
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
    var f667 = Math.ceil(sampleRate*667/3500000);
    var f735 = Math.ceil(sampleRate*735/3500000);
    // data is encoded as two 855 T-state pulses for binary zero, and two 1,710 T-state pulses for binary one
    var f885 = Math.ceil(sampleRate*855/3500000);
    var f1710 = Math.ceil(sampleRate*1710/3500000);

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
  } // tapeScreenAttrSound

  keyboardSound(sampleRate) {
    var pulse = Math.ceil(15*sampleRate/44100);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // keyboardSound

} // class AudioManager

export default AudioManager;
