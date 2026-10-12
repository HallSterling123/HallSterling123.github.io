import { useEffect, useRef } from 'react';
import { createNoise2D } from '../noise';
import { pulse } from '../pulse';

type Props = {
  /** Horizontal distance between lines, px. */
  gap?: number;
  className?: string;
  /** Show a dot that trails the cursor. */
  dot?: boolean;
};

type Pt = { x: number; y: number; wx: number; wy: number; cx: number; cy: number; vx: number; vy: number };

/**
 * A field of vertical lines. Each point is pushed around by flowing simplex noise,
 * and the cursor drags a wake through the lines: points near it pick up velocity
 * in the direction the cursor moves, then spring back. Kicks from the drum machine
 * stir the noise harder. Colour comes from the CSS var --wave.
 */
export function WaveField({ gap = 10, className = '', dot = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const noise = createNoise2D();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0, running = false, color = '#1200ff';
    let lines: Pt[][] = [];

    // mouse: raw (x,y), smoothed (sx,sy), last smoothed (lx,ly), smoothed speed (vs), heading (a)
    const m = { x: -1, y: 0, sx: -1, sy: 0, lx: 0, ly: 0, v: 0, vs: 0, a: 0, set: false };

    const readColor = () => {
      color = getComputedStyle(c).getPropertyValue('--wave').trim() || color;
    };

    const build = () => {
      lines = [];
      const yGap = 8;
      const cols = Math.ceil((w + 200) / gap);
      const rows = Math.ceil((h + 60) / yGap);
      const x0 = (w - gap * cols) / 2;
      for (let i = 0; i <= cols; i++) {
        const pts: Pt[] = [];
        for (let j = 0; j <= rows; j++) {
          pts.push({ x: x0 + gap * i, y: -30 + yGap * j, wx: 0, wy: 0, cx: 0, cy: 0, vx: 0, vy: 0 });
        }
        lines.push(pts);
      }
    };

    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColor();
      build();
      step(performance.now(), true);
    };

    const step = (time: number, drawOnly = false) => {
      // smooth the cursor and measure its speed
      if (m.set) {
        if (m.sx < 0) { m.sx = m.lx = m.x; m.sy = m.ly = m.y; }
        m.sx += (m.x - m.sx) * 0.1;
        m.sy += (m.y - m.sy) * 0.1;
        const dx = m.sx - m.lx, dy = m.sy - m.ly;
        m.v = Math.hypot(dx, dy);
        m.vs += (m.v - m.vs) * 0.1;
        m.vs = Math.min(100, m.vs);
        m.lx = m.sx; m.ly = m.sy;
        if (m.v > 0.01) m.a = Math.atan2(dy, dx);
      }

      const stir = 1 + pulse.kick * 0.7;
      const t = time * (1 + pulse.kick * 0.5);
      const reach = Math.max(175, m.vs);

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const pts of lines) {
        for (let j = 0; j < pts.length; j++) {
          const p = pts[j];
          if (!drawOnly) {
            const n = noise((p.x + t * 0.0125) * 0.002, (p.y + t * 0.005) * 0.0015) * 12 * stir;
            p.wx = Math.cos(n) * 32;
            p.wy = Math.sin(n) * 16;

            if (m.set) {
              const dx = p.x - m.sx, dy = p.y - m.sy;
              const d = Math.hypot(dx, dy);
              if (d < reach) {
                const s = 1 - d / reach;
                const f = Math.cos(d * 0.001) * s;
                p.vx += Math.cos(m.a) * f * reach * m.vs * 0.00065;
                p.vy += Math.sin(m.a) * f * reach * m.vs * 0.00065;
              }
            }
            p.vx += -p.cx * 0.005;
            p.vy += -p.cy * 0.005;
            p.vx *= 0.925;
            p.vy *= 0.925;
            p.cx = Math.max(-100, Math.min(100, p.cx + p.vx * 2));
            p.cy = Math.max(-100, Math.min(100, p.cy + p.vy * 2));
          }
          const X = p.x + p.wx + p.cx;
          const Y = p.y + p.wy + p.cy;
          if (j === 0) ctx.moveTo(X, Y);
          else ctx.lineTo(X, Y);
        }
      }
      ctx.stroke();

      if (dot && m.set) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(m.sx, m.sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (time: number) => {
      step(time);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
      m.set = true;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return;
      if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(loop); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    });
    io.observe(c);
    const mo = new MutationObserver(readColor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-contrast'] });
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });
    else {
      // still frame for reduced motion
      requestAnimationFrame(() => step(performance.now()));
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [gap, dot]);

  return <canvas ref={ref} className={`wavefield ${className}`} aria-hidden="true" />;
}
