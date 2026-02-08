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

    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20) + 80;
    const brightness = Math.floor(Math.random() * 40) + 50;
    p.colourSet = [p.color(hue, saturation, brightness)];
    p.setComplexCanvasBg();

    const glyphSize = Math.min(p.width, p.height) * 0.3;
    p.glyph = new LABCATGlyph3D(p, 0, 0, 0, glyphSize, false);
    p.extraGlyphs = [];

    p.cam = p.createCamera();
    p.cam.setPosition(0, 0, p.height / 2);

    p.cameraOverride = false;
    p.blackFade = { active: false, startTime: 0, duration: 0 };
  };

  p.draw = () => {
    p.clear();

    p.cam.setPosition(p.cameraX, p.cameraY, p.cameraZ);
    p.cam.lookAt(0, 0, 0);

    if (p.blackFade.active) {
      const elapsed = p.song.currentTime() * 1000 - p.blackFade.startTime;
      const progress = p.constrain(elapsed / p.blackFade.duration, 0, 1);
      const easedProgress = Math.pow(progress, 2);
      const opacity = 1 - easedProgress;
      
      p.colorMode(p.RGB, 255);
      p.background(0, 0, 0, opacity * 255);
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

    if (p.extraGlyphs) {
      p.extraGlyphs.forEach(glyph => {
        if (glyph && glyph.animateZ) {
          const elapsed = p.song.currentTime() * 1000 - glyph.animateZStart;
          const progress = p.constrain(elapsed / glyph.animateZDuration, 0, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          glyph.z = p.lerp(glyph.animateZFrom, glyph.animateZTo, eased);

          if (progress >= 1) {
            glyph.animateZ = false;
            glyph.z = glyph.animateZTo;
          }
        }
      });
    }

    if (p.glyph) {
      p.glyph.update();
      p.glyph.draw();
    }

    if (p.extraGlyphs) {
      p.extraGlyphs.forEach(glyph => {
        if (glyph) {
          glyph.update();
          glyph.draw();
        }
      });
    }
  };

  p.executeTrack1 = (note) => {
    const { currentCue, durationTicks } = note;
    const duration = (durationTicks / p.PPQ) * (60 / p.bpm);

    const resetCues = [1, 2, 3, 4, 25, 26, 27, 28, 49];

    if (resetCues.includes(currentCue) || duration < 0.4) {
      p.extraGlyphs = currentCue < 48 ? [] : p.extraGlyphs;
      p.cameraX = 0;
      p.cameraY = 0;
      p.cameraZ = p.height / 2;
      p.cameraOverride = true;
    } else {
      const cueIndex = currentCue % 6;

      const baseZ = p.map(p.width, 375, 1920, 1000, 500, true);

      const x = (cueIndex % 2 === 0 ? -1 : 1) * (350 + cueIndex * 50);
      const y = -30 + cueIndex * 20;
      const z = baseZ + cueIndex * 30;

      p.cameraX = x;
      p.cameraY = y;
      p.cameraZ = z;
      p.cameraOverride = true;

      // Create 6 extra glyphs in egg of life pattern
      if (p.extraGlyphs.length === 0) {
        const glyphSize = Math.min(p.width, p.height) * 0.3;
        const radius = glyphSize * 0.88;
        const backZ = -glyphSize * 0.88;

        for (let i = 0; i < 6; i++) {
          const angle = (i * 60) * (Math.PI / 180);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const extraGlyph = new LABCATGlyph3D(p, x, y, backZ, glyphSize * 0.6, false);
          extraGlyph.originalZ = backZ;
          p.extraGlyphs.push(extraGlyph);
        }
      }
    }

    if (currentCue >= 5) {
      p.blackFade.active = true;
      p.blackFade.startTime = p.song.currentTime() * 1000;
      p.blackFade.duration = duration * 1000;
      p.setComplexCanvasBg();
    }

    p.glyph.setRandomColour();

    const startZ = -p.height * 8;
    const endZ = p.height / 8;

    p.glyph.z = startZ;
    p.glyph.animateZ = true;
    p.glyph.animateZStart = p.song.currentTime() * 1000;
    p.glyph.animateZDuration = duration * 1000;
    p.glyph.animateZFrom = startZ;
    p.glyph.animateZTo = endZ;

    if (p.extraGlyphs) {
      p.extraGlyphs.forEach(glyph => {
        if (glyph) {
          const glyphStartZ = glyph.originalZ - p.height * 8;
          const glyphEndZ = glyph.originalZ + p.height / 8;
          glyph.z = glyphStartZ;
          glyph.animateZ = true;
          glyph.animateZStart = p.song.currentTime() * 1000;
          glyph.animateZDuration = duration * 1000;
          glyph.animateZFrom = glyphStartZ;
          glyph.animateZTo = glyphEndZ;
        }
      });
    }
  };

  p.executeTrack2 = (note) => {
    const { currentCue, durationTicks } = note;
    const duration = (durationTicks / p.PPQ) * (60 / p.bpm);
    
    p.blackFade.active = currentCue === 34 || currentCue === 68;
    p.blackFade.startTime = p.song.currentTime() * 1000;
    p.blackFade.duration = duration * 1000;
    p.setComplexCanvasBg();
  };

  p.randomHexColor = () => {
    return '#' + Math.floor(p.random(16777215)).toString(16).padStart(6, '0').toUpperCase();
  };

  p.generateComplexBg = () => {
    const gradients = [];
    const blendModes = ['difference', 'soft-light', 'difference', 'difference', 'difference', 'exclusion'];
    
    for (let i = 0; i < 4; i++) {
      const angle = p.random(360);
      const color1 = p.randomHexColor();
      const color2 = p.randomHexColor();
      const stop1 = p.random(30);
      const stop2 = 70 + p.random(30);
      gradients.push(`linear-gradient(${angle}deg, ${color1} ${stop1}%, ${color2} ${stop2}%)`);
    }
    
    for (let i = 0; i < 2; i++) {
      const size1 = 80 + p.random(40);
      const size2 = 80 + p.random(40);
      const posX = p.random(100);
      const posY = p.random(100);
      const color1 = p.randomHexColor();
      const color2 = p.randomHexColor();
      gradients.push(`radial-gradient(${size1}% ${size2}% at ${posX}% ${posY}%, ${color1} 0%, ${color2} 100%)`);
    }
    
    return {
      bg: gradients.join(', '),
      blendModes: blendModes.join(', ')
    };
  };

  p.setComplexCanvasBg = () => {
    const { bg, blendModes } = p.generateComplexBg();
    document.documentElement.style.setProperty('--canvas-complex-bg', bg);
    document.documentElement.style.setProperty('--canvas-complex-blend-mode', blendModes);
  };

  p.resetAnimation = () => {
    const glyphSize = Math.min(p.width, p.height) * 0.3;
    p.glyph = new LABCATGlyph3D(p, 0, 0, 0, glyphSize, false);
    p.extraGlyphs = [];
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
