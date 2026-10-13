// Synth engine: drum machine + melodic voice. Fully synthesised with Web Audio — no samples.

export type DrumVoice = 'kick' | 'hat' | 'clap';
export type OscType = 'sine' | 'triangle' | 'sawtooth' | 'square';
export type ScaleId =
  | 'minor-pent' | 'major-pent'
  | 'minor' | 'dorian' | 'major' | 'phrygian' | 'mixolydian';

export const SCALES: Record<ScaleId, { label: string; intervals: number[] }> = {
  'minor-pent': { label: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
  'major-pent': { label: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
  'minor':      { label: 'Natural Minor',    intervals: [0, 2, 3, 5, 7, 8, 10] },
  'dorian':     { label: 'Dorian',           intervals: [0, 2, 3, 5, 7, 9, 10] },
  'major':      { label: 'Major',            intervals: [0, 2, 4, 5, 7, 9, 11] },
  'phrygian':   { label: 'Phrygian',         intervals: [0, 1, 3, 5, 7, 8, 10] },
  'mixolydian': { label: 'Mixolydian',       intervals: [0, 2, 4, 5, 7, 9, 10] },
};

export const ROOT_NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;
export type RootNote = typeof ROOT_NOTES[number];

// MIDI 48 = C3. Each note gets its own base offset from C3.
const ROOT_BASE: Record<RootNote, number> = {
  C:48,'C#':49,D:50,'D#':51,E:52,F:53,'F#':54,G:55,'G#':56,A:57,'A#':58,B:59,
};

const midiToHz = (m: number) => 440 * 2 ** ((m - 69) / 12);

export interface ScaleNote { label: string; hz: number; chroma: number }

/** Two octaves of scale notes, lowest first. */
export function buildScale(root: RootNote, scale: ScaleId): ScaleNote[] {
  const { intervals } = SCALES[scale];
  const base = ROOT_BASE[root];
  const rootChroma = ROOT_NOTES.indexOf(root);
  const out: ScaleNote[] = [];
  for (let oct = 0; oct < 2; oct++) {
    for (const st of intervals) {
      const midi = base + st + oct * 12;
      const chroma = (rootChroma + st) % 12;
      const octNum = Math.floor(midi / 12) - 1;
      out.push({ label: `${ROOT_NOTES[chroma]}${octNum}`, hz: midiToHz(midi), chroma });
    }
  }
  return out;
}

/** The 12 chromatic semitones that belong to this scale (for keyboard highlighting). */
export function inScaleSet(root: RootNote, scale: ScaleId): Set<number> {
  const rootChroma = ROOT_NOTES.indexOf(root);
  return new Set(SCALES[scale].intervals.map((i) => (rootChroma + i) % 12));
}

export interface SynthParams {
  osc: OscType;
  cutoff: number;   // 0–1 → 300–8 000 Hz
  res: number;      // 0–1 → Q 0.5–20
  attack: number;   // 0–1 → 0.001–0.4 s
  release: number;  // 0–1 → 0.04–1.4 s
}

export const DEFAULT_PARAMS: SynthParams = {
  osc: 'sawtooth', cutoff: 0.5, res: 0.12, attack: 0.03, release: 0.42,
};

function makeRow(ons: number[]): boolean[] {
  return Array.from({ length: 16 }, (_, i) => ons.includes(i));
}

function defaultMelody(): (number | null)[] {
  // A pleasant minor-pentatonic figure on the default A minor pent scale
  const m: (number | null)[] = Array(16).fill(null);
  m[0]=0; m[2]=2; m[4]=4; m[6]=2;
  m[8]=0; m[10]=3; m[12]=4; m[14]=1;
  return m;
}

export class SynthEngine {
  private _ctx: AudioContext | null = null;
  private _drumOut: GainNode | null = null;
  private _melOut: GainNode | null = null;
  private _noise: AudioBuffer | null = null;
  private _timer: number | null = null;
  private _next = 0;
  private _step = 0;

  readonly queue: { step: number; time: number }[] = [];

  /** Progressive layer gates — React sets these as the user advances steps. */
  layerKick = false;
  layerHats = false;
  layerMelody = false;

  bpm = 128;
  drums: Record<DrumVoice, boolean[]> = {
    kick: makeRow([0, 4, 8, 12]),
    hat:  makeRow([2, 6, 10, 14]),
    clap: makeRow([4, 12]),
  };
  melody: (number | null)[] = defaultMelody();
  params: SynthParams = { ...DEFAULT_PARAMS };
  root: RootNote = 'A';
  scale: ScaleId = 'minor-pent';

  get now() { return this._ctx?.currentTime ?? 0; }
  get playing() { return this._timer !== null; }

  private boot() {
    if (this._ctx) return this._ctx;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    const master = ctx.createGain(); master.gain.value = 0.82;
    master.connect(comp).connect(ctx.destination);

    const dOut = ctx.createGain(); dOut.gain.value = 0.88; dOut.connect(master);
    // Melody gain starts at 0 — enableMelody() fades it in
    const mOut = ctx.createGain(); mOut.gain.value = 0; mOut.connect(master);

    const len = ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    this._ctx = ctx; this._drumOut = dOut; this._melOut = mOut; this._noise = buf;
    return ctx;
  }

  async start() {
    const ctx = this.boot();
    if (ctx.state === 'suspended') await ctx.resume();
    // Set melody gain to match layer state (instant — no fade on restart)
    if (this._melOut) {
      const t = ctx.currentTime;
      this._melOut.gain.cancelScheduledValues(t);
      this._melOut.gain.setValueAtTime(this.layerMelody ? 0.72 : 0, t);
    }
    this._step = 0;
    this._next = ctx.currentTime + 0.06;
    this.queue.length = 0;
    this._timer = window.setInterval(() => this._schedule(), 25);
    this._schedule();
  }

  stop() {
    if (this._timer !== null) window.clearInterval(this._timer);
    this._timer = null; this.queue.length = 0;
  }

  /** Fade the melody layer in over ~2 seconds. Call when first activating the melody. */
  enableMelody() {
    this.layerMelody = true;
    if (this._ctx && this._melOut) {
      const t = this._ctx.currentTime;
      this._melOut.gain.cancelScheduledValues(t);
      this._melOut.gain.setValueAtTime(0, t);
      this._melOut.gain.linearRampToValueAtTime(0.72, t + 2.0);
    }
  }

  private _schedule() {
    const ctx = this._ctx!;
    const s16 = 60 / this.bpm / 4;
    while (this._next < ctx.currentTime + 0.12) {
      const swing = this._step % 2 === 1 ? s16 * 0.06 : 0;
      const t = this._next + swing;

      if (this.layerKick  && this.drums.kick[this._step]) this._kick(t);
      if (this.layerHats  && this.drums.hat[this._step])  this._hat(t);
      if (this.layerHats  && this.drums.clap[this._step]) this._clap(t);

      if (this.layerMelody) {
        const noteIdx = this.melody[this._step];
        if (noteIdx !== null) {
          const notes = buildScale(this.root, this.scale);
          if (noteIdx < notes.length) this._note(notes[noteIdx].hz, t, s16 * 0.85);
        }
      }

      this.queue.push({ step: this._step, time: t });
      this._next += s16;
      this._step = (this._step + 1) % 16;
    }
  }

  // --- Drums ---

  private _kick(t: number) {
    const ctx = this._ctx!, out = this._drumOut!;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(155, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(g).connect(out); osc.start(t); osc.stop(t + 0.5);
  }

  private _noiseBurst(t: number, dur: number, f: BiquadFilterNode, level: number) {
    const ctx = this._ctx!, out = this._drumOut!;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = this._noise;
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }

  private _hat(t: number) {
    const f = this._ctx!.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 7500;
    this._noiseBurst(t, 0.05, f, 0.4);
  }

  private _clap(t: number) {
    const ctx = this._ctx!;
    [0, 0.011, 0.022].forEach((o, i) => {
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.9;
      this._noiseBurst(t + o, i === 2 ? 0.18 : 0.02, f, 0.7);
    });
  }

  // --- Melodic voice ---

  private _note(hz: number, t: number, gate: number) {
    const ctx = this._ctx!, out = this._melOut!;
    const { osc, cutoff, res, attack, release } = this.params;
    const atk = 0.001 + attack * 0.399;
    const rel = 0.04 + release * 1.36;

    const oscN = ctx.createOscillator();
    oscN.type = osc; oscN.frequency.value = hz;

    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 300 + cutoff * 7700;
    filt.Q.value = 0.5 + res * 19.5;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.6, t + atk);
    const decayEnd = t + Math.max(gate * 0.9, atk + 0.01);
    env.gain.exponentialRampToValueAtTime(0.3, decayEnd);
    env.gain.setValueAtTime(0.3, t + gate);
    env.gain.exponentialRampToValueAtTime(0.001, t + gate + rel);

    oscN.connect(filt).connect(env).connect(out);
    oscN.start(t); oscN.stop(t + gate + rel + 0.05);
  }

  /** Immediately play a single scale note (for keyboard preview). */
  async auditionNote(hz: number) {
    const ctx = this.boot();
    if (ctx.state === 'suspended') await ctx.resume();
    const gate = 60 / this.bpm / 2;
    this._note(hz, ctx.currentTime + 0.01, gate);
  }

  /** Immediately play a drum voice. */
  async auditionDrum(v: DrumVoice) {
    const ctx = this.boot();
    if (ctx.state === 'suspended') await ctx.resume();
    const t = ctx.currentTime + 0.01;
    if (v === 'kick') this._kick(t);
    else if (v === 'hat') this._hat(t);
    else this._clap(t);
  }
}
