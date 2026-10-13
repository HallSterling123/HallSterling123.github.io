import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SynthEngine, buildScale, inScaleSet,
  ROOT_NOTES, SCALES,
  DEFAULT_PARAMS,
  type OscType, type DrumVoice, type RootNote, type ScaleId,
} from '../synth';
import { Knob } from './Knob';
import { pulse } from '../pulse';

// ─── Waveform SVG paths (viewBox 0 0 36 16, centre y=8) ─────────────────────
const WAVE_PATHS: Record<OscType, string> = {
  sine:     'M0,8 C4,8 4,0 9,0 C14,0 14,8 18,8 C22,8 22,16 27,16 C32,16 32,8 36,8',
  triangle: 'M0,8 L9,0 L18,8 L27,16 L36,8',
  sawtooth: 'M0,16 L18,0 L18,16 L36,0',
  square:   'M0,8 L0,0 L18,0 L18,16 L36,16 L36,8',
};

// ─── Mini keyboard (1 chromatic octave) ────────────────────────────────────
const WHITE_CHROMAS = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
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
            <rect
              x={i * WKW + 1} y={1} width={WKW - 2} height={WKH - 2} rx={3}
              fill={active ? '#1200ff22' : '#1a1a1a'}
              stroke={active ? '#1200ff' : '#333'}
              strokeWidth={active ? 1.5 : 1}
            />
            {active && (
              <circle cx={i * WKW + WKW / 2} cy={WKH - 9} r={3} fill="#1200ff" />
            )}
          </g>
        );
      })}
      {BLACK_KEYS.map(({ chroma: ch, slot }) => {
        const active = inScale.has(ch);
        return (
          <rect
            key={ch}
            x={slot * WKW + (WKW - BKW) / 2} y={1}
            width={BKW} height={BKH} rx={2}
            fill={active ? '#1200ff' : '#111'}
            stroke={active ? '#4444ff' : '#1e1e1e'}
            strokeWidth={1}
          />
        );
      })}
      {/* Note names below white keys */}
      {WHITE_CHROMAS.map((ch, i) => (
        <text key={`n${ch}`} x={i * WKW + WKW / 2} y={WKH - 2}
          textAnchor="middle" fontSize="7" fill="#444" fontFamily="monospace">
          {ROOT_NOTES[ch]}
        </text>
      ))}
    </svg>
  );
}

// ─── Piano roll melody editor ────────────────────────────────────────────────
interface PianoRollProps {
  noteCount: number;
  noteLabels: string[];
  pattern: (number | null)[];
  current: number;
  onChange: (step: number, noteIdx: number | null) => void;
}

function PianoRoll({ noteCount, noteLabels, pattern, current, onChange }: PianoRollProps) {
  const rowH = 26, colW = 42, labelW = 44;
  const rows = Array.from({ length: noteCount }, (_, i) => noteCount - 1 - i); // top = highest

  return (
    <div className="sl-roll-wrap">
      <div className="sl-roll" style={{ '--roll-cols': 16, '--col-w': `${colW}px`, '--row-h': `${rowH}px` } as React.CSSProperties}>
        {/* Row labels */}
        <div className="sl-roll-labels" style={{ width: labelW }}>
          {rows.map((noteIdx) => (
            <div key={noteIdx} className="sl-roll-label" style={{ height: rowH }}>
              {noteLabels[noteIdx]}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="sl-roll-grid">
          {rows.map((noteIdx) => (
            <div key={noteIdx} className="sl-roll-row" style={{ height: rowH }}>
              {Array.from({ length: 16 }, (_, step) => {
                const on = pattern[step] === noteIdx;
                const isActive = step === current;
                return (
                  <button
                    key={step}
                    type="button"
                    className={`sl-roll-cell${on ? ' is-on' : ''}${isActive ? ' is-now' : ''}${(step % 4 === 0) ? ' is-beat' : ''}`}
                    style={{ width: colW, height: rowH }}
                    aria-pressed={on}
                    onClick={() => onChange(step, on ? null : noteIdx)}
                  />
                );
              })}
            </div>
          ))}
          {/* Playhead overlay */}
          {current >= 0 && (
            <div
              className="sl-roll-playhead"
              style={{ left: current * colW, height: noteCount * rowH, width: colW }}
            />
          )}
          {/* Beat dividers */}
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
  onToggle: (i: number) => void;
  onAudition: () => void;
}

function DrumRow({ label, pattern, current, onToggle, onAudition }: DrumRowProps) {
  return (
    <div className="sl-drum-row">
      <button type="button" className="sl-drum-name" onClick={onAudition}>{label}</button>
      <div className="sl-drum-steps">
        {pattern.map((on, i) => (
          <button
            key={i}
            type="button"
            className={`sl-pad${on ? ' is-on' : ''}${i === current ? ' is-now' : ''}${(i % 4 === 0) ? ' is-beat' : ''}`}
            aria-pressed={on}
            onClick={() => onToggle(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Format helpers ─────────────────────────────────────────────────────────
const fmtHz = (v: number) => {
  const hz = Math.round(300 + v * 7700);
  return hz >= 1000 ? `${(hz / 1000).toFixed(1)}k` : `${hz}`;
};
const fmtMs = (v: number, minMs: number, maxMs: number) =>
  `${Math.round(minMs + v * (maxMs - minMs))}ms`;

// ─── SynthLab (main component) ───────────────────────────────────────────────
export function SynthLab() {
  const engine = useMemo(() => new SynthEngine(), []);
  const raf = useRef(0);

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

  // Keep engine in sync with state
  useEffect(() => { engine.bpm = bpm; }, [bpm, engine]);
  useEffect(() => { engine.params = { osc, cutoff, res, attack, release }; }, [osc, cutoff, res, attack, release, engine]);
  useEffect(() => { engine.root = root; engine.scale = scale; }, [root, scale, engine]);
  useEffect(() => { engine.drums = { ...drums }; }, [drums, engine]);
  useEffect(() => { engine.melody = [...melody]; }, [melody, engine]);

  // Animation loop: consume the engine queue to drive the step indicator
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

  const toggleDrum = (v: DrumVoice, i: number) =>
    setDrums((d) => ({ ...d, [v]: d[v].map((on, j) => (j === i ? !on : on)) }));

  const setMelodyCell = (step: number, noteIdx: number | null) =>
    setMelody((m) => m.map((v, i) => (i === step ? noteIdx : v)));

  const clearAll = () => {
    setDrums({ kick: Array(16).fill(false), hat: Array(16).fill(false), clap: Array(16).fill(false) });
    setMelody(Array(16).fill(null));
  };

  const scaleLabel = SCALES[scale].label;

  return (
    <section id="sound" className="sl" aria-labelledby="sl-title">
      {/* ── Transport ── */}
      <div className="sl-transport">
        <div className="sl-brand">
          <span className={`sl-led${playing ? ' is-on' : ''}`} aria-hidden="true" />
          <h1 id="sl-title" className="sl-brand-name">Synth Lab</h1>
          <span className="sl-brand-sub">build your track · learn why it works</span>
        </div>
        <div className="sl-controls">
          <button
            type="button"
            className={`sl-play${playing ? ' is-playing' : ''}`}
            onClick={togglePlay}
            aria-pressed={playing}
          >
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

      {/* ── 01 · Voice ── */}
      <div className="sl-module">
        <div className="sl-module-head">
          <span className="sl-step-num">01</span>
          <h2 className="sl-module-title">Voice</h2>
          <p className="sl-module-desc">
            Oscillator type shapes the raw tone &middot; Filter removes high frequencies &middot; Envelope controls how each note grows and fades
          </p>
        </div>
        <div className="sl-voice-grid">
          {/* Oscillator */}
          <div className="sl-voice-section">
            <div className="sl-section-label">Oscillator</div>
            <div className="sl-osc-btns">
              {(Object.keys(WAVE_PATHS) as OscType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`sl-osc-btn${osc === t ? ' is-active' : ''}`}
                  onClick={() => setOsc(t)}
                  aria-pressed={osc === t}
                >
                  <svg viewBox="0 0 36 16" className="sl-wave-icon" aria-hidden="true">
                    <path d={WAVE_PATHS[t]} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="sl-voice-section">
            <div className="sl-section-label">Filter</div>
            <div className="sl-knobs-row">
              <Knob value={cutoff} label="Cutoff" display={fmtHz(cutoff) + 'Hz'} onChange={setCutoff} />
              <Knob value={res} label="Reso" display={(res * 100).toFixed(0) + '%'} onChange={setRes} />
            </div>
          </div>

          {/* Envelope */}
          <div className="sl-voice-section">
            <div className="sl-section-label">Envelope</div>
            <div className="sl-knobs-row">
              <Knob value={attack} label="Attack" display={fmtMs(attack, 1, 400)} onChange={setAttack} />
              <Knob value={release} label="Release" display={fmtMs(release, 40, 1400)} onChange={setRelease} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 02 · Key & Scale ── */}
      <div className="sl-module">
        <div className="sl-module-head">
          <span className="sl-step-num">02</span>
          <h2 className="sl-module-title">Key &amp; Scale</h2>
          <p className="sl-module-desc">
            A scale is a set of notes that sound good together &middot; <strong>{scaleLabel}</strong> notes are lit on the keyboard below
          </p>
        </div>
        <div className="sl-scale-grid">
          <div className="sl-scale-pickers">
            <div className="sl-scale-group">
              <div className="sl-section-label">Root note</div>
              <div className="sl-root-btns">
                {ROOT_NOTES.map((r) => (
                  <button key={r} type="button"
                    className={`sl-root-btn${root === r ? ' is-active' : ''}${r.includes('#') ? ' is-sharp' : ''}`}
                    onClick={() => setRoot(r)}
                    aria-pressed={root === r}
                  >{r}</button>
                ))}
              </div>
            </div>
            <div className="sl-scale-group">
              <div className="sl-section-label">Scale mode</div>
              <select className="sl-scale-select" value={scale} onChange={(e) => setScale(e.target.value as ScaleId)}>
                {(Object.entries(SCALES) as [ScaleId, { label: string }][]).map(([id, { label }]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="sl-keyboard-wrap">
            <MiniKeyboard inScale={keyboard} />
            <p className="sl-keyboard-hint">
              Lit keys are in <strong>{root} {scaleLabel}</strong> &middot; click any note in the melody grid below to hear it
            </p>
          </div>
        </div>
      </div>

      {/* ── 03 · Melody ── */}
      <div className="sl-module">
        <div className="sl-module-head">
          <span className="sl-step-num">03</span>
          <h2 className="sl-module-title">Melody</h2>
          <p className="sl-module-desc">
            Each column is one 16th note &middot; rows are scale pitches (higher = top) &middot; click to place a note, click again to erase &middot; silence is part of the rhythm
          </p>
        </div>
        <PianoRoll
          noteCount={scaleNotes.length}
          noteLabels={noteLabels}
          pattern={melody}
          current={current}
          onChange={(step, noteIdx) => {
            setMelodyCell(step, noteIdx);
            if (noteIdx !== null) engine.auditionNote(scaleNotes[noteIdx].hz);
          }}
        />
      </div>

      {/* ── 04 · Rhythm ── */}
      <div className="sl-module">
        <div className="sl-module-head">
          <span className="sl-step-num">04</span>
          <h2 className="sl-module-title">Rhythm</h2>
          <p className="sl-module-desc">
            16 sixteenth notes = 1 bar &middot; Kick on every beat (1·5·9·13), Clap on 2+4 (5·13) is the foundation of most electronic music &middot; click a voice name to audition it
          </p>
        </div>
        <div className="sl-drum-machine">
          {(['kick', 'hat', 'clap'] as DrumVoice[]).map((v) => (
            <DrumRow
              key={v}
              label={v === 'kick' ? 'Kick' : v === 'hat' ? 'Hi-Hat' : 'Clap'}
              pattern={drums[v]}
              current={current}
              onToggle={(i) => toggleDrum(v, i)}
              onAudition={() => engine.auditionDrum(v)}
            />
          ))}
        </div>
        <div className="sl-drum-footer">
          <button type="button" className="sl-btn-ghost" onClick={clearAll}>Clear all</button>
          <button type="button" className="sl-btn-ghost" onClick={() => {
            setDrums({ ...engine.drums });
            setMelody([...engine.melody]);
            engine.drums = {
              kick: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
              hat:  [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
              clap: [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
            };
            engine.melody = ((): (number|null)[] => {
              const m: (number|null)[] = Array(16).fill(null);
              m[0]=0;m[2]=2;m[4]=4;m[6]=2;m[8]=0;m[10]=3;m[12]=4;m[14]=1;
              return m;
            })();
            setDrums({ ...engine.drums });
            setMelody([...engine.melody]);
          }}>Reset groove</button>
        </div>
      </div>
    </section>
  );
}
