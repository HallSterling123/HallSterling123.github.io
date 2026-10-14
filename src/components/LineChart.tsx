import { useId, useMemo, useState } from 'react';
import type { LineChart as Spec } from '../content';

// Validated series colors (blue, orange) on the chart's own white panel. The panel
// keeps a white surface in both site themes, so the pair stays legible either way.
const COLORS = ['#1200ff', '#e0662b'];

const W = 640;
const H = 340;
const M = { top: 20, right: 104, bottom: 48, left: 52 };

/** A small line chart with direct labels, a hover crosshair and a table view. */
export function LineChart({ spec }: { spec: Spec }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const xMin = spec.x[0];
  const xMax = spec.x[spec.x.length - 1];
  const px = (x: number) => M.left + ((x - xMin) / (xMax - xMin)) * (W - M.left - M.right);
  const py = (y: number) => H - M.bottom - (y / spec.yMax) * (H - M.top - M.bottom);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * spec.yMax);
  const step = (xMax - xMin) / 9 > 10 ? 20 : 10;
  const xTicks = Array.from({ length: Math.floor((xMax - xMin) / step) + 1 }, (_, i) => xMin + i * step);
  const fmt = (v: number) => `${Math.round(v * 10) / 10}${spec.yUnit ?? ''}`;

  const paths = useMemo(
    () =>
      spec.series.map((s) => {
        let d = '';
        let pen = false;
        s.values.forEach((v, i) => {
          if (v === null) { pen = false; return; }
          d += `${pen ? 'L' : 'M'}${px(spec.x[i]).toFixed(1)},${py(v).toFixed(1)}`;
          pen = true;
        });
        return d;
      }),
    [spec], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Direct label at each series' last point. A series that runs to the right edge is
  // labelled in the margin; one that stops early is labelled above and to the left of
  // its last point, so it stays clear of the other lines.
  const labels = spec.series.map((s, k) => {
    let i = s.values.length - 1;
    while (i > 0 && s.values[i] === null) i--;
    const atEnd = i === s.values.length - 1;
    const x = px(spec.x[i]);
    const y = py(s.values[i] ?? 0);
    return atEnd
      ? { k, x: x + 10, y, anchor: 'start' as const }
      : { k, x: x - 8, y: y - 14, anchor: 'end' as const };
  });

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = xMin + ((e.clientX - r.left) / r.width) * (xMax - xMin);
    let best = 0;
    spec.x.forEach((v, i) => { if (Math.abs(v - x) < Math.abs(spec.x[best] - x)) best = i; });
    setHover(best);
  };

  const tip = hover === null ? null : {
    x: px(spec.x[hover]),
    rows: spec.series.map((s, k) => ({ name: s.name, v: s.values[hover], k })),
  };

  return (
    <figure className="lc" aria-labelledby={`${id}-t`}>
      <figcaption className="lc-head">
        <span id={`${id}-t`} className="lc-title">{spec.title}</span>
        <button type="button" className="lc-toggle" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}>
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </figcaption>

      {showTable ? (
        <div className="lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr><th scope="col">{spec.xLabel}</th>{spec.series.map((s) => <th scope="col" key={s.name}>{s.name}</th>)}</tr>
            </thead>
            <tbody>
              {spec.x.map((x, i) => (
                <tr key={x}>
                  <th scope="row">{x}{spec.xUnit}</th>
                  {spec.series.map((s) => <td key={s.name}>{s.values[i] === null ? 'Not run' : fmt(s.values[i] as number)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="lc-plot">
          <ul className="lc-legend">
            {spec.series.map((s, k) => (
              <li key={s.name}>
                <svg width="22" height="8" aria-hidden="true">
                  <line x1="1" y1="4" x2="21" y2="4" stroke={COLORS[k]} strokeWidth="2" strokeDasharray={s.dashed ? '5 4' : undefined} strokeLinecap="round" />
                </svg>
                {s.name}
              </li>
            ))}
          </ul>
          <svg viewBox={`0 0 ${W} ${H}`} className="lc-svg" role="img" aria-label={`${spec.title}. Use Show table for the values.`}>
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={W - M.right} y1={py(t)} y2={py(t)} className="lc-grid" />
                <text x={M.left - 8} y={py(t)} className="lc-tick" textAnchor="end" dominantBaseline="middle">{t}{spec.yUnit}</text>
              </g>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={px(t)} y={H - M.bottom + 18} className="lc-tick" textAnchor="middle">{t}{spec.xUnit}</text>
            ))}
            <text x={(M.left + W - M.right) / 2} y={H - 8} className="lc-axis" textAnchor="middle">{spec.xLabel}</text>

            {tip && <line x1={tip.x} x2={tip.x} y1={M.top} y2={H - M.bottom} className="lc-cross" />}

            {spec.series.map((s, k) => (
              <g key={s.name}>
                <path d={paths[k]} fill="none" stroke={COLORS[k]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? '7 5' : undefined} />
                {s.values.map((v, i) => v === null ? null : (
                  <circle key={i} cx={px(spec.x[i])} cy={py(v)} r={hover === i ? 5 : 3.5} fill={COLORS[k]} stroke="#ffffff" strokeWidth="2" />
                ))}
              </g>
            ))}

            {labels.map((l) => (
              <text key={l.k} x={l.x} y={l.y} textAnchor={l.anchor} className="lc-label" dominantBaseline="middle">{spec.series[l.k].name}</text>
            ))}

            <rect
              x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom}
              fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)}
            />
          </svg>

          {tip && (
            <div className="lc-tip" style={{ left: `${(tip.x / W) * 100}%` }} role="status">
              <span className="lc-tip-x">{spec.x[hover!]}{spec.xUnit} {spec.xLabel.toLowerCase()}</span>
              {tip.rows.map((r) => (
                <span key={r.name} className="lc-tip-row">
                  <i style={{ background: COLORS[r.k] }} aria-hidden="true" />
                  {r.name}: {r.v === null ? 'not run' : fmt(r.v)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {spec.caption && <p className="lc-caption">{spec.caption}</p>}
    </figure>
  );
}
