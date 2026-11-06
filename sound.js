// Instant-camera sound effects, synthesized live with the Web Audio API.
// No audio files: every click, spring, motor and gear tooth is built from
// filtered noise and oscillators, so it stays tiny and never sounds looped.

export class CameraSound {
  constructor() {
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      const ctx = (this.ctx = new AC());

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 3.5;
      comp.attack.value = 0.002;
      comp.release.value = 0.12;
      comp.connect(ctx.destination);

      this.master = ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(comp);

      // small-room reverb so it sounds like a camera in your hands, not in a void
      const verb = ctx.createConvolver();
      verb.buffer = this.impulse(0.45, 3.2);
      this.wet = ctx.createGain();
      this.wet.gain.value = 0.16;
      this.wet.connect(verb).connect(comp);

      this.noiseBuf = this.makeNoise(2);
      this.gearBuf = this.makeGearTick();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // ---------------------------------------------------------------- buffers
  makeNoise(seconds) {
    const { ctx } = this;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  impulse(seconds, decay) {
    const { ctx } = this;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // one gear tooth: a tiny resonant tick followed by silence. Looped, it becomes a gear train.
  makeGearTick() {
    const { ctx } = this;
    const period = 1 / 46; // teeth per second at playbackRate 1
    const len = Math.floor(ctx.sampleRate * period);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    const tickLen = Math.floor(ctx.sampleRate * 0.006);
    for (let i = 0; i < tickLen; i++) {
      const env = Math.exp(-i / (tickLen / 4));
      d[i] = (Math.random() * 2 - 1) * env * 0.9 + Math.sin(i * 0.55) * env * 0.4;
    }
    return buf;
  }

  // ---------------------------------------------------------------- primitives
  out(node, wet = true) {
    node.connect(this.master);
    if (wet) node.connect(this.wet);
  }

  burst(t, { type = 'bandpass', freq = 2000, Q = 1, gain = 0.3, attack = 0.0015, decay = 0.03, wet = true }) {
    const { ctx } = this;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = Q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    src.connect(f).connect(g);
    this.out(g, wet);
    src.start(t, Math.random() * 1.5);
    src.stop(t + attack + decay + 0.05);
  }

  thump(t, { f0 = 140, f1 = 50, dur = 0.07, gain = 0.3 }) {
    const { ctx } = this;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    this.out(g);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // ---------------------------------------------------------------- effects
  /** The shutter: plastic button, spring-loaded blade "ka", mirror "chunk", release. */
  shutter() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime + 0.01;

    // finger on the plastic button
    this.burst(t, { freq: 3400, Q: 1.3, gain: 0.32, decay: 0.016 });
    this.burst(t, { type: 'lowpass', freq: 700, gain: 0.25, decay: 0.035 });

    // shutter blades snap: sharp transient + a ringing steel spring
    const k = t + 0.048;
    this.burst(k, { type: 'highpass', freq: 2600, gain: 0.75, decay: 0.011 });
    this.burst(k, { freq: 1780, Q: 14, gain: 0.85, decay: 0.075 });
    this.burst(k, { freq: 3950, Q: 18, gain: 0.25, decay: 0.05 });
    this.thump(k, { f0: 160, f1: 55, dur: 0.07, gain: 0.34 });

    // body "chunk" as the mechanism resets
    const c = t + 0.118;
    this.burst(c, { freq: 1150, Q: 2.2, gain: 0.45, decay: 0.032 });
    this.burst(c, { type: 'highpass', freq: 3000, gain: 0.22, decay: 0.008 });
    this.thump(c, { f0: 105, f1: 48, dur: 0.09, gain: 0.3 });

    // button springs back
    this.burst(t + 0.21, { freq: 4200, Q: 1.5, gain: 0.12, decay: 0.01 });
  }

  /** Xenon flash: a dry tick, then the rising capacitor whine as it recharges. */
  flash() {
    if (!this.ensure()) return;
    const { ctx } = this;
    const t = ctx.currentTime + 0.05;
    this.burst(t, { type: 'highpass', freq: 6500, gain: 0.09, decay: 0.05 });

    const w0 = t + 0.35;
    const dur = 2.4;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o.type = 'sine';
    o2.type = 'triangle';
    o.frequency.setValueAtTime(2100, w0);
    o.frequency.exponentialRampToValueAtTime(7200, w0 + dur);
    o2.frequency.setValueAtTime(4200, w0);
    o2.frequency.exponentialRampToValueAtTime(14400, w0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, w0);
    g.gain.linearRampToValueAtTime(0.012, w0 + 0.25);
    g.gain.setValueAtTime(0.012, w0 + dur - 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, w0 + dur);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(g);
    o2.connect(g2).connect(g);
    this.out(g, false);
    o.start(w0); o2.start(w0);
    o.stop(w0 + dur + 0.05); o2.stop(w0 + dur + 0.05);
  }

  /** The eject motor: spin-up, gear train, film rubbing the rollers, final clunk. */
  eject(dur = 1.55) {
    if (!this.ensure()) return;
    const { ctx } = this;
    const t = ctx.currentTime + 0.02;
    const end = t + dur;

    // relay click as the motor engages
    this.burst(t, { freq: 2300, Q: 3, gain: 0.22, decay: 0.02 });

    // motor body
    const m1 = ctx.createOscillator();
    const m2 = ctx.createOscillator();
    m1.type = 'sawtooth';
    m2.type = 'square';
    m1.frequency.setValueAtTime(70, t);
    m1.frequency.exponentialRampToValueAtTime(118, t + 0.14);
    m1.frequency.setValueAtTime(118, end - 0.18);
    m1.frequency.exponentialRampToValueAtTime(64, end);
    m2.frequency.setValueAtTime(140, t);
    m2.frequency.exponentialRampToValueAtTime(237, t + 0.14);
    m2.frequency.setValueAtTime(237, end - 0.18);
    m2.frequency.exponentialRampToValueAtTime(128, end);

    const wob = ctx.createOscillator();
    wob.frequency.value = 9;
    const wobG = ctx.createGain();
    wobG.gain.value = 2.2;
    wob.connect(wobG);
    wobG.connect(m1.frequency);
    wobG.connect(m2.frequency);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1300;
    lp.Q.value = 0.9;
    const bodyRes = ctx.createBiquadFilter();
    bodyRes.type = 'peaking';
    bodyRes.frequency.value = 480;
    bodyRes.Q.value = 2;
    bodyRes.gain.value = 7;
    const m2g = ctx.createGain();
    m2g.gain.value = 0.35;
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(0, t);
    mg.gain.linearRampToValueAtTime(0.13, t + 0.08);
    mg.gain.setValueAtTime(0.13, end - 0.12);
    mg.gain.linearRampToValueAtTime(0, end);
    m1.connect(lp);
    m2.connect(m2g).connect(lp);
    lp.connect(bodyRes).connect(mg);
    this.out(mg);

    // gear teeth
    const gear = ctx.createBufferSource();
    gear.buffer = this.gearBuf;
    gear.loop = true;
    gear.playbackRate.setValueAtTime(0.6, t);
    gear.playbackRate.linearRampToValueAtTime(1, t + 0.14);
    gear.playbackRate.setValueAtTime(1, end - 0.18);
    gear.playbackRate.linearRampToValueAtTime(0.55, end);
    const gbp = ctx.createBiquadFilter();
    gbp.type = 'bandpass';
    gbp.frequency.value = 2100;
    gbp.Q.value = 1.4;
    const gg = ctx.createGain();
    gg.gain.setValueAtTime(0, t);
    gg.gain.linearRampToValueAtTime(0.32, t + 0.1);
    gg.gain.setValueAtTime(0.32, end - 0.1);
    gg.gain.linearRampToValueAtTime(0, end);
    gear.connect(gbp).connect(gg);
    this.out(gg);

    // film card rubbing through the rollers
    const fr = ctx.createBufferSource();
    fr.buffer = this.noiseBuf;
    fr.loop = true;
    const fbp = ctx.createBiquadFilter();
    fbp.type = 'bandpass';
    fbp.frequency.setValueAtTime(2600, t);
    fbp.frequency.linearRampToValueAtTime(3800, end);
    fbp.Q.value = 0.7;
    const fg = ctx.createGain();
    fg.gain.setValueAtTime(0, t + 0.15);
    fg.gain.linearRampToValueAtTime(0.06, t + 0.5);
    fg.gain.setValueAtTime(0.06, end - 0.2);
    fg.gain.linearRampToValueAtTime(0, end - 0.02);
    fr.connect(fbp).connect(fg);
    this.out(fg);

    [m1, m2, wob, gear, fr].forEach((n) => { n.start(t); n.stop(end + 0.05); });

    // film drops free, motor stops
    this.burst(end - 0.02, { type: 'lowpass', freq: 900, gain: 0.32, decay: 0.05 });
    this.burst(end - 0.02, { freq: 2700, Q: 2, gain: 0.2, decay: 0.016 });
    this.thump(end - 0.02, { f0: 120, f1: 60, dur: 0.06, gain: 0.18 });
  }

  /** A print pressed onto the wall: soft paper tap and a little tape crinkle. */
  stick() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime + 0.01;
    this.burst(t, { type: 'lowpass', freq: 1100, gain: 0.3, decay: 0.035 });
    this.burst(t + 0.005, { freq: 2600, Q: 0.9, gain: 0.06, decay: 0.03 });
    this.burst(t + 0.03, { type: 'highpass', freq: 4500, gain: 0.035, attack: 0.02, decay: 0.14 });
  }
}
