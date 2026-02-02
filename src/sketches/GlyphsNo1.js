import p5 from "p5";
import '@/lib/p5.audioReact.js';
import initCapture from '@/lib/p5.capture.js';
import LABCATGlyph3D from './classes/LABCATGlyph3D.js';

const base = import.meta.env.BASE_URL || './';
const audio = base + 'audio/GlyphsNo1.mp3';
const midi = base + 'audio/GlyphsNo1.mid';

const sketch = (p) => {
  /**
   * Core audio properties
   */
  p.song = null;
  p.audioSampleRate = 0;
  p.totalAnimationFrames = 0;
  p.PPQ = 3840 * 4;
  p.bpm = 96;
  p.audioLoaded = false;
  p.songHasFinished = false;

  p.preload = () => {
    p.loadSong(audio, midi, (result) => {
      console.log(result);

      const track1 = result.tracks[3].notes;
      const track2 = result.tracks[6].notes;
      p.scheduleCueSet(track1, 'executeTrack1');
      p.scheduleCueSet(track2, 'executeTrack2');
      p.hideLoader();
    });
  };

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    p.frameRate(60);
    p.canvas.style.position = 'relative';
    p.canvas.style.zIndex = '1';
    initCapture(p, { prefix: 'GlyphsNo1', enabled: false, captureCSSBackground: false });

    p.colorMode(p.HSB, 360, 100, 100, 1);

    p.colourSet = p.generateColorSet();
    p.currentCanvasBg = null;
    p.setCanvasBgFromSet();

    const glyphSize = Math.min(p.width, p.height) * 0.3;
    p.glyph = new LABCATGlyph3D(p, 0, 0, 0, glyphSize, false, false);

    p.cam = p.createCamera();
    p.cam.setPosition(0, 0, p.height / 2);

    p.cameraOverride = false;
    p.blackFade = { active: false, startTime: 0, duration: 0 };
  };

  p.draw = () => {
    p.clear();

    if (p.cameraOverride) {
      p.cam.setPosition(p.cameraX, p.cameraY, p.cameraZ);
      p.cam.lookAt(0, 0, 0);
    } else {
      p.orbitControl();
    }

    if (p.blackFade.active) {
      const elapsed = p.song.currentTime() * 1000 - p.blackFade.startTime;
      const progress = p.constrain(elapsed / p.blackFade.duration, 0, 1);
      const opacity = 1 - progress;
      
      p.colorMode(p.RGB, 255);
      p.background(0, opacity * 255);
      p.colorMode(p.HSB, 360, 100, 100, 1);

      if (progress >= 1) {
        p.blackFade.active = false;
      }
    }

    if (p.glyph.animateZ) {
      const elapsed = p.song.currentTime() * 1000 - p.glyph.animateZStart;
      const progress = p.constrain(elapsed / p.glyph.animateZDuration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      p.glyph.z = p.lerp(p.glyph.animateZFrom, p.glyph.animateZTo, eased);

      if (progress >= 1) {
        p.glyph.animateZ = false;
        p.glyph.z = p.glyph.animateZTo;
      }
    }

    if (p.glyph) {
      p.glyph.update();
      p.glyph.draw();
    }
  };

  p.executeTrack1 = (note) => {
    const { currentCue, durationTicks } = note;
    const duration = (durationTicks / p.PPQ) * (60 / p.bpm);

    console.log(currentCue, duration);


    // Camera position logic
    const resetCues = [1, 2, 3, 4, 25, 26, 27, 28, 49];

    if (resetCues.includes(currentCue) || duration < 0.4) {
      // Reset to default position
      p.cameraX = 0;
      p.cameraY = 0;
      p.cameraZ = p.height / 2;
      p.cameraOverride = true;
    } else {
      // Change camera position for all other cues
      const cueIndex = currentCue % 6;

      const baseZ = p.map(p.width, 375, 1920, 1000, 500, true);

      const x = (cueIndex % 2 === 0 ? -1 : 1) * (350 + cueIndex * 50);
      const y = -30 + cueIndex * 20;
      const z = baseZ + cueIndex * 30;

      p.cameraX = x;
      p.cameraY = y;
      p.cameraZ = z;
      p.cameraOverride = true;
    }

    if (currentCue === 5) {
      const twoBarsDuration = (8 * 60 / p.bpm) * 1000;
      p.blackFade.active = true;
      p.blackFade.startTime = p.song.currentTime() * 1000;
      p.blackFade.duration = twoBarsDuration;
      p.setComplexCanvasBg();
    }

    p.setCanvasBgFromSet();

    p.glyph.nextColour();

    const startZ = -p.height * 8;
    const endZ = p.height / 8;

    p.glyph.z = startZ;
    p.glyph.animateZ = true;
    p.glyph.animateZStart = p.song.currentTime() * 1000;
    p.glyph.animateZDuration = duration * 1000;
    p.glyph.animateZFrom = startZ;
    p.glyph.animateZTo = endZ;
  };

  p.canvasPatterns = [
    'linear-gradient(135deg, rgba(103, 103, 103, 0.06) 0%, rgba(103, 103, 103, 0.06) 50%, rgba(117, 117, 117, 0.06) 50%, rgba(117, 117, 117, 0.06) 100%), linear-gradient(135deg, rgba(49, 49, 49, 0.06) 0%, rgba(49, 49, 49, 0.06) 50%, rgba(228, 228, 228, 0.06) 50%, rgba(228, 228, 228, 0.06) 100%), linear-gradient(90deg, var(--canvas-bg), var(--canvas-bg))',
    'linear-gradient(128deg, rgba(10, 10, 10, 0.06) 0%, rgba(10, 10, 10, 0.06) 50%, rgba(193, 193, 193, 0.06) 50%, rgba(193, 193, 193, 0.06) 100%), linear-gradient(51deg, rgba(231, 231, 231, 0.06) 0%, rgba(231, 231, 231, 0.06) 50%, rgba(39, 39, 39, 0.06) 50%, rgba(39, 39, 39, 0.06) 100%), linear-gradient(90deg, var(--canvas-bg), var(--canvas-bg))',
    'linear-gradient(45deg, rgba(80, 80, 80, 0.08) 0%, rgba(80, 80, 80, 0.08) 50%, rgba(180, 180, 180, 0.08) 50%, rgba(180, 180, 180, 0.08) 100%), linear-gradient(90deg, rgba(120, 120, 120, 0.05) 0%, rgba(120, 120, 120, 0.05) 50%, rgba(200, 200, 200, 0.05) 50%, rgba(200, 200, 200, 0.05) 100%), linear-gradient(90deg, var(--canvas-bg), var(--canvas-bg))',
    'linear-gradient(0deg, rgba(60, 60, 60, 0.07) 0%, rgba(60, 60, 60, 0.07) 25%, rgba(160, 160, 160, 0.07) 25%, rgba(160, 160, 160, 0.07) 50%, rgba(60, 60, 60, 0.07) 50%, rgba(60, 60, 60, 0.07) 75%, rgba(160, 160, 160, 0.07) 75%, rgba(160, 160, 160, 0.07) 100%), linear-gradient(90deg, var(--canvas-bg), var(--canvas-bg))',
    'linear-gradient(90deg, rgba(100, 100, 100, 0.06) 0%, rgba(100, 100, 100, 0.06) 50%, rgba(150, 150, 150, 0.06) 50%, rgba(150, 150, 150, 0.06) 100%), linear-gradient(0deg, rgba(70, 70, 70, 0.06) 0%, rgba(70, 70, 70, 0.06) 50%, rgba(170, 170, 170, 0.06) 50%, rgba(170, 170, 170, 0.06) 100%), linear-gradient(90deg, var(--canvas-bg), var(--canvas-bg))',
    'repeating-linear-gradient(0deg, transparent 0px, transparent 25px, hsla(332,66%,49%,0.1) 25px, hsla(332,66%,49%,0.1) 27px, transparent 27px, transparent 51px), repeating-linear-gradient(90deg, transparent 0px, transparent 25px, hsla(332,66%,49%,0.1) 25px, hsla(332,66%,49%,0.1) 27px, transparent 27px, transparent 51px), repeating-linear-gradient(90deg, transparent 0px, transparent 50px, hsla(193,5%,69%,0.1) 50px, hsla(193,5%,69%,0.1) 52px, transparent 52px, transparent 102px), repeating-linear-gradient(0deg, transparent 0px, transparent 50px, hsla(193,5%,69%,0.1) 50px, hsla(193,5%,69%,0.1) 52px, transparent 52px, transparent 102px), repeating-linear-gradient(0deg, hsla(26,76%,62%,0.1) 0px, hsla(26,76%,62%,0.1) 2px, transparent 2px, transparent 102px), repeating-linear-gradient(90deg, hsla(26,76%,62%,0.1) 0px, hsla(26,76%,62%,0.1) 2px, transparent 2px, transparent 102px), linear-gradient(90deg, var(--canvas-bg), var(--canvas-bg))'
  ];

  p.executeTrack2 = (note) => {
    const choices = p.canvasPatterns.filter((pat) => pat !== p.currentCanvasPattern);
    const pattern = p.random(choices);
    p.currentCanvasPattern = pattern;
    document.documentElement.style.setProperty('--canvas-pattern', pattern);
  };

  p.setComplexCanvasBg = () => {
    const bg = 'linear-gradient(121.28deg, #000000 0%, #FFFFFF 100%), linear-gradient(121.28deg, #FFB800 0%, #FFFFFF 100%), linear-gradient(140.54deg, #7000FF 0%, #001AFF 72.37%), linear-gradient(307.43deg, #FFE927 0%, #00114D 100%), radial-gradient(107% 142.8% at 15.71% 104.5%, #FFFFFF 0%, #A7AA00 100%), radial-gradient(100.22% 100% at 70.57% 0%, #7A3B00 0%, #1DAC92 100%)';
    const blendModes = 'difference, soft-light, difference, difference, difference, exclusion';
    
    const canvas = p.canvas || document.querySelector('.p5Canvas, #defaultCanvas0');
    if (canvas) {
      canvas.style.background = bg;
      canvas.style.backgroundBlendMode = blendModes;
      document.documentElement.style.setProperty('--canvas-pattern', 'none');
    }
  };

  p.setCanvasBgFromSet = () => {
    const choices = p.colourSet.filter((c) => c.toString() !== p.currentCanvasBg);
    const colour = p.random(choices);
    p.currentCanvasBg = colour.toString();
    document.documentElement.style.setProperty('--canvas-bg', p.currentCanvasBg);
  };

  p.generateColorSet = (count = 6) => {
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [];

    for (let i = 0; i < count; i++) {
        // Use large variations in hue for psychedelic effects
        const hue = (baseHue + (Math.random() * 360)) % 360;

        // Saturation between 80-100 for very bold and saturated colors
        const saturation = Math.floor(Math.random() * 20) + 80;

        // Brightness between 50-90 for a mix of bright and vibrant tones
        const brightness = Math.floor(Math.random() * 40) + 50;

        // Push HSB color into the set
        colors.push(p.color(hue, saturation, brightness));
    }

    return colors;
}

  p.resetAnimation = () => {
  };


  p.mousePressed = () => {
    p.togglePlayback();
  };

  p.keyPressed = () => {
    if (p.key === 'c' || p.key === 'C') {
      const pos = p.cam.eyeX ? {
        x: p.cam.eyeX,
        y: p.cam.eyeY,
        z: p.cam.eyeZ
      } : {
        x: 0,
        y: 0,
        z: p.height / 2
      };
      console.log('Camera position:', pos);
      console.log(`{ x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)} }`);
    }
    return p.saveSketchImage();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};


new p5(sketch);
