import { useEffect, useMemo, useRef, useState } from 'react';
import { DrumMachine, type Voice } from '../audio';
import { pulse } from '../pulse';
import { WaveField } from './WaveField';

const VOICES: { id: Voice; label: string }[] = [
  { id: 'kick', label: 'Kick' },
  { id: 'hat', label: 'Hat' },
  { id: 'clap', label: 'Clap' },
  { id: 'bleep', label: 'Acid' },
];
const GROUPS = [0, 1, 2, 3];
const row = (on: number[]) => Array.from({ length: 16 }, (_, i) => on.includes(i));

const DEFAULT: Record<Voice, boolean[]> = {
  kick: row([0, 4, 8, 12]),
  hat: row([2, 6, 10, 14]),
  clap: row([4, 12]),
  bleep: row([0, 3, 6, 10, 11, 14]),
};

const STORE_KEY = 'seq-pattern-v1';
const clonePattern = (p: Record<Voice, boolean[]>) =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [...v]])) as Record<Voice, boolean[]>;

function load(): Record<Voice, boolean[]> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (VOICES.every((v) => Array.isArray(p[v.id]) && p[v.id].length === 16)) return p;
    }
  } catch {
    /* storage unavailable: use the default groove */
  }
  return clonePattern(DEFAULT);
}

export function Sequencer() {
  const [pattern, setPattern] = useState(load);
  const [bpm, setBpm] = useState(128);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const machine = useMemo(() => new DrumMachine(pattern), []); // eslint-disable-line react-hooks/exhaustive-deps
  const raf = useRef(0);

  useEffect(() => {
    machine.pattern = pattern;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(pattern));
    } catch {
      /* ignore */
    }
  }, [pattern, machine]);

  useEffect(() => {
    machine.bpm = bpm;
  }, [bpm, machine]);

  useEffect(
    () => () => {
      machine.stop();
      cancelAnimationFrame(raf.current);
      pulse.kick = 0;
    },
    [machine],
  );

  const tick = () => {
    const q = machine.queue;
    pulse.kick *= 0.88;
    while (q.length && q[0].time <= machine.now) {
      const s = q.shift()!.step;
      if (machine.pattern.kick[s]) pulse.kick = 1;
      setCurrent(s);
    }
    raf.current = requestAnimationFrame(tick);
  };

  const toggleTransport = async () => {
    if (machine.playing) {
      machine.stop();
      cancelAnimationFrame(raf.current);
      pulse.kick = 0;
      setPlaying(false);
      setCurrent(-1);
    } else {
      await machine.start();
      setPlaying(true);
      raf.current = requestAnimationFrame(tick);
    }
  };

  const toggle = (v: Voice, i: number) =>
    setPattern((p) => ({ ...p, [v]: p[v].map((on, j) => (j === i ? !on : on)) }));
  const clear = () => setPattern({ kick: row([]), hat: row([]), clap: row([]), bleep: row([]) });
  const reset = () => setPattern(clonePattern(DEFAULT));

  return (
    <section id="sound" className="sound" aria-labelledby="sound-title">
      <WaveField gap={12} className="sound-waves" dot={false} />
      <div className="sound-inner">
        <div className="sound-head">
          <h1 id="sound-title" className="tag">Sound</h1>
          <p className="sound-lede">
            Code you can hear. Write a pattern, press start, and watch the lines move with the kick.
          </p>
        </div>

        <div className="seq">
          <div className="seq-top">
            <button
              type="button"
              id="transport"
              className={`btn-start ${playing ? 'is-on' : ''}`}
              onClick={toggleTransport}
              aria-pressed={playing}
            >
              <span className="led" aria-hidden="true" />
              {playing ? 'Stop' : 'Start'}
            </button>
            <label className="tempo" htmlFor="tempo">
              <span>BPM</span>
              <input id="tempo" type="range" min={100} max={150} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
              <output htmlFor="tempo">{bpm}</output>
            </label>
          </div>

          <div className="grid" role="group" aria-label="16-step pattern">
            {VOICES.map((v) => (
              <div className="track" key={v.id}>
                <button type="button" className="track-name" onClick={() => machine.audition(v.id)} title={`Hear the ${v.label.toLowerCase()}`}>
                  {v.label}
                </button>
                <div className="steps">
                  {GROUPS.map((g) => (
                    <div className="group" key={g}>
                      {pattern[v.id].slice(g * 4, g * 4 + 4).map((on, k) => {
                        const i = g * 4 + k;
                        return (
                          <button
                            type="button"
                            key={i}
                            className={`pad ${on ? 'on' : ''} ${current === i ? 'now' : ''}`}
                            aria-pressed={on}
                            aria-label={`${v.label}, step ${i + 1}`}
                            onClick={() => toggle(v.id, i)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="seq-foot">
            <p>Tap a row name to hear that sound alone.</p>
            <div className="seq-actions">
              <button type="button" className="btn-text" onClick={clear}>Clear</button>
              <button type="button" className="btn-text" onClick={reset}>Reset groove</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
