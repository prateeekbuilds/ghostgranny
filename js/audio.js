/**
 * audio.js
 * Procedural Web Audio API sound synthesis engine.
 * Generates ambient horror drones, footsteps, static noise, and sound cues dynamically without external MP3/WAV files.
 */

let AC = null;

function ac() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
  }
  return AC;
}

/**
 * Procedural filtered noise generator
 * @param {number} d Duration in seconds
 * @param {number} v Volume
 */
function noise(d = 0.5, v = 0.08) {
  try {
    const a = ac();
    const b = a.createBuffer(1, a.sampleRate * d, a.sampleRate);
    const dt = b.getChannelData(0);
    for (let i = 0; i < dt.length; i++) {
      dt[i] = Math.random() * 2 - 1;
    }
    const s = a.createBufferSource();
    const g = a.createGain();
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1200;
    g.gain.setValueAtTime(v, a.currentTime);
    g.gain.linearRampToValueAtTime(0, a.currentTime + d);
    s.buffer = b;
    s.connect(f);
    f.connect(g);
    g.connect(a.destination);
    s.start();
  } catch (e) {}
}

/**
 * Oscillator tone generator for drones and alerts
 * @param {number} f Frequency (Hz)
 * @param {number} d Duration (s)
 * @param {number} v Volume
 * @param {OscillatorType} type Oscillator type ('sine', 'sawtooth', 'square', 'triangle')
 */
function tone(f = 60, d = 2, v = 0.05, type = 'sawtooth') {
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, a.currentTime);
    g.gain.linearRampToValueAtTime(v, a.currentTime + 0.3);
    g.gain.linearRampToValueAtTime(0, a.currentTime + d);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + d);
  } catch (e) {}
}

/**
 * Short sine beep for item interactions
 */
function beep(f = 440, d = 0.12) {
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.12, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + d);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + d);
  } catch (e) {}
}

/**
 * Synthesizes floor creak / footstep sounds when the player walks
 */
function footstep() {
  if (G.tick % 28 === 0 && player.walk) {
    try {
      const a = ac();
      const b = a.createBuffer(1, a.sampleRate * 0.08, a.sampleRate);
      const dt = b.getChannelData(0);
      for (let i = 0; i < dt.length; i++) {
        dt[i] = (Math.random() * 2 - 1) * (1 - i / dt.length);
      }
      const s = a.createBufferSource();
      const g = a.createGain();
      const f = a.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 400;
      g.gain.value = 0.06;
      s.buffer = b;
      s.connect(f);
      f.connect(g);
      g.connect(a.destination);
      s.start();
    } catch (e) {}
  }
}

let ambInt = null;

/**
 * Begins procedural horror ambient drone loop
 */
function startAmb() {
  tone(40, 5, 0.04);
  if (ambInt) clearInterval(ambInt);
  ambInt = setInterval(() => {
    if (G.phase !== 'game') return;
    tone(30 + Math.random() * 50, 4 + Math.random() * 3, 0.025 + Math.random() * 0.03);
    if (Math.random() < 0.2) noise(0.3, 0.04);
  }, 4500);
}

/**
 * Granny growl sound effect
 */
function grannyGrowl() {
  tone(55, 1.5, 0.12);
  noise(0.8, 0.15);
}
