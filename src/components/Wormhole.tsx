import { useEffect, useRef, type MouseEvent } from 'react';
import { navigate } from '../transition';

type Props = { href: string; kicker: string; title: string };

const easeInCubic = (t: number) => t * t * t;

/**
 * A gravity well seen from a low angle: concentric, very flat rings that slowly shrink
 * toward a wide central hole, with dots orbiting each ring. Rings bunch up and brighten
 * at the rim, then drop out of sight. The text sits in the middle of the hole.
 * Hovering speeds it up; clicking dives in, the page fades, and the link opens.
 * Colour comes from the CSS var --hole.
 */
export function Wormhole({ href, kicker, title }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ speed: 1, target: 1, dive: 0, diving: false });

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const RINGS = 90;
    const DOTS = 5200;
    const HOLE_Y = 0.5; // vertical position of the hole, as a share of the section height
    const RIM_FLAT = 0.22; // height-to-width ratio of the hole's rim
    let w = 0, h = 0, raf = 0, running = false, last = 0, color = '#ffffff';
    const holeRx = () => Math.max(170, w * 0.2);

    // each ring has a phase 0..1: 0 = far outside the screen, 1 = at the rim of the hole
    const rings = Array.from({ length: RINGS }, (_, i) => i / RINGS);
    const dots = Array.from({ length: DOTS }, () => ({
      ring: Math.floor(Math.random() * RINGS),
      a: Math.random() * Math.PI * 2,
      s: 0.5 + Math.random(),
      r: 0.97 + Math.random() * 0.06,
    }));

    const geom = (p: number) => {
      const hole = holeRx(); // rim half-width
      const outer = Math.max(w * 1.25, 900);
      // exponential spacing: rings get closer together near the rim
      const rx = hole * Math.pow(outer / hole, 1 - p);
      const k = (rx - hole) / (outer - hole); // 0 at rim, 1 far out
      const ry = rx * (RIM_FLAT + 0.1 * k); // outer rings open up a little
      const cy = h * HOLE_Y - k * h * 0.06; // outer rings sit a little higher
      let alpha = 1;
      if (p < 0.15) alpha = p / 0.15;
      if (p > 0.95) alpha = Math.max(0, (1 - p) / 0.05);
      const glow = 0.25 + 0.75 * (1 - k) ** 2; // brighter toward the rim
      return { cx: w / 2, cy, rx, ry, alpha, glow };
    };

    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = getComputedStyle(c).getPropertyValue('--hole').trim() || color;
      // tell the text where the hole is and how big it is, so it always fits inside
      const host = c.parentElement!;
      host.style.setProperty('--hole-cy', `${(h * HOLE_Y).toFixed(1)}px`);
      host.style.setProperty('--hole-rx', `${holeRx().toFixed(1)}px`);
      host.style.setProperty('--hole-ry', `${(holeRx() * RIM_FLAT).toFixed(1)}px`);
      draw(0);
    };

    const draw = (dt: number) => {
      const st = state.current;
      st.speed += (st.target - st.speed) * 0.05;
      const v = st.speed * (1 + st.dive * 10);
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      if (st.dive > 0) {
        const z = 1 + easeInCubic(st.dive) * 4;
        ctx.translate(w / 2, h * HOLE_Y);
        ctx.scale(z, z);
        ctx.translate(-w / 2, -h * HOLE_Y);
      }

      const gs = rings.map((p, i) => {
        rings[i] = (p + dt * 0.00002 * v) % 1;
        return geom(rings[i]);
      });

      ctx.strokeStyle = color;
      ctx.lineWidth = 0.75;
      for (const g of gs) {
        if (g.alpha <= 0.01) continue;
        ctx.globalAlpha = g.alpha * g.glow * 0.35;
        ctx.beginPath();
        ctx.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = color;
      for (const d of dots) {
        const g = gs[d.ring];
        if (g.alpha <= 0.02) continue;
        // inner rings orbit faster
        d.a += dt * 0.00012 * v * d.s * Math.pow(900 / g.rx, 0.7);
        const sin = Math.sin(d.a);
        const x = g.cx + Math.cos(d.a) * g.rx * d.r;
        const y = g.cy + sin * g.ry * d.r;
        if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue;
        // near side of each ring (lower half) reads brighter than the far side
        ctx.globalAlpha = g.alpha * (0.35 + 0.65 * g.glow) * (sin > 0 ? 1 : 0.55);
        const s = 1.1 + g.glow * 0.9;
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const loop = (time: number) => {
      const dt = last ? Math.min(50, time - last) : 16;
      last = time;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };

    // let the rings settle into place before the first frame shows
    for (let i = 0; i < RINGS; i++) rings[i] = (rings[i] + 0.003) % 1;

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return;
      if (e.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    });
    io.observe(c);
    const mo = new MutationObserver(() => {
      color = getComputedStyle(c).getPropertyValue('--hole').trim() || color;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-contrast'] });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const st = state.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(href);
      return;
    }
    if (st.diving) return;
    st.diving = true;
    e.currentTarget.classList.add('is-diving');
    const t0 = performance.now();
    const tick = (now: number) => {
      st.dive = Math.min(1, (now - t0) / 1200);
      if (st.dive < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // start the page fade partway into the dive so the two blend
    navigate(href, { delay: 450 });
  };

  return (
    <a
      className="wormhole"
      href={href}
      onClick={onClick}
      onPointerEnter={() => { state.current.target = 2.5; }}
      onPointerLeave={() => { state.current.target = 1; }}
      onFocus={() => { state.current.target = 2.5; }}
      onBlur={() => { state.current.target = 1; }}
    >
      <canvas ref={canvas} className="wormhole-canvas" aria-hidden="true" />
      <span className="wormhole-copy">
        <span className="wormhole-kicker">{kicker}</span>
        <span className="wormhole-title">{title}</span>
      </span>
    </a>
  );
}
