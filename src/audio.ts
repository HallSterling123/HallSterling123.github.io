// A tiny drum machine synthesised with the Web Audio API. No samples to download.

export type Voice = 'kick' | 'hat' | 'clap' | 'bleep';

const BLEEP_NOTES = [220, 261.63, 293.66, 329.63]; // A3 C4 D4 E4, cycled per step

export class DrumMachine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  /** Steps scheduled into the future, read by the UI to light the playhead. */
  readonly queue: { step: number; time: number }[] = [];

  bpm = 128;
  pattern: Record<Voice, boolean[]>;

  constructor(pattern: Record<Voice, boolean[]>) {
    this.pattern = pattern;
  }

  get now() {
    return this.ctx?.currentTime ?? 0;
  }

  get playing() {
    return this.timer !== null;
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    const out = ctx.createGain();
    out.gain.value = 0.8;
    out.connect(comp).connect(ctx.destination);

    const len = ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.out = out;
    this.noise = buf;
    return ctx;
  }

  async start() {
    const ctx = this.ensure();
    if (ctx.state === 'suspended') await ctx.resume();
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.06;
    this.queue.length = 0;
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.queue.length = 0;
  }

  /** Play one voice immediately, used when someone taps a row label. */
  async audition(v: Voice) {
    const ctx = this.ensure();
    if (ctx.state === 'suspended') await ctx.resume();
    this.trigger(v, ctx.currentTime + 0.01, 0);
  }

  private schedule() {
    const ctx = this.ctx!;
    const sixteenth = 60 / this.bpm / 4;
    while (this.nextTime < ctx.currentTime + 0.12) {
      // a touch of swing on the off-beat sixteenths
      const swing = this.step % 2 === 1 ? sixteenth * 0.08 : 0;
      const t = this.nextTime + swing;
      (Object.keys(this.pattern) as Voice[]).forEach((v) => {
        if (this.pattern[v][this.step]) this.trigger(v, t, this.step);
      });
      this.queue.push({ step: this.step, time: t });
      this.nextTime += sixteenth;
      this.step = (this.step + 1) % 16;
    }
  }

  private trigger(v: Voice, t: number, step: number) {
    switch (v) {
      case 'kick':
        return this.kick(t);
      case 'hat':
        return this.hat(t, step % 4 === 2);
      case 'clap':
        return this.clap(t);
      case 'bleep':
        return this.bleep(t, BLEEP_NOTES[Math.floor(step / 4) % BLEEP_NOTES.length]);
    }
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(g).connect(this.out!);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  private noiseBurst(t: number, dur: number, filter: BiquadFilterNode, level: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(g).connect(this.out!);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  private hat(t: number, open: boolean) {
    const f = this.ctx!.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7500;
    this.noiseBurst(t, open ? 0.22 : 0.05, f, open ? 0.35 : 0.4);
  }

  private clap(t: number) {
    const ctx = this.ctx!;
    [0, 0.011, 0.022].forEach((o, i) => {
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1400;
      f.Q.value = 0.9;
      this.noiseBurst(t + o, i === 2 ? 0.18 : 0.02, f, 0.7);
    });
  }

  private bleep(t: number, freq: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    f.type = 'lowpass';
    f.Q.value = 12;
    f.frequency.setValueAtTime(2600, t);
    f.frequency.exponentialRampToValueAtTime(260, t + 0.16);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(f).connect(g).connect(this.out!);
    osc.start(t);
    osc.stop(t + 0.22);
  }
}
