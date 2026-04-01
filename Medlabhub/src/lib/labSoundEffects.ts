// ──────────────────────────────────────────────
// WebAudio API Lab Sound Effects (synthesized)
// No external files needed — pure synthesis
// ──────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// ── Liquid pouring / drip sound ──
export function playPourSound(duration = 1.2, pitch = 600) {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Filtered noise → water-like
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.setValueAtTime(pitch, now);
  bandpass.frequency.exponentialRampToValueAtTime(pitch * 1.8, now + duration * 0.3);
  bandpass.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + duration);
  bandpass.Q.value = 3;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
  gain.gain.setValueAtTime(0.15, now + duration * 0.7);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  noise.connect(bandpass).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}

// ── Bunsen burner flame whoosh ──
export function playFlameSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const duration = 0.8;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.25;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(200, now);
  lp.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
  lp.frequency.exponentialRampToValueAtTime(400, now + duration);
  lp.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.04, now + duration);

  noise.connect(lp).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}

// ── Glass clink (slide placement) ──
export function playGlassSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(2800, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.35);
}

// ── Success chime ──
export function playSuccessSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.45);
  });
}

// ── Error buzz ──
export function playErrorSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.linearRampToValueAtTime(120, now + 0.25);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.3);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.35);
}

// ── Timer tick ──
export function playTickSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

// ── Timer complete beep ──
export function playTimerCompleteSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  [880, 880, 1100].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.12);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.15);
  });
}

// ── Paper blot ──
export function playPaperSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const duration = 0.2;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(hp).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}

// ── Microscope focus click ──
export function playFocusClickSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 3500;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

// ── Pick up item ──
export function playPickupSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

// ── Drop item back ──
export function playDropSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

// ── Completion fanfare ──
export function playCompletionFanfare() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.1, now + i * 0.12 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.65);
  });
}
