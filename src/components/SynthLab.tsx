import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SynthEngine, buildScale, inScaleSet,
  ROOT_NOTES, SCALES,
  DEFAULT_PARAMS,
  type OscType, type DrumVoice, type RootNote, type ScaleId,
} from '../synth';
import { Knob } from './Knob';
import { pulse } from '../pulse';

// ─── Step content data ───────────────────────────────────────────────────────

interface Example { who: string; note: string; what: string }
interface StepDef {
  num: string;
  title: string;
  tagline: string;
  what: string[];
  examples: Example[];
  tip: string;
  nextLabel: string;
}

const STEPS: StepDef[] = [
  {
    num: '01', title: 'The Oscillator', tagline: 'Where every synthesiser sound begins',
    what: [
      'An oscillator generates a repeating waveform. Its shape determines the raw character of your sound — everything else on a synthesiser starts from here.',
      'Sawtooth waves are bright and harmonically rich. Square waves are hollow and digital. Triangle is a softer middle ground. Sine is pure — a single frequency with no harmonics at all.',
    ],
    examples: [
      { who: 'Daft Punk — "Around the World"', note: 'Sawtooth', what: 'That driving bass riff is a sawtooth oscillator through a moving filter. The buzz of the wave is what makes it cut through everything else.' },
      { who: 'Kraftwerk — "Computer World"', note: 'Square', what: 'Square waves give a hollow, digital, unmistakably electronic quality. The whole record sounds like a machine having thoughts.' },
      { who: 'Hans Zimmer — "Time" (Inception OST)', note: 'Sine', what: 'The swelling pads are stacked sine waves. Pure, smooth, no edge — just emotion in its most elemental form.' },
      { who: 'Phuture — "Acid Tracks"', note: 'Sawtooth + filter', what: 'The Roland TB-303 uses a sawtooth through a resonant filter. That wobbling squeal started acid house and is still everywhere in electronic music.' },
    ],
    tip: 'When in doubt, start with Sawtooth. It has the richest harmonic content for the filter to carve — you can always remove brightness, but you can\'t add what was never there.',
    nextLabel: 'The Filter',
  },
  {
    num: '02', title: 'The Filter', tagline: 'Carving brightness and warmth from raw sound',
    what: [
      'A lowpass filter passes frequencies below the Cutoff point and removes everything above it. Roll the cutoff down and the sound becomes warm and dark; open it up and it\'s bright and aggressive. This single knob is the most expressive control on most synthesisers.',
      'Resonance adds a peak right at the cutoff frequency. A little gives character; too much creates a ringing squeal. The sweep from low cutoff to high cutoff — especially with some resonance — is one of the most recognisable moves in electronic music.',
    ],
    examples: [
      { who: 'Classic house (Larry Heard, Frankie Knuckles)', note: 'Slow cutoff sweep', what: 'Opening the filter slowly over 8–16 bars is a core production technique. The track literally brightens as tension builds toward the drop.' },
      { who: 'Phuture — "Acid Tracks", Josh Wink — "Higher State of Consciousness"', note: 'High resonance, rapid cutoff', what: 'Acid house is built entirely on this: sawtooth + resonance pushed near maximum, cutoff moving fast. Almost biological.' },
      { who: 'Lo-fi hip hop (Nujabes, J Dilla era)', note: 'Low cutoff', what: 'A very low cutoff — basically muffled — gives that warm, dusty, nostalgic quality. Like hearing music through a closed door.' },
      { who: 'Trance leads (Armin van Buuren, Tiësto)', note: 'Cutoff fully open', what: 'Open filter, high resonance. Designed to cut through at 140dB. Every frequency is present and fighting for space.' },
    ],
    tip: 'For a classic build-up: set cutoff to 20–25% and resonance to ~30%, then hold your melody. Slowly open the cutoff over 8 bars. That single movement can carry an entire section.',
    nextLabel: 'Envelope',
  },
  {
    num: '03', title: 'The Envelope', tagline: 'How a sound is born and fades over time',
    what: [
      'An envelope shapes how the volume of a note changes over time. Attack controls how long it takes to reach full volume from silence — fast for a punchy pluck, slow for a swell. Release controls how long it fades after the note ends.',
      'These two parameters alone can transform the same oscillator into completely different instruments. The same sawtooth wave can sound like a plucked string, a pad, or an organ depending solely on the envelope.',
    ],
    examples: [
      { who: 'Kygo, Thomas Jack — tropical house leads', note: 'Fast attack, medium release', what: 'That characteristic plucky guitar-like synth is nearly instant attack with a medium release. Each note arrives with punch and decays naturally.' },
      { who: 'Jon Hopkins — "Open Eye Signal"', note: 'Slow attack, long release', what: 'The pads take multiple seconds to reach full volume. Slow attack creates anticipation; long release blurs notes together into an atmosphere.' },
      { who: 'Daft Punk — "Superheroes" chord stabs', note: 'Fast attack, short release', what: 'Almost zero attack, almost zero release. Hard on, hard off — that punchy, percussive stab feel.' },
      { who: 'Brian Eno — "Music for Airports"', note: 'Very slow attack, very long release', what: 'Notes take so long to swell in and out that individual sounds dissolve into a continuous texture. The envelope turns notes into weather.' },
    ],
    tip: 'Try setting Attack to 50% and playing the melody. Notice how the same phrase feels completely different — slower attacks make even aggressive waveforms sound gentle and dreamy.',
    nextLabel: 'Key & Scale',
  },
  {
    num: '04', title: 'Key & Scale', tagline: 'The harmonic language of your track',
    what: [
      'A scale is a set of notes that sound good together — a shared vocabulary for your track. The root note is the harmonic "home" that everything else orbits. The mode determines emotional character: minor scales feel darker and more tense, major scales feel brighter and more resolved.',
      'In electronic music most producers work within scales intuitively, without naming them. The pentatonic scales (5 notes) are especially common: with only 5 notes, every combination sounds intentional — there are no bad intervals to land on.',
    ],
    examples: [
      { who: 'Drake, The Weeknd, Kanye West — virtually all hip-hop & R&B', note: 'Minor Pentatonic', what: 'The most common scale in modern music. Five notes, no wrong combinations, immediately emotive. Nearly every soul sample and rap melody lives here.' },
      { who: 'Daft Punk — "Get Lucky", Jamiroquai, classic funk-house', note: 'Dorian mode', what: 'Minor with a raised 6th — dark but slightly hopeful. That raised note gives Dorian its characteristic "cool" quality. The scale of jazz-influenced dance music.' },
      { who: 'Gesaffelstein, Nine Inch Nails, dark techno', note: 'Natural Minor', what: 'Denser and more dramatic than the pentatonic version. The extra notes create real menace and unresolved tension.' },
      { who: 'Calvin Harris, Avicii, festival EDM', note: 'Major', what: 'Unambiguously bright and euphoric. The major scale is the harmonic engine of pop EDM — every note resolves happily.' },
      { who: 'Burial, Shackleton, some Arca', note: 'Phrygian', what: 'A lowered 2nd degree creates an almost Arabic or flamenco quality. Used for music that needs real unease rather than just sadness.' },
    ],
    tip: 'Start with A Minor Pentatonic — A, C, D, E, G. It\'s in thousands of songs across every genre. Any of these 5 notes in any order sounds like it belongs.',
    nextLabel: 'Melody',
  },
  {
    num: '05', title: 'The Melody', tagline: 'A phrase that loops and hypnotises',
    what: [
      'A melodic sequence loops a short phrase. In electronic music, repetition is the point — a two-bar loop heard for four minutes creates hypnosis, not boredom. Each pass lets the listener absorb more detail, until the phrase becomes inevitable.',
      'Space is as musical as notes. Leaving steps empty creates rhythm, breathing room, and tension. A four-note melody with twelve rests is often more powerful than sixteen crowded steps. Click a cell to place a note from your scale; click it again to erase. Placing a note plays it immediately so you can hear it in context.',
    ],
    examples: [
      { who: 'Larry Heard — "Can You Feel It"', note: 'Deep house, minimal', what: 'A handful of notes with enormous space between them. The gaps are the music — the absence creates anticipation that the next note resolves.' },
      { who: 'Jeff Mills — "The Bells"', note: 'Techno, repetition', what: 'One melodic hook, relentlessly repeated over 10 minutes with tiny variations. Techno uses repetition as a ritual — the loop becomes a mantra.' },
      { who: 'Chicane — "Saltwater", ATB — "9 PM"', note: 'Trance, melodic arc', what: 'Long, breathing notes over 8 bars. Trance melodies use space differently — sustained notes, each held long enough to feel like a statement.' },
      { who: 'J. Cole, MF DOOM — sample-based hip-hop', note: 'Looped phrase', what: 'A short 2-bar melodic loop becomes the hook the entire track orbits. Repetition builds the phrase into something bigger than any of its individual notes.' },
    ],
    tip: 'Start sparse. Place 4 notes — on beats 1, 5, 9, 13 — and live with it for 30 seconds. You might find you don\'t need to add anything. The space is the personality.',
    nextLabel: 'The Beat',
  },
  {
    num: '06', title: 'The Beat', tagline: 'The pulse everything else orbits around',
    what: [
      'In 4/4 time a bar has 4 beats, each divided into 4 sixteenth notes — 16 total. The kick drum and snare/clap define the groove; their placement determines whether a track feels like house, hip-hop, garage, or something entirely new. Click a voice name to hear it in isolation.',
      'Most electronic music uses a small number of foundational patterns. Recognising them — and understanding why they create the feeling they do — is one of the fastest ways to understand why different genres feel different in your body.',
    ],
    examples: [
      { who: 'Frankie Knuckles, Jeff Mills, Daft Punk — house & techno', note: '4-on-the-floor kick', what: 'Kick on every beat (steps 1, 5, 9, 13). The most powerful pulse in club music — your body knows exactly where the beat is at all times. Certainty is the energy.' },
      { who: 'J Dilla, Pete Rock, Madlib — boom-bap hip-hop', note: 'Kick 1+3, snare 2+4', what: 'Kick on the 1 and 3, snare on 2 and 4. J Dilla\'s genius was pushing these slightly late — the "Dilla feel" is snares that drag just behind the grid.' },
      { who: 'Craig David, The Streets, UK Garage', note: '2-step / syncopated', what: 'The kick avoids the obvious. A stumbling, syncopated groove that feels different to house despite similar tempos — the body can\'t predict it, so it has to feel it.' },
      { who: 'The Prodigy, Chemical Brothers — big beat', note: 'Breakbeat', what: 'A sampled funk drum break creates an uneven, human, organic rhythm that no programmed grid can fully replicate. That tension between human and machine is the whole sound.' },
    ],
    tip: 'Start with kick on 1, 5, 9, 13 and clap on 5 and 13. Add hi-hat on every even step (2, 4, 6...). Once that feels solid, try removing individual kick hits — the gaps between kick beats become as important as the beats themselves.',
    nextLabel: 'Play Your Track',
  },
];

// ─── Waveform SVG paths (viewBox 0 0 36 16, centre y=8) ─────────────────────
const WAVE_PATHS: Record<OscType, string> = {
  sine:     'M0,8 C4,8 4,0 9,0 C14,0 14,8 18,8 C22,8 22,16 27,16 C32,16 32,8 36,8',
  triangle: 'M0,8 L9,0 L18,8 L27,16 L36,8',
  sawtooth: 'M0,16 L18,0 L18,16 L36,0',
  square:   'M0,8 L0,0 L18,0 L18,16 L36,16 L36,8',
};
const OSC_DESCRIPTIONS: Record<OscType, string> = {
  sawtooth: 'Bright, buzzy, rich — best all-rounder',
  square:   'Hollow, digital, 8-bit character',
  triangle: 'Softer than saw, rounder than square',
  sine:     'Pure tone, smooth, no harmonics',
};

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
  const rowH = 26, colW = 42, labelW = 44;
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
interface DrumRowProps { label: string; pattern: boolean[]; current: number; onToggle(i: number): void; onAudition(): void }
function DrumRow({ label, pattern, current, onToggle, onAudition }: DrumRowProps) {
  return (
    <div className="sl-drum-row">
      <button type="button" className="sl-drum-name" onClick={onAudition}>{label}</button>
      <div className="sl-drum-steps">
        {pattern.map((on, i) => (
          <button key={i} type="button"
            className={`sl-pad${on ? ' is-on' : ''}${i === current ? ' is-now' : ''}${i % 4 === 0 ? ' is-beat' : ''}`}
            aria-pressed={on} onClick={() => onToggle(i)} />
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtHz = (v: number) => { const h = Math.round(300 + v * 7700); return h >= 1000 ? `${(h/1000).toFixed(1)}k` : `${h}`; };
const fmtMs = (v: number, lo: number, hi: number) => `${Math.round(lo + v * (hi - lo))}ms`;

// ─── Step frame: shared shell ─────────────────────────────────────────────────
interface StepFrameProps { def: StepDef; controls: React.ReactNode }
function StepFrame({ def, controls }: StepFrameProps) {
  return (
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

        <div className="sl-controls-card">
          <div className="sl-card-label">Try it</div>
          {controls}
        </div>

        <div className="sl-tip-card">
          <span className="sl-tip-label">Tip</span>
          <span>{def.tip}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Final step ──────────────────────────────────────────────────────────────
interface FinalProps {
  osc: OscType; root: RootNote; scale: ScaleId;
  notesPlaced: number; playing: boolean; onPlay: () => void;
  cutoff: number; res: number; attack: number; release: number;
}
function FinalStep({ osc, root, scale, notesPlaced, playing, onPlay, cutoff, res, attack, release }: FinalProps) {
  const scaleLabel = SCALES[scale].label;
  const items = [
    { label: 'Oscillator', value: osc.charAt(0).toUpperCase() + osc.slice(1) },
    { label: 'Filter cutoff', value: `${fmtHz(cutoff)}Hz` },
    { label: 'Resonance', value: `${Math.round(res * 100)}%` },
    { label: 'Attack', value: fmtMs(attack, 1, 400) },
    { label: 'Release', value: fmtMs(release, 40, 1400) },
    { label: 'Key', value: `${root} ${scaleLabel}` },
    { label: 'Melody notes', value: `${notesPlaced} placed` },
  ];
  return (
    <div className="sl-step-frame">
      <header className="sl-step-hdr">
        <span className="sl-step-num-big">07</span>
        <div>
          <h2 className="sl-step-title">Your Track</h2>
          <p className="sl-step-tagline">Everything working together</p>
        </div>
      </header>
      <div className="sl-step-body">
        <div className="sl-info-card">
          <p>You've worked through every building block that professional electronic producers use — the same tools Daft Punk, J Dilla, and Brian Eno used to make everything from "Around the World" to "Music for Airports." The oscillator was your raw material; the filter and envelope shaped it into an instrument; the scale gave you a harmonic language; the melody created a phrase; the rhythm gave it a pulse.</p>
          <p>Hit play. Everything you configured runs together. Adjust anything in real time — changes take effect immediately. Come back to any step if you want to experiment further.</p>
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
        <button
          type="button"
          className={`sl-big-play${playing ? ' is-playing' : ''}`}
          onClick={onPlay}
        >
          {playing ? '■ Stop' : '▶ Play Your Track'}
        </button>
      </div>
    </div>
  );
}

// ─── SynthLab ─────────────────────────────────────────────────────────────────
export function SynthLab() {
  const engine = useMemo(() => new SynthEngine(), []);
  const raf = useRef(0);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [bpm, setBpm] = useState(128);

  const [osc, setOsc] = useState<OscType>(DEFAULT_PARAMS.osc);
  const [cutoff, setCutoff] = useState(DEFAULT_PARAMS.cutoff);
  const [res, setRes] = useState(DEFAULT_PARAMS.res);
  const [attack, setAttack] = useState(DEFAULT_PARAMS.attack);
  const [release, setRelease] = useState(DEFAULT_PARAMS.release);

  const [root, setRoot] = useState<RootNote>('A');
  const [scale, setScale] = useState<ScaleId>('minor-pent');

  const [drums, setDrums] = useState(() => ({ ...engine.drums }));
  const [melody, setMelody] = useState<(number | null)[]>(() => [...engine.melody]);

  // Sync engine
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
      if (engine.drums.kick[s]) pulse.kick = 1;
      setCurrent(s);
    }
    raf.current = requestAnimationFrame(tick);
  };

  const togglePlay = async () => {
    if (engine.playing) {
      engine.stop(); cancelAnimationFrame(raf.current);
      pulse.kick = 0; setPlaying(false); setCurrent(-1);
    } else {
      await engine.start(); setPlaying(true);
      raf.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => () => { engine.stop(); cancelAnimationFrame(raf.current); pulse.kick = 0; }, [engine]);

  const scaleNotes = buildScale(root, scale);
  const keyboard = inScaleSet(root, scale);
  const noteLabels = scaleNotes.map((n) => n.label);
  const notesPlaced = melody.filter((n) => n !== null).length;

  const toggleDrum = (v: DrumVoice, i: number) =>
    setDrums((d) => ({ ...d, [v]: d[v].map((on, j) => (j === i ? !on : on)) }));

  const setMelodyCell = (step: number, noteIdx: number | null) =>
    setMelody((m) => m.map((v, i) => (i === step ? noteIdx : v)));

  const resetGroove = () => {
    const defaultDrums = {
      kick: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false] as boolean[],
      hat:  [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false] as boolean[],
      clap: [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false] as boolean[],
    };
    const defaultMelody: (number|null)[] = Array(16).fill(null);
    defaultMelody[0]=0; defaultMelody[2]=2; defaultMelody[4]=4; defaultMelody[6]=2;
    defaultMelody[8]=0; defaultMelody[10]=3; defaultMelody[12]=4; defaultMelody[14]=1;
    setDrums(defaultDrums);
    setMelody(defaultMelody);
  };

  // Step-specific controls
  const TOTAL = STEPS.length + 1; // +1 for final
  const totalSteps = TOTAL;

  const stepControls: React.ReactNode[] = [
    // 0: Oscillator
    <div className="sl-osc-select">
      {(Object.keys(WAVE_PATHS) as OscType[]).map((t) => (
        <button key={t} type="button"
          className={`sl-osc-btn${osc === t ? ' is-active' : ''}`}
          onClick={() => setOsc(t)} aria-pressed={osc === t}>
          <svg viewBox="0 0 36 16" className="sl-wave-icon" aria-hidden="true">
            <path d={WAVE_PATHS[t]} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sl-osc-name">{t}</span>
          <span className="sl-osc-desc">{OSC_DESCRIPTIONS[t]}</span>
        </button>
      ))}
    </div>,

    // 1: Filter
    <div className="sl-knobs-row">
      <Knob value={cutoff} label="Cutoff" display={fmtHz(cutoff) + 'Hz'} onChange={setCutoff} />
      <Knob value={res}    label="Resonance" display={(res * 100).toFixed(0) + '%'} onChange={setRes} />
    </div>,

    // 2: Envelope
    <div className="sl-knobs-row">
      <Knob value={attack}  label="Attack"  display={fmtMs(attack, 1, 400)}    onChange={setAttack} />
      <Knob value={release} label="Release" display={fmtMs(release, 40, 1400)} onChange={setRelease} />
    </div>,

    // 3: Scale
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
          {(Object.entries(SCALES) as [ScaleId, {label:string}][]).map(([id, {label}]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>
      <div className="sl-scale-group">
        <div className="sl-control-label">In-scale keys</div>
        <MiniKeyboard inScale={keyboard} />
      </div>
    </div>,

    // 4: Melody
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

    // 5: Drums
    <div>
      <div className="sl-drum-machine">
        {(['kick', 'hat', 'clap'] as DrumVoice[]).map((v) => (
          <DrumRow key={v}
            label={v === 'kick' ? 'Kick' : v === 'hat' ? 'Hi-Hat' : 'Clap'}
            pattern={drums[v]} current={current}
            onToggle={(i) => toggleDrum(v, i)}
            onAudition={() => engine.auditionDrum(v)} />
        ))}
      </div>
      <div className="sl-drum-footer">
        <button type="button" className="sl-btn-ghost"
          onClick={() => setDrums({ kick: Array(16).fill(false), hat: Array(16).fill(false), clap: Array(16).fill(false) })}>
          Clear
        </button>
        <button type="button" className="sl-btn-ghost" onClick={resetGroove}>Reset</button>
      </div>
    </div>,
  ];

  return (
    <section id="sound" className="sl" aria-labelledby="sl-title">
      {/* Transport — always visible */}
      <div className="sl-transport">
        <div className="sl-brand">
          <span className={`sl-led${playing ? ' is-on' : ''}`} aria-hidden="true" />
          <h1 id="sl-title" className="sl-brand-name">Synth Lab</h1>
        </div>
        <div className="sl-controls">
          <button type="button" className={`sl-play${playing ? ' is-playing' : ''}`}
            onClick={togglePlay} aria-pressed={playing}>
            {playing ? '■ Stop' : '▶ Play'}
          </button>
          <label className="sl-bpm-wrap" htmlFor="sl-bpm">
            <span className="sl-bpm-label">BPM</span>
            <input id="sl-bpm" type="range" className="sl-bpm-slider" min={80} max={160} value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))} />
            <output className="sl-bpm-val" htmlFor="sl-bpm">{bpm}</output>
          </label>
        </div>
      </div>

      {/* Tutorial body */}
      <div className="sl-tutorial">
        {/* Progress */}
        <div className="sl-progress" role="navigation" aria-label="Tutorial steps">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button key={i} type="button"
              className={`sl-prog-dot${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}${i < STEPS.length ? ': ' + STEPS[i].title : ': Your Track'}`}
              aria-current={i === step ? 'step' : undefined}
            >
              <span>{i < STEPS.length ? STEPS[i].num : '07'}</span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="sl-step-wrap">
          {step < STEPS.length ? (
            <StepFrame def={STEPS[step]} controls={stepControls[step]} />
          ) : (
            <FinalStep
              osc={osc} root={root} scale={scale}
              notesPlaced={notesPlaced} playing={playing} onPlay={togglePlay}
              cutoff={cutoff} res={res} attack={attack} release={release}
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="sl-step-nav" aria-label="Step navigation">
          <button type="button" className="sl-nav-btn sl-nav-prev"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}>
            ← Back
          </button>
          {step < totalSteps - 1 && (
            <button type="button" className="sl-nav-btn sl-nav-next"
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}>
              {step < STEPS.length - 1
                ? `Next: ${STEPS[step + 1].title} →`
                : 'Play Your Track →'}
            </button>
          )}
        </nav>
      </div>
    </section>
  );
}
