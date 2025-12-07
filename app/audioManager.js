/**/
const { AbstractAudioManager } = await import('./svision/js/abstractAudioManager.js?ver='+window.srcVersion);
const { AudioWorkletHandler } = await import('./svision/js/audioWorkletHandler.js?ver='+window.srcVersion);
const { AudioScriptProcessorHandler } = await import('./svision/js/audioScriptProcessorHandler.js?ver='+window.srcVersion);
const { AudioDisableHandler } = await import('./svision/js/audioDisableHandler.js?ver='+window.srcVersion);
/*/
import AbstractAudioManager from './svision/js/abstractAudioManager.js';
import AudioWorkletHandler from './svision/js/audioWorkletHandler.js';
import AudioScriptProcessorHandler from './svision/js/audioScriptProcessorHandler.js';
import AudioDisableHandler from './svision/js/audioDisableHandler.js';
/**/
// begin code

export class AudioManager extends AbstractAudioManager {
  
  constructor(app) {
    super(app);
    this.id = 'AudioManager';
    this.volume = {};
    this.volume.sounds = Math.min(10, Math.max(0, Math.round(Number(this.app.readCookie('audioChannelSounds', 5)))));
    this.volume.music = Math.min(10, Math.max(0, Math.round(Number(this.app.readCookie('audioChannelMusic', 2)))));
  } // constructor

  createAudioHandler(channel, options) {
    var audioHandler = false;

    var volume = 0.0;
    switch (channel) {
      case 'music':
        volume = this.volumeLevel(this.volume.music);
        break;
      case 'sounds':
      case 'extra':
        volume = this.volumeLevel(this.volume.sounds);
        break;
    }

    if ((!('audioDisableHandler' in options) || options.audioDisableHandler != 'disable') && volume == 0.0) {
      return new AudioDisableHandler(this.app);
    }

    if (this.unsupportedAudioChannel === false) {
      this.unsupportedAudioChannel = this.app.readCookie('unsupportedAudioChannel', false);
    }

    switch (this.unsupportedAudioChannel) {
      case false:
        audioHandler = new AudioWorkletHandler(this.app);
        break;
      case 'AudioWorkletHandler':
        this.app.writeCookie('unsupportedAudioChannel', 'AudioWorkletHandler');
        audioHandler = new AudioScriptProcessorHandler(this.app);
        break;
      case 'AudioScriptProcessorHandler':
        this.app.writeCookie('unsupportedAudioChannel', 'AudioScriptProcessorHandler');
        break;
    }

    return audioHandler;
  } // createAudioHandler

  audioData(channel, sound, options) {
    var data = super.audioData(channel, sound, options);
    if (data !== false) {
      return data;
    }

    var sampleRate = this.channels[channel].getSampleRate();
    switch (sound) {
      case 'titleScreenMelody': return this.titleScreenMelody(sampleRate);
      case 'inGameMelody': return this.inGameMelody(sampleRate, options.caveNumber, options.demo, false);
      case 'exampleInGameMelody': return this.inGameMelody(sampleRate, 0, options.demo, true);
      case 'jumpSound': return this.jumpSound(sampleRate, false);
      case 'exampleJumpSound': return this.jumpSound(sampleRate, true);
      case 'fallingSound': return this.fallingSound(sampleRate);
      case 'crashSound': return this.crashSound(sampleRate);
      case 'itemSound': return this.itemSound(sampleRate);
      case 'fallingKongSound': return this.fallingKongSound(sampleRate);
      case 'escapeSound': return this.escapeSound(sampleRate);
      case 'airSupplySound': return this.airSupplySound(sampleRate, options.remainingAirSupply);
      case 'gameOverSound': return this.gameOverSound(sampleRate);
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
    if (!(pulse in fKeys)) {
      fKeys[pulse] = fragments.length;
      fragments.push(pulse);
    }
    pulses[pulsesCounter] = fKeys[pulse];
    return newPos;
  } // addPulse

  volumeLevel(volume) { 
    var levels = [0, 0.005, 0.01, 0.02, 0.04, 0.07, 0.1, 0.14, 0.18, 0.23, 0.29];
    return levels[volume];
  } // volumeLevel

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
      events[pulsesCounter] = {id: 'pianoKey', k1: d, k2: e};      
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
    events[pulsesCounter] = {id: 'melodyEnd'};
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.music), events: events};
  } // titleScreenMelody

  inGameMelody(sampleRate, caveNumber, demo, example) {
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
      if (example) {
        data = inGameTuneData.slice(0, 32); 
      } else {
        data = inGameTuneData;
      }   
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
      events[pulsesCounter] = {id: 'animationDemoCaveDone'};
    }
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.music), events: events};
  } // inGameMelody

  jumpSound(sampleRate, example) {
    var fragments = [];
    var pulses = new Uint8Array(30*18+18+33*27);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/658)/100;
    fragments.push(Math.round(sampleRate/12.6));
    
    for (var x = 0; x < 18; x++) {
      var d = Math.round(2*(1+Math.abs(7-x))*k);
      fragments.push(d);
      for (var o = 0; o < 29; o++) {
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fragments.length-1;
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    if (!example) {
      k = Math.round(sampleRate/441)/100;
      
      var p = 4;
      for (var x = 0; x < 27; x++) {
        var d = Math.round(7+2.2*p*k);
        p++;
        if (p == 16) {
          p = 0;
        }
        fragments.push(d);
        for (var o = 0; o < 31; o++) {
          if (pulsesCounter == pulses.length) {
            pulses = this.extendArray(pulses, 100);
          }
          pulses[pulsesCounter] = fragments.length-1;
          pulsesCounter++;
        }
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = 0;
        pulsesCounter++;
      }
    }

    pulses = this.resizeArray(pulses, pulsesCounter);

    if (example) {
      return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
    }

    this.audioDataCache.sounds.jumpSound = {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
    return this.audioDataCache.sounds.jumpSound;
  } // jumpSound

  fallingSound(sampleRate) {
    var fragments = [];
    var pulses = new Uint8Array(32*27);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/441)/100;
    fragments.push(Math.round(sampleRate/12.6));
    
    var p = 0;
    for (var x = 0; x < 27; x++) {
      var d = Math.round(7+2.2*p*k);
      p++;
      if (p == 16) {
        p = 0;
      }
      fragments.push(d);
      for (var o = 0; o < 31; o++) {
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fragments.length-1;
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    this.audioDataCache.sounds.fallingSound = {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
    return this.audioDataCache.sounds.fallingSound;
  } // fallingSound

  crashSound(sampleRate) {
    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array(8*(116+4+1));
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/2600)/100;
    fragments.push(Math.round(sampleRate/220));

    var value1 = 116;
    var value2 = 8;
    var frames = 0;
    for (var x = 0; x < 8; x++) {
      for (var o = 0; o < value1; o++) {
        for (var y = 0; y < 2; y++) {
          var d = Math.round((frames+value2)*k)-Math.round(frames*k);
          frames += value2;
          if (!(d in fKeys)) {
            fragments.push(d);
            fKeys[d] = fragments.length-1;
          }
          if (pulsesCounter == pulses.length) {
            pulses = this.extendArray(pulses, 100);
          }
          pulses[pulsesCounter] = fKeys[d];
          pulsesCounter++;
        }
      }

      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;

      value1 -= 16;
      value2 += 8;
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
  } // crashSound

  itemSound(sampleRate) {
    var fragments = [];
    var pulses = new Uint8Array(64);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/2400)/100;

    var c = 128;
    do {
      var b = 144-c;
      var p = Math.round(b*k)
      fragments.push(p);
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 10);
      }
      pulses[pulsesCounter] = fragments.length-1;
      pulsesCounter++;
      c = c-2;
    } while (c > 0);

    pulses = this.resizeArray(pulses, pulsesCounter);
    this.audioDataCache.extra.itemSound = {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
    return this.audioDataCache.extra.itemSound;
  } // itemSound

  fallingKongSound(sampleRate) {
    var fragments = [];
    var pulses = new Uint8Array(15*25);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/441)/100;
    fragments.push(Math.round(sampleRate/11.7));
    
    for (var x = 0; x < 25; x++) {
      var d = Math.round((x+2)*k);
      fragments.push(d);
      for (var o = 0; o < 15; o++) {
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fragments.length-1;
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
  } // fallingKongSound

  escapeSound(sampleRate) {
    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array(50*256);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/2800)/100;
    
    var d = 50;
    do {
      var c = 256;
      do {
        var b = Math.round((c+3*d)%256*k);
        if (!(b in fKeys)) {
          fragments.push(b);
          fKeys[b] = fragments.length-1;
        }
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 1000);
        }
        pulses[pulsesCounter] = fKeys[b];
        pulsesCounter++;
        c--;
      } while (c > 0)
      c = 256;
      d--;
    } while (d > 0)

    var events = {};
    events[pulsesCounter] = {id: 'animationCaveDone'};

    pulses = this.resizeArray(pulses, pulsesCounter);
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds), events: events};
  } // escapeSound

  airSupplySound(sampleRate, remainingAirSupply) {
    var snapshots = 0;
    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array((remainingAirSupply-35)*63*4*2);
    var pulsesCounter = 0;
    
    var k = sampleRate/282240;
    var frames = 0;
    var prevPtr = 0;

    for (var x = remainingAirSupply; x > 35; x--) { // 63 .. 36 air supply
      for (var p = 63; p > 0; p--) {
        var d = 0;
        for (var c = 0; c < 4; c++) {
          d = 2*(63-x);
          for (var y = 0; y < d; y++) {
            frames++;
          }
          var newPtr = Math.round(frames*k);
          var pulse = newPtr-prevPtr;
          prevPtr = newPtr;
          if (!(pulse in fKeys)) {
            fragments.push(pulse);
            fKeys[pulse] = fragments.length-1;
          }
          pulses[pulsesCounter] = fKeys[pulse];
          snapshots += pulse;
          pulsesCounter++;
          if (pulsesCounter == pulses.length) {
            pulses = this.extendArray(pulses, 100);
          }
          for (var y = 0; y < d; y++) {
            frames++;
          }
          if (c == 3) {
            var rnd = Math.round(Math.random()*20);
            for (var y = 0; y < 230+rnd; y++) {
              frames++;
            }
          }
          newPtr = Math.round(frames*k);
          pulse = newPtr-prevPtr;
          prevPtr = newPtr;
          if (!(pulse in fKeys)) {
            fragments.push(pulse);
            fKeys[pulse] = fragments.length-1;
          }
          pulses[pulsesCounter] = fKeys[pulse];
          snapshots += pulse;
          pulsesCounter++;
          if (pulsesCounter == pulses.length) {
            pulses = this.extendArray(pulses, 100);
          }
        }
      }
    }

    pulses = this.resizeArray(pulses, pulsesCounter);

    var events = {};
    events[0] = {id: 'durationAirSupplySound', value: Math.ceil(snapshots/sampleRate*1000)};

    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds), events: events};
  } // airSupplySound

  gameOverSound(sampleRate) {
    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array((255-59)/4*64);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/2800)/100;
    fragments.push(Math.round(sampleRate/212));

    for (var x = 255; x > 59; x=x-4) {
      for (var o = 0; o < 63; o++) {
        var d = Math.round(x*k);
        if (!(d in fKeys)) {
          fragments.push(d);
          fKeys[d] = fragments.length-1;
        }
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fKeys[d];
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
  } // gameOverSound

  tapePilotToneSound(sampleRate) {
    // T-state is 1/3500000 = 0.0000002867 sec. 
    // leader pulse is 2168 T-states long and is repeated 8063 times for header blocks and 3223 times for data blocks
    var pulse = Math.ceil(sampleRate*2168/3500000);
    var fragments = [pulse];
    var pulses = [0];
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
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
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds), infinityRndPulses: {fragments: [2, 3], quantity: 2}};
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

    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
  } // tapeScreenAttrSound

  keyboardSound(sampleRate) {
    var pulse = Math.ceil(15*sampleRate/44100);
    var fragments = [pulse];
    var pulses = [0];
    return {fragments: fragments, pulses: pulses, volume: this.volumeLevel(this.volume.sounds)};
  } // keyboardSound

} // AudioManager

export default AudioManager;
