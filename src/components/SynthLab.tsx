import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SynthEngine, buildScale, inScaleSet,
  ROOT_NOTES, SCALES,
  DEFAULT_PARAMS,
  type OscType, type DrumVoice, type RootNote, type ScaleId,
} from '../synth';
import { Knob } from './Knob';
import { pulse } from '../pulse';

// ─── Step definitions ─────────────────────────────────────────────────────────

interface Example { who: string; note: string; what: string }
interface StepDef {
  id: string;
  num: string;
  title: string;
  tagline: string;
  what: string[];
  examples: Example[];
  tip: string;
  nextLabel: string;
  tidalComment: string;
}

const STEP_DEFS: StepDef[] = [
  {
    id: 'pulse', num: '01', title: 'The Pulse', tagline: 'Every track begins with a heartbeat',
    tidalComment: '-- Kick drum, 4-on-the-floor',
    what: [
      'Every piece of electronic music is organised around a pulse. The kick drum lands on every downbeat — a technique called "four-on-the-floor" because it hits all four beats in a 4/4 bar. It\'s the metronomic spine everything else orbits.',
      'BPM (beats per minute) is the speed of this pulse. House music sits around 120–130 BPM, techno pushes 130–150, hip-hop typically runs 80–100, and drum & bass lives at 160–180. Try different values and notice how the same kick drum transforms the mood.',
    ],
    examples: [
      { who: 'Daft Punk — "Da Funk"', note: '120 BPM, house', what: 'Four-on-the-floor at exactly 120 BPM. Clean, driving, mechanical. The BPM became the de facto standard for house music and has influenced almost every genre since.' },
      { who: 'Jeff Mills — "The Bells"', note: '145 BPM, techno', what: 'The same kick pattern at a higher tempo becomes urgent, hypnotic. Techno uses relentless repetition as a meditative tool — 10 minutes of the same loop at 145 BPM.' },
      { who: 'J Dilla — "Donuts" instrumentals', note: '85 BPM, hip-hop', what: 'At 85 BPM the kick feels heavy, lethargic in the best way. Hip-hop\'s slower tempo is fundamental to its emotional weight.' },
      { who: 'Andy C, Ram Trilogy — drum & bass', note: '174 BPM, DnB', what: 'At 174 BPM the kick blurs into something almost continuous. The pulse becomes texture rather than rhythm.' },
    ],
    tip: 'Start at 120 BPM — it\'s the default for a reason. Increase it slowly until the kick starts to feel uncomfortable, then back off. That edge is where a lot of great music lives.',
    nextLabel: 'Add the Groove',
  },
  {
    id: 'groove', num: '02', title: 'The Groove', tagline: 'Hi-hat and snare define the genre',
    tidalComment: '-- Rhythm layers: hi-hat + clap',
    what: [
      'The kick gives you a pulse; the hi-hat and snare/clap give you a groove. Where you place these three elements relative to each other is what makes a track sound like house, hip-hop, garage, or techno. The grid is identical — only the placement changes.',
      'The standard pattern for most electronic music: kick on beats 1 and 3 (or all 4 beats for house), snare/clap on 2 and 4, hi-hat subdividing in between. Vary any of those three rules and you\'re in different genre territory.',
    ],
    examples: [
      { who: 'Classic house — Frankie Knuckles, Larry Heard', note: 'Kick 1-2-3-4, hat 8ths, clap 2+4', what: 'The house template: kick on every beat, offbeat hi-hats, snare on 2 and 4. Every club music since has derived from this.' },
      { who: 'J Dilla, Pete Rock — boom-bap hip-hop', note: 'Kick 1+3, snare 2+4, swung hat', what: 'Kick on 1 and 3 (not all four beats). Dilla\'s genius was pushing the snare slightly behind the grid — the "Dilla feel" is everything.' },
      { who: 'Todd Edwards, UK Garage (2-step)', note: 'Syncopated kick, "skipping" feel', what: 'The kick deliberately avoids the obvious beats. The listener\'s body anticipates where it should land, creating a stumbling forward energy.' },
      { who: 'Aphex Twin — "Windowlicker"', note: 'Distorted breaks, irregular kick', what: 'Aphex uses the same 16-step grid but breaks every expectation. The grid is a starting point — knowing the rules is what lets you break them meaningfully.' },
    ],
    tip: 'Try the hip-hop preset: kick on 1 and 3, clap on 2 and 4. Add hi-hat on every even step. Now remove ONE kick hit — that gap creates anticipation the next hit resolves.',
    nextLabel: 'Add a Melody',
  },
  {
    id: 'tone', num: '03', title: 'The Tone', tagline: 'Raw sound from a mathematical wave',
    tidalComment: '-- Melodic voice: oscillator type',
    what: [
      'An oscillator generates a repeating waveform. Its shape determines the harmonic content — the combination of overtones above the fundamental frequency. A sawtooth wave contains all harmonics (rich, bright, buzzy). A square wave contains only odd harmonics (hollow, digital). A triangle is like a sine with subtle harmonics. A sine is a pure single frequency.',
      'The melody starts playing now with a default phrase. The oscillator is the raw clay — the filter and envelope in later steps sculpt it into something specific. Start with sawtooth: it gives the filter the most to work with.',
    ],
    examples: [
      { who: 'Daft Punk — "Around the World"', note: 'Sawtooth bass', what: 'That driving bass is a sawtooth through a slowly opening filter. The harmonic richness of the sawtooth is exactly what the filter needs to carve its movement.' },
      { who: 'Kraftwerk — "Computer World"', note: 'Square lead', what: 'Square waves are hollow and clinical — perfect for Kraftwerk\'s machine aesthetic. The digital character was intentional; they were celebrating the computer.' },
      { who: 'Brian Eno — "Music for Airports"', note: 'Sine pads', what: 'Pure sine waves stacked and stretched. Without harmonics to age them, sine waves feel timeless — pure frequency vibration, nothing more.' },
      { who: 'Phuture — "Acid Tracks"', note: 'Sawtooth + TB-303', what: 'The Roland TB-303 uses sawtooth into a resonant filter. That combination created acid house and its influence runs through Aphex Twin, Daft Punk, and virtually all electronic music.' },
    ],
    tip: 'Sawtooth is the default for good reason — it\'s the most harmonically rich. The filter (next step) subtracts harmonics. If you start with a sine, there\'s nothing to subtract.',
    nextLabel: 'Shape the Sound',
  },
  {
    id: 'shape', num: '04', title: 'Shape the Sound', tagline: 'Filter and envelope sculpt the waveform',
    tidalComment: '-- Filter cutoff + resonance, envelope',
    what: [
      'The lowpass filter removes everything above the cutoff frequency. Rolling it down makes the sound dark and warm; opening it brightens and sharpens. Resonance adds a peak right at the cutoff — a small amount gives character, maximum creates a squealing resonant tone. Slowly opening the cutoff over 8–16 bars is one of the most recognisable moves in electronic music.',
      'The envelope shapes the volume over time. Attack is how long a note takes to reach full volume — slow attack turns a buzzy lead into a swelling pad. Release is how long it fades after you release a note. These two controls alone can make the same oscillator sound like a pluck, a pad, or a stab.',
    ],
    examples: [
      { who: 'Classic house build-up — Larry Heard, Frankie Knuckles', note: 'Slow cutoff sweep open', what: 'Opening the filter from very low (300Hz) to fully open over 8–16 bars. The track literally brightens as it builds. The drop is the filter stopping its sweep.' },
      { who: 'Josh Wink — "Higher State of Consciousness"', note: 'Resonance near max, fast cutoff', what: 'The entire track is driven by a TB-303 with resonance pushed high and the cutoff modulating rapidly. That biological, almost vocal squeal is all filter resonance.' },
      { who: 'Lo-fi hip hop — Nujabes, J Dilla era', note: 'Cutoff very low, warm and muffled', what: 'A cutoff around 20% creates that warm, nostalgic, dusty sound — like music heard through a wall. The whole lo-fi aesthetic is a filter position.' },
      { who: 'Jon Hopkins — "Open Eye Signal"', note: 'Slow attack (8+ seconds)', what: 'Notes take many seconds to swell in. Slow attack turns melody into atmosphere — individual notes dissolve into a continuous landscape.' },
    ],
    tip: 'Set cutoff to 15%, resonance to 35%. Play the track. Now slowly drag cutoff to 80% over 30 seconds. That movement is the sound of a filter sweep — one of electronic music\'s most powerful tools.',
    nextLabel: 'Choose Your Key',
  },
  {
    id: 'scale', num: '05', title: 'Key & Scale', tagline: 'The harmonic language of your track',
    tidalComment: '-- Root note + scale mode',
    what: [
      'A scale is a set of notes that harmonically belong together. The root note is the tonal "home" — the note everything resolves to. The mode determines the emotional character: minor sounds darker and more tense, major is brighter and more resolved, dorian is minor with a hopeful raised 6th.',
      'The melody phrase you heard in step 3 shifts to your chosen key and scale. The highlighted keys on the keyboard show which notes belong to your scale. Every note in the piano roll is a scale degree — 0 is the root, 1 is the second note, etc. All combinations of in-scale notes sound intentional.',
    ],
    examples: [
      { who: 'Drake, The Weeknd, Kanye West', note: 'Minor Pentatonic', what: 'The most common scale in modern music. Five notes with no bad combinations — it\'s almost impossible to play a wrong note. Nearly all R&B and hip-hop lives here.' },
      { who: 'Daft Punk — "Get Lucky", Jamiroquai', note: 'Dorian', what: 'Minor with a raised 6th — dark but with a flicker of hope. That raised note is why Dorian sounds "cool" rather than sad. The scale of jazz-influenced dance music.' },
      { who: 'Gesaffelstein, NIN, dark techno', note: 'Natural Minor', what: 'Denser than pentatonic, more dramatic. The extra semitones add real menace. Phrygian (used in flamenco) takes this further with a very dark lowered 2nd.' },
      { who: 'Calvin Harris, Avicii, festival EDM', note: 'Major', what: 'Unambiguously bright. The major scale is the harmonic engine of pop-EDM — every note resolves happily into the root.' },
    ],
    tip: 'A Minor Pentatonic is in thousands of songs across every genre. If you\'re unsure, start there. If you want something more sophisticated, try Dorian — it has the depth of minor with a little light in it.',
    nextLabel: 'Write Your Melody',
  },
  {
    id: 'melody', num: '06', title: 'The Melody', tagline: 'A phrase that loops and hypnotises',
    tidalComment: '-- Melodic sequence: note pattern',
    what: [
      'Click any cell to place a note from your scale. The column is time (16 steps = one bar), the row is pitch (higher rows = higher notes). Click a filled cell to erase it. A note plays immediately so you hear it in context.',
      'In electronic music, repetition is the point — a two-bar loop heard for four minutes creates hypnosis, not boredom. Space is as musical as notes: leaving steps empty creates rhythm and breathing room. Try placing just 4 notes on the downbeats (steps 1, 5, 9, 13) and listen for 30 seconds before adding more.',
    ],
    examples: [
      { who: 'Larry Heard — "Can You Feel It"', note: 'Deep house, 3 notes total', what: 'One of the most emotionally powerful tracks in electronic music uses a handful of notes with enormous space between them. The gaps are the music.' },
      { who: 'Jeff Mills — "The Bells"', note: 'Single melodic hook, 10 minutes', what: 'One melodic phrase, relentlessly repeated with tiny variations. Techno uses repetition as ritual — after enough repetitions the loop becomes inevitable, unavoidable.' },
      { who: 'Aphex Twin — "Ageispolis"', note: 'Shifting, arpeggiated pattern', what: 'Notes on unusual steps — 3, 7, 11 — instead of the obvious downbeats. Placing notes off the grid creates rhythmic interest; the melody has its own internal pulse distinct from the kick.' },
      { who: 'Burial — "Archangel"', note: 'Vocal chops as melody', what: 'Even vocals become melodic loops in Burial\'s hands. The concept is the same — a short phrase, repeated, with space to breathe.' },
    ],
    tip: 'Start sparse: 4 notes only. Put them on steps 1, 5, 9, 13. Live with it for a minute. Most of the time you need fewer notes than you think — the space between them is where the emotion lives.',
    nextLabel: 'Your Track',
  },
];

// ─── Waveform SVG paths ────────────────────────────────────────────────────────
const WAVE_PATHS: Record<OscType, string> = {
  sine:     'M0,8 C4,8 4,0 9,0 C14,0 14,8 18,8 C22,8 22,16 27,16 C32,16 32,8 36,8',
  triangle: 'M0,8 L9,0 L18,8 L27,16 L36,8',
  sawtooth: 'M0,16 L18,0 L18,16 L36,0',
  square:   'M0,8 L0,0 L18,0 L18,16 L36,16 L36,8',
};

// ─── Drum groove presets ──────────────────────────────────────────────────────
type GroovePreset = 'house' | 'hiphop' | 'garage' | 'breakbeat';
const GROOVE_PRESETS: Record<GroovePreset, { label: string; kick: number[]; hat: number[]; clap: number[] }> = {
  house:     { label: 'House',      kick: [0,4,8,12],    hat: [2,6,10,14],           clap: [4,12] },
  hiphop:    { label: 'Hip-Hop',    kick: [0,6,8],       hat: [1,3,5,7,9,11,13,15],  clap: [4,12] },
  garage:    { label: 'UK Garage',  kick: [0,3,10,14],   hat: [2,6,10,14],           clap: [6,14] },
  breakbeat: { label: 'Breakbeat',  kick: [0,3,6,10,14], hat: [0,2,4,6,8,10,12,14],  clap: [4,10,14] },
};

// ─── Tidal notation helpers ───────────────────────────────────────────────────

function stepsToMini(steps: boolean[]): string {
  // Detect common patterns
  const ons = steps.map((v, i) => v ? i : -1).filter((i) => i >= 0);
  if (ons.length === 0) return '~ ~ ~ ~';
  if (JSON.stringify(ons) === JSON.stringify([0,4,8,12])) return 'bd*4';
  if (JSON.stringify(ons) === JSON.stringify([2,6,10,14])) return '~ hh ~ hh';
  if (JSON.stringify(ons) === JSON.stringify([4,12])) return '~ sn ~ sn';
  // Generic: map 16 steps to 4-beat groups
  const groups = [0,1,2,3].map((b) =>
    steps.slice(b*4, b*4+4).map((v) => v ? 'x' : '~').join('')
  );
  // If all groups identical, compress
  if (groups.every((g) => g === groups[0])) return groups[0].replace(/(.)/g, '$1 ').trim();
  return steps.map((v) => v ? 'x' : '~').join(' ');
}

function melodyToMini(melody: (number|null)[], scaleNotes: { label: string; hz: number }[]): string {
  const tokens = melody.map((n) => (n !== null && scaleNotes[n] ? scaleNotes[n].label : '~'));
  // Compress groups of ~ ~ ~ ~
  const compressed: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i] === '~') {
      let count = 0;
      while (i < tokens.length && tokens[i] === '~') { count++; i++; }
      if (count === 1) compressed.push('~');
      else compressed.push(`~*${count}`);
    } else {
      compressed.push(tokens[i]);
      i++;
    }
  }
  return compressed.join(' ');
}

interface TidalState {
  kickEnabled: boolean;
  hatsEnabled: boolean;
  melodyEnabled: boolean;
  drums: Record<DrumVoice, boolean[]>;
  osc: OscType;
  cutoff: number;
  res: number;
  attack: number;
  release: number;
  root: RootNote;
  scale: ScaleId;
  melody: (number | null)[];
  scaleNotes: { label: string; hz: number }[];
  showFilter: boolean;
  showScale: boolean;
}

function buildTidalLines(s: TidalState): { text: string; kind: 'comment'|'fn'|'method'|'str'|'num'|'plain' }[][] {
  const lines: { text: string; kind: 'comment'|'fn'|'method'|'str'|'num'|'plain' }[][] = [];

  const tok = (text: string, kind: 'comment'|'fn'|'method'|'str'|'num'|'plain') => ({ text, kind });

  if (s.kickEnabled || s.hatsEnabled) {
    // Drum line
    const parts: string[] = [];
    if (s.kickEnabled) parts.push(stepsToMini(s.drums.kick));
    if (s.hatsEnabled) {
      parts.push(stepsToMini(s.drums.hat));
      parts.push(stepsToMini(s.drums.clap));
    }
    const val = parts.join(', ');
    lines.push([tok('sound', 'fn'), tok('(', 'plain'), tok(`"${val}"`, 'str'), tok(')', 'plain')]);
  }

  if (s.melodyEnabled) {
    if (lines.length > 0) lines.push([tok('', 'plain')]);

    const notePat = melodyToMini(s.melody, s.scaleNotes);
    lines.push([tok('note', 'fn'), tok('(', 'plain'), tok(`"${notePat}"`, 'str'), tok(')', 'plain')]);

    if (s.showScale) {
      lines.push([tok('  .scale', 'method'), tok('(', 'plain'), tok(`"${s.root}4:${s.scale}"`, 'str'), tok(')', 'plain')]);
    }

    lines.push([tok('  .sound', 'method'), tok('(', 'plain'), tok(`"${s.osc}"`, 'str'), tok(')', 'plain')]);

    if (s.showFilter) {
      const cutHz = Math.round(300 + s.cutoff * 7700);
      const resVal = s.res.toFixed(2);
      const atkMs = Math.round(1 + s.attack * 399);
      const relMs = Math.round(40 + s.release * 1360);
      lines.push([tok('  .lpf', 'method'), tok('(', 'plain'), tok(`${cutHz}`, 'num'), tok(')', 'plain'),
                  tok('  // filter cutoff Hz', 'comment')]);
      lines.push([tok('  .resonance', 'method'), tok('(', 'plain'), tok(`${resVal}`, 'num'), tok(')', 'plain')]);
      lines.push([tok('  .attack', 'method'), tok('(', 'plain'), tok(`${atkMs}`, 'num'), tok(')', 'plain'),
                  tok('  // ms', 'comment')]);
      lines.push([tok('  .release', 'method'), tok('(', 'plain'), tok(`${relMs}`, 'num'), tok(')', 'plain'),
                  tok('  // ms', 'comment')]);
    }
  }

  return lines;
}

// ─── Mini keyboard ───────────────────────────────────────────────────────────
const WHITE_CHROMAS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEYS: { chroma: number; slot: number }[] = [
  { chroma: 1, slot: 0.58 }, { chroma: 3, slot: 1.58 },
  { chroma: 6, slot: 3.58 }, { chroma: 8, slot: 4.58 }, { chroma: 10, slot: 5.58 },
];
const WKW = 26, WKH = 60, BKW = 17, BKH = 37;

function MiniKeyboard({ inScale }: { inScale: Set<number> }) {
  return (
    <svg width={WHITE_CHROMAS.length * WKW} height={WKH} className="sl-keyboard" aria-hidden="true">
      {WHITE_CHROMAS.map((ch, i) => {
        const active = inScale.has(ch);
        return (
          <g key={ch}>
            <rect x={i * WKW + 1} y={1} width={WKW - 2} height={WKH - 2} rx={3}
              fill={active ? '#1200ff22' : '#1a1a1a'}
              stroke={active ? '#1200ff' : '#333'} strokeWidth={active ? 1.5 : 1} />
            {active && <circle cx={i * WKW + WKW / 2} cy={WKH - 9} r={3} fill="#1200ff" />}
          </g>
        );
      })}
      {BLACK_KEYS.map(({ chroma: ch, slot }) => (
        <rect key={ch} x={slot * WKW + (WKW - BKW) / 2} y={1} width={BKW} height={BKH} rx={2}
          fill={inScale.has(ch) ? '#1200ff' : '#111'}
          stroke={inScale.has(ch) ? '#4444ff' : '#1e1e1e'} strokeWidth={1} />
      ))}
      {WHITE_CHROMAS.map((ch, i) => (
        <text key={`n${ch}`} x={i * WKW + WKW / 2} y={WKH - 2}
          textAnchor="middle" fontSize="7" fill="#444" fontFamily="monospace">
          {ROOT_NOTES[ch]}
        </text>
      ))}
    </svg>
  );
}

// ─── Piano roll ──────────────────────────────────────────────────────────────
interface PianoRollProps {
  noteCount: number; noteLabels: string[];
  pattern: (number | null)[];
  current: number;
  onChange: (step: number, noteIdx: number | null) => void;
}
function PianoRoll({ noteCount, noteLabels, pattern, current, onChange }: PianoRollProps) {
  const rowH = 26, colW = 36, labelW = 40;
  const rows = Array.from({ length: noteCount }, (_, i) => noteCount - 1 - i);
  return (
    <div className="sl-roll-wrap">
      <div className="sl-roll">
        <div className="sl-roll-labels" style={{ width: labelW }}>
          {rows.map((ni) => (
            <div key={ni} className="sl-roll-label" style={{ height: rowH }}>{noteLabels[ni]}</div>
          ))}
        </div>
        <div className="sl-roll-grid">
          {rows.map((ni) => (
            <div key={ni} className="sl-roll-row" style={{ height: rowH }}>
              {Array.from({ length: 16 }, (_, step) => {
                const on = pattern[step] === ni;
                return (
                  <button key={step} type="button"
                    className={`sl-roll-cell${on ? ' is-on' : ''}${step === current ? ' is-now' : ''}${step % 4 === 0 ? ' is-beat' : ''}`}
                    style={{ width: colW, height: rowH }}
                    aria-pressed={on}
                    onClick={() => onChange(step, on ? null : ni)} />
                );
              })}
            </div>
          ))}
          {current >= 0 && (
            <div className="sl-roll-playhead"
              style={{ left: current * colW, height: noteCount * rowH, width: colW }} />
          )}
          {[4, 8, 12].map((b) => (
            <div key={b} className="sl-roll-beat-div"
              style={{ left: b * colW, height: noteCount * rowH }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Drum row ────────────────────────────────────────────────────────────────
interface DrumRowProps {
  label: string;
  pattern: boolean[];
  current: number;
  onToggle(i: number): void;
  onAudition(): void;
  locked?: boolean;
}
function DrumRow({ label, pattern, current, onToggle, onAudition, locked }: DrumRowProps) {
  return (
    <div className={`sl-drum-row${locked ? ' is-locked' : ''}`}>
      <button type="button" className="sl-drum-name" onClick={onAudition}
        disabled={locked} title={locked ? 'Added in previous step' : `Audition ${label}`}>
        {label}
      </button>
      <div className="sl-drum-steps">
        {pattern.map((on, i) => (
          <button key={i} type="button"
            className={`sl-pad${on ? ' is-on' : ''}${i === current ? ' is-now' : ''}${i % 4 === 0 ? ' is-beat' : ''}${locked ? ' is-locked' : ''}`}
            aria-pressed={on}
            disabled={locked}
            onClick={() => !locked && onToggle(i)} />
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtHz = (v: number) => { const h = Math.round(300 + v * 7700); return h >= 1000 ? `${(h/1000).toFixed(1)}k` : `${h}`; };
const fmtMs = (v: number, lo: number, hi: number) => `${Math.round(lo + v * (hi - lo))}ms`;

// ─── Tidal panel ─────────────────────────────────────────────────────────────
function TidalPanel({ lines, step }: { lines: ReturnType<typeof buildTidalLines>; step: number }) {
  const colorMap = {
    fn:      '#7dd3fc',
    method:  '#93c5fd',
    str:     '#86efac',
    num:     '#fcd34d',
    comment: '#6b7280',
    plain:   '#e2e8f0',
  };

  return (
    <div className="sl-tidal-panel">
      <div className="sl-tidal-label">
        <span className="sl-tidal-logo">▶</span>
        Pattern — Strudel / Tidal style
      </div>
      <pre className="sl-tidal-pre">
        <code>
          {lines.length === 0 ? (
            <span className="sl-tidal-empty">// Press Play to start building{'\n'}// your pattern here…</span>
          ) : (
            lines.map((line, li) => (
              <div key={li} className="sl-tidal-line">
                {line.map((tok, ti) => (
                  <span key={ti} style={{ color: colorMap[tok.kind] }}>{tok.text}</span>
                ))}
              </div>
            ))
          )}
        </code>
      </pre>
      <div className="sl-tidal-hint">
        Step {step + 1} of 7 — pattern grows as you add layers
      </div>
    </div>
  );
}

// ─── Layer status strip ───────────────────────────────────────────────────────
function LayerStrip({ kickActive, hatsActive, melodyActive }: { kickActive: boolean; hatsActive: boolean; melodyActive: boolean }) {
  const layers = [
    { label: 'Kick', active: kickActive },
    { label: 'Groove', active: hatsActive },
    { label: 'Melody', active: melodyActive },
  ];
  return (
    <div className="sl-layers">
      {layers.map(({ label, active }) => (
        <div key={label} className={`sl-layer-item${active ? ' is-active' : ''}`}>
          <span className="sl-layer-dot" />
          <span className="sl-layer-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SynthLab ─────────────────────────────────────────────────────────────────
export function SynthLab() {
  const engine = useMemo(() => new SynthEngine(), []);
  const raf = useRef(0);

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [bpm, setBpm] = useState(120);

  const [osc, setOsc] = useState<OscType>(DEFAULT_PARAMS.osc);
  const [cutoff, setCutoff] = useState(DEFAULT_PARAMS.cutoff);
  const [res, setRes] = useState(DEFAULT_PARAMS.res);
  const [attack, setAttack] = useState(DEFAULT_PARAMS.attack);
  const [release, setRelease] = useState(DEFAULT_PARAMS.release);

  const [root, setRoot] = useState<RootNote>('A');
  const [scale, setScale] = useState<ScaleId>('minor-pent');
  const [drums, setDrums] = useState(() => ({ ...engine.drums }));
  const [melody, setMelody] = useState<(number | null)[]>(() => [...engine.melody]);

  // Layer activation thresholds
  const kickActive = maxStep >= 0;
  const hatsActive = maxStep >= 1;
  const melodyActive = maxStep >= 2;

  // Sync engine params
  useEffect(() => { engine.bpm = bpm; }, [bpm, engine]);
  useEffect(() => { engine.params = { osc, cutoff, res, attack, release }; }, [osc, cutoff, res, attack, release, engine]);
  useEffect(() => { engine.root = root; engine.scale = scale; }, [root, scale, engine]);
  useEffect(() => { engine.drums = { ...drums }; }, [drums, engine]);
  useEffect(() => { engine.melody = [...melody]; }, [melody, engine]);

  const tick = () => {
    const q = engine.queue;
    pulse.kick *= 0.88;
    while (q.length && q[0].time <= engine.now) {
      const s = q.shift()!.step;
      if (engine.drums.kick[s] && engine.layerKick) pulse.kick = 1;
      setCurrent(s);
    }
    raf.current = requestAnimationFrame(tick);
  };

  const togglePlay = async () => {
    if (engine.playing) {
      engine.stop();
      cancelAnimationFrame(raf.current);
      pulse.kick = 0;
      setPlaying(false);
      setCurrent(-1);
    } else {
      engine.layerKick = kickActive;
      engine.layerHats = hatsActive;
      // Melody: if already activated previously, set immediately; else fade in on first enable
      if (melodyActive && !engine.layerMelody) {
        engine.layerMelody = true;
      } else if (!melodyActive) {
        engine.layerMelody = false;
      }
      await engine.start();
      setPlaying(true);
      raf.current = requestAnimationFrame(tick);
    }
  };

  // Advance to next step — enable new layers on the fly
  const advanceStep = () => {
    const next = step + 1;
    setStep(next);
    if (next > maxStep) {
      setMaxStep(next);
      if (playing) {
        if (next === 1) { engine.layerHats = true; }
        if (next === 2) { engine.enableMelody(); }
      }
    }
  };

  useEffect(() => () => { engine.stop(); cancelAnimationFrame(raf.current); pulse.kick = 0; }, [engine]);

  const scaleNotes = buildScale(root, scale);
  const keyboard = inScaleSet(root, scale);
  const noteLabels = scaleNotes.map((n) => n.label);
  const notesPlaced = melody.filter((n) => n !== null).length;

  const toggleDrum = (v: DrumVoice, i: number) =>
    setDrums((d) => ({ ...d, [v]: d[v].map((on, j) => (j === i ? !on : on)) }));

  const applyGroovePreset = (preset: GroovePreset) => {
    const p = GROOVE_PRESETS[preset];
    const makeRow = (ons: number[]) => Array.from({ length: 16 }, (_, i) => ons.includes(i));
    setDrums({ kick: makeRow(p.kick), hat: makeRow(p.hat), clap: makeRow(p.clap) });
  };

  const setMelodyCell = (step: number, noteIdx: number | null) =>
    setMelody((m) => m.map((v, i) => (i === step ? noteIdx : v)));

  // Build Tidal notation
  const tidalLines = buildTidalLines({
    kickEnabled: kickActive,
    hatsEnabled: hatsActive,
    melodyEnabled: melodyActive,
    drums,
    osc,
    cutoff, res, attack, release,
    root, scale,
    melody,
    scaleNotes,
    showFilter: maxStep >= 3,
    showScale: maxStep >= 4,
  });

  // ── Step content ──────────────────────────────────────────────────────────
  const TOTAL = STEP_DEFS.length + 1;
  const isFinal = step >= STEP_DEFS.length;
  const def = isFinal ? null : STEP_DEFS[step];

  const stepControls: React.ReactNode[] = [
    // Step 0 — PULSE: BPM
    <div className="sl-pulse-controls">
      <div className="sl-bpm-display">
        <button type="button" className="sl-bpm-btn" onClick={() => setBpm((b) => Math.max(60, b - 5))}>−</button>
        <div className="sl-bpm-readout">
          <span className="sl-bpm-num">{bpm}</span>
          <span className="sl-bpm-unit">BPM</span>
        </div>
        <button type="button" className="sl-bpm-btn" onClick={() => setBpm((b) => Math.min(200, b + 5))}>+</button>
      </div>
      <input type="range" className="sl-bpm-slider-full" min={60} max={200} value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))} />
      <div className="sl-bpm-genre-hints">
        {([60,85,120,140,174] as const).map((v) => {
          const labels: Record<number, string> = { 60: 'slow', 85: 'hip-hop', 120: 'house', 140: 'techno', 174: 'D&B' };
          return (
            <button key={v} type="button"
              className={`sl-bpm-preset${bpm === v ? ' is-active' : ''}`}
              onClick={() => setBpm(v)}>
              {v}<span className="sl-bpm-preset-label">{labels[v]}</span>
            </button>
          );
        })}
      </div>
      {!playing && (
        <button type="button" className="sl-start-cta" onClick={togglePlay}>
          ▶ Start the Beat
        </button>
      )}
    </div>,

    // Step 1 — GROOVE: drum machine
    <div>
      <div className="sl-groove-presets">
        {(Object.entries(GROOVE_PRESETS) as [GroovePreset, typeof GROOVE_PRESETS[GroovePreset]][]).map(([id, { label }]) => (
          <button key={id} type="button" className="sl-preset-btn"
            onClick={() => applyGroovePreset(id)}>{label}</button>
        ))}
      </div>
      <div className="sl-drum-machine">
        <DrumRow label="Kick" pattern={drums.kick} current={current} locked
          onToggle={(i) => toggleDrum('kick', i)}
          onAudition={() => engine.auditionDrum('kick')} />
        <DrumRow label="Hi-Hat" pattern={drums.hat} current={current}
          onToggle={(i) => toggleDrum('hat', i)}
          onAudition={() => engine.auditionDrum('hat')} />
        <DrumRow label="Clap" pattern={drums.clap} current={current}
          onToggle={(i) => toggleDrum('clap', i)}
          onAudition={() => engine.auditionDrum('clap')} />
      </div>
      <div className="sl-drum-footer">
        <button type="button" className="sl-btn-ghost"
          onClick={() => setDrums({ kick: Array(16).fill(false), hat: Array(16).fill(false), clap: Array(16).fill(false) })}>
          Clear
        </button>
      </div>
    </div>,

    // Step 2 — TONE: oscillator selector
    <div className="sl-osc-select">
      {(Object.keys(WAVE_PATHS) as OscType[]).map((t) => (
        <button key={t} type="button"
          className={`sl-osc-btn${osc === t ? ' is-active' : ''}`}
          onClick={() => setOsc(t)} aria-pressed={osc === t}>
          <svg viewBox="0 0 36 16" className="sl-wave-icon" aria-hidden="true">
            <path d={WAVE_PATHS[t]} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sl-osc-name">{t}</span>
        </button>
      ))}
    </div>,

    // Step 3 — SHAPE: filter + envelope
    <div className="sl-knobs-row">
      <Knob value={cutoff}  label="Cutoff"     display={fmtHz(cutoff) + 'Hz'}        onChange={setCutoff} />
      <Knob value={res}     label="Resonance"  display={(res * 100).toFixed(0) + '%'} onChange={setRes} />
      <Knob value={attack}  label="Attack"     display={fmtMs(attack, 1, 400)}        onChange={setAttack} />
      <Knob value={release} label="Release"    display={fmtMs(release, 40, 1400)}     onChange={setRelease} />
    </div>,

    // Step 4 — SCALE: key + mode
    <div className="sl-scale-controls">
      <div className="sl-scale-group">
        <div className="sl-control-label">Root note</div>
        <div className="sl-root-btns">
          {ROOT_NOTES.map((r) => (
            <button key={r} type="button"
              className={`sl-root-btn${root === r ? ' is-active' : ''}${r.includes('#') ? ' is-sharp' : ''}`}
              onClick={() => setRoot(r)} aria-pressed={root === r}>{r}</button>
          ))}
        </div>
      </div>
      <div className="sl-scale-group">
        <div className="sl-control-label">Scale mode</div>
        <select className="sl-scale-select" value={scale} onChange={(e) => setScale(e.target.value as ScaleId)}>
          {(Object.entries(SCALES) as [ScaleId, { label: string }][]).map(([id, { label }]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>
      <div className="sl-scale-group">
        <div className="sl-control-label">In-scale keys</div>
        <MiniKeyboard inScale={keyboard} />
      </div>
    </div>,

    // Step 5 — MELODY: piano roll
    <div>
      <PianoRoll noteCount={scaleNotes.length} noteLabels={noteLabels}
        pattern={melody} current={current}
        onChange={(s, ni) => {
          setMelodyCell(s, ni);
          if (ni !== null) engine.auditionNote(scaleNotes[ni].hz);
        }} />
      <div className="sl-roll-hint">
        {notesPlaced} note{notesPlaced !== 1 ? 's' : ''} placed &middot; click a filled cell to erase
      </div>
    </div>,
  ];

  return (
    <section id="sound" className="sl" aria-labelledby="sl-title">

      {/* ── Transport ────────────────────────────────────────────────────── */}
      <div className="sl-transport">
        <div className="sl-brand">
          <span className={`sl-led${playing ? ' is-on' : ''}`} aria-hidden="true" />
          <h1 id="sl-title" className="sl-brand-name">Synth Lab</h1>
          <span className="sl-brand-sub">
            {playing ? 'Playing' : 'Stopped'}
            {hatsActive && playing ? ' · groove' : ''}
            {melodyActive && playing ? ' · melody' : ''}
          </span>
        </div>
        <div className="sl-controls">
          <button type="button" className={`sl-play${playing ? ' is-playing' : ''}`}
            onClick={togglePlay} aria-pressed={playing}>
            {playing ? '■ Stop' : '▶ Play'}
          </button>
          <label className="sl-bpm-wrap" htmlFor="sl-bpm">
            <span className="sl-bpm-label">BPM</span>
            <input id="sl-bpm" type="range" className="sl-bpm-slider" min={60} max={200} value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))} />
            <output className="sl-bpm-val" htmlFor="sl-bpm">{bpm}</output>
          </label>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="sl-body">

        {/* ── Left: step content ──────────────────────────────────────── */}
        <div className="sl-main">
          {/* Progress dots */}
          <div className="sl-progress" role="navigation" aria-label="Tutorial steps">
            {Array.from({ length: TOTAL }, (_, i) => (
              <button key={i} type="button"
                className={`sl-prog-dot${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}${i > maxStep && i !== step ? ' is-locked' : ''}`}
                onClick={() => i <= maxStep && setStep(i)}
                aria-label={i < STEP_DEFS.length ? `Step ${i + 1}: ${STEP_DEFS[i].title}` : 'Your Track'}
                aria-current={i === step ? 'step' : undefined}
                disabled={i > maxStep}
              >
                <span>{i < STEP_DEFS.length ? STEP_DEFS[i].num : '07'}</span>
              </button>
            ))}
          </div>

          {/* Step frame */}
          {isFinal ? (
            <FinalStep
              osc={osc} root={root} scale={scale}
              notesPlaced={notesPlaced} playing={playing}
              cutoff={cutoff} res={res} attack={attack} release={release}
              onTogglePlay={togglePlay}
            />
          ) : def && (
            <div className="sl-step-frame">
              <header className="sl-step-hdr">
                <span className="sl-step-num-big">{def.num}</span>
                <div>
                  <h2 className="sl-step-title">{def.title}</h2>
                  <p className="sl-step-tagline">{def.tagline}</p>
                </div>
              </header>

              <div className="sl-step-body">
                <div className="sl-info-card">
                  {def.what.map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <div className="sl-controls-card">
                  <div className="sl-card-label">Try it</div>
                  {stepControls[step]}
                </div>

                <div className="sl-examples-card">
                  <div className="sl-card-label">Hear it in music</div>
                  {def.examples.map((ex, i) => (
                    <div key={i} className="sl-example">
                      <div className="sl-ex-head">
                        <span className="sl-ex-who">{ex.who}</span>
                        <span className="sl-ex-note">{ex.note}</span>
                      </div>
                      <p className="sl-ex-what">{ex.what}</p>
                    </div>
                  ))}
                </div>

                <div className="sl-tip-card">
                  <span className="sl-tip-label">Tip</span>
                  <span>{def.tip}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="sl-step-nav" aria-label="Step navigation">
            <button type="button" className="sl-nav-btn sl-nav-prev"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}>
              ← Back
            </button>
            {step < TOTAL - 1 && (
              <button type="button" className="sl-nav-btn sl-nav-next"
                onClick={advanceStep}>
                {step < STEP_DEFS.length - 1
                  ? `${def?.nextLabel ?? 'Next'} →`
                  : 'Your Track →'}
              </button>
            )}
          </nav>
        </div>

        {/* ── Right: Tidal panel + layers ─────────────────────────────── */}
        <div className="sl-aside">
          <TidalPanel lines={tidalLines} step={step} />
          <LayerStrip kickActive={kickActive} hatsActive={hatsActive} melodyActive={melodyActive} />
        </div>
      </div>
    </section>
  );
}

// ─── Final step ──────────────────────────────────────────────────────────────
interface FinalProps {
  osc: OscType; root: RootNote; scale: ScaleId;
  notesPlaced: number; playing: boolean;
  cutoff: number; res: number; attack: number; release: number;
  onTogglePlay: () => void;
}
function FinalStep({ osc, root, scale, notesPlaced, playing, cutoff, res, attack, release, onTogglePlay }: FinalProps) {
  const scaleLabel = SCALES[scale].label;
  const items = [
    { label: 'Oscillator', value: osc.charAt(0).toUpperCase() + osc.slice(1) },
    { label: 'Key / Scale', value: `${root} ${scaleLabel}` },
    { label: 'Filter cutoff', value: `${fmtHz(cutoff)}Hz` },
    { label: 'Resonance', value: `${Math.round(res * 100)}%` },
    { label: 'Attack', value: fmtMs(attack, 1, 400) },
    { label: 'Release', value: fmtMs(release, 40, 1400) },
    { label: 'Melody notes', value: `${notesPlaced} placed` },
  ];
  return (
    <div className="sl-step-frame">
      <header className="sl-step-hdr">
        <span className="sl-step-num-big">07</span>
        <div>
          <h2 className="sl-step-title">Your Track</h2>
          <p className="sl-step-tagline">Everything together — your original composition</p>
        </div>
      </header>
      <div className="sl-step-body">
        <div className="sl-info-card">
          <p>You\'ve built it from scratch — the same way Daft Punk built "Around the World," J Dilla built "Donuts," and every bedroom producer has built their first track. A kick drum, a groove, an oscillator, a filter, a key, a melody. Six decisions.</p>
          <p>The pattern panel shows your composition in Strudel / Tidal Cycles notation — a real music live-coding language used by artists worldwide. Your choices are now a program.</p>
        </div>
        <div className="sl-summary-card">
          <div className="sl-card-label">Your choices</div>
          <div className="sl-summary-grid">
            {items.map((it) => (
              <div key={it.label} className="sl-summary-row">
                <span className="sl-summary-label">{it.label}</span>
                <span className="sl-summary-value">{it.value}</span>
              </div>
            ))}
          </div>
        </div>
        <button type="button"
          className={`sl-big-play${playing ? ' is-playing' : ''}`}
          onClick={onTogglePlay}>
          {playing ? '■ Stop' : '▶ Play Your Track'}
        </button>
      </div>
    </div>
  );
}
