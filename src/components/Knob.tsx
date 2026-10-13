import { useRef } from 'react';

interface KnobProps {
  value: number;        // 0–1 normalised
  label: string;
  display: string;      // formatted value string shown below the knob
  onChange: (v: number) => void;
}

const SIZE = 56;
const R = 19;
const CX = SIZE / 2;
const CY = SIZE / 2;

/** Clockwise degrees from 12-o'clock → SVG {x, y}. */
function polar(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + R * Math.sin(rad), y: CY - R * Math.cos(rad) };
}

// Min knob position = 225° (7-o'clock), max = 495° ≡ 135° (5-o'clock), range 270°.
const P_MIN = polar(225);
const P_MAX = polar(135);  // same as polar(495)

export function Knob({ value, label, display, onChange }: KnobProps) {
  const drag = useRef<{ y0: number; v0: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    drag.current = { y0: e.clientY, v0: value };
    svgRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const delta = (drag.current.y0 - e.clientY) / 110;
    onChange(Math.max(0, Math.min(1, drag.current.v0 + delta)));
  };
  const onPointerUp = () => { drag.current = null; };

  const arcDeg = value * 270;
  const endPt = polar(225 + arcDeg);
  const largeArc = arcDeg > 180 ? 1 : 0;

  // Full-range track
  const track = `M ${P_MIN.x.toFixed(2)} ${P_MIN.y.toFixed(2)} A ${R} ${R} 0 1 1 ${P_MAX.x.toFixed(2)} ${P_MAX.y.toFixed(2)}`;
  // Active arc
  const active = value > 0.005
    ? `M ${P_MIN.x.toFixed(2)} ${P_MIN.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${endPt.x.toFixed(2)} ${endPt.y.toFixed(2)}`
    : null;

  return (
    <div className="sl-knob">
      <svg
        ref={svgRef}
        width={SIZE} height={SIZE}
        className="sl-knob-svg"
        style={{ touchAction: 'none', cursor: 'ns-resize' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Track ring */}
        <path d={track} fill="none" stroke="#2c2c2c" strokeWidth="3.5" strokeLinecap="round" />
        {/* Active fill */}
        {active && (
          <path d={active} fill="none" stroke="#1200ff" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {/* Tip dot */}
        <circle cx={endPt.x} cy={endPt.y} r="2.8" fill="#1200ff" />
        {/* Centre cap */}
        <circle cx={CX} cy={CY} r="8" fill="#181818" stroke="#333" strokeWidth="1.5" />
      </svg>
      <div className="sl-knob-display">{display}</div>
      <div className="sl-knob-label">{label}</div>
    </div>
  );
}
