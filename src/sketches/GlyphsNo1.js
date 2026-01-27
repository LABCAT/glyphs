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

      const track1 = result.tracks[2].notes;
      const track2 = result.tracks[3].notes;
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

    const randomHue = p.random(0, 360);
    p.colourSet = [
      p.color(randomHue, 100, 100),
      p.color((randomHue + 60) % 360, 100, 100),
      p.color((randomHue + 120) % 360, 100, 100),
      p.color((randomHue + 180) % 360, 100, 100),
      p.color((randomHue + 240) % 360, 100, 100),
      p.color((randomHue + 300) % 360, 100, 100),
    ];

    const glyphSize = Math.min(p.width, p.height) * 0.3;
    p.glyph = new LABCATGlyph3D(p, 0, 0, 0, glyphSize, false, false);

    p.cam = p.createCamera();
    p.cam.setPosition(0, 0, p.height / 2);

    p.cameraOverride = false;
  };

  p.draw = () => {
    p.clear();

    if (p.cameraOverride) {
      p.cam.setPosition(p.cameraX, p.cameraY, p.cameraZ);
      p.cam.lookAt(0, 0, 0);
    } else {
      p.orbitControl();
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
    // Track 1 handler
  };

  p.executeTrack2 = (note) => {
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
