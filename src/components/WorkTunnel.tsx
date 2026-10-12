import { useEffect, useRef, useState } from 'react';
import type { Entry } from '../content';

/**
 * A tall section with a pinned blue panel. Scrolling flies the camera through the
 * project cards. Positions are written straight to the DOM from one animation loop
 * (no React re-render per scroll event), and depth stays well inside the perspective
 * distance so cards never cross the camera plane and vanish.
 */
export function WorkTunnel({ entries }: { entries: Entry[] }) {
  const sec = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [still, setStill] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const n = entries.length;
  const years = entries.map((e) => (e.start ?? '').slice(0, 4));
  const yearRef = useRef<HTMLSpanElement>(null);
  const SPAN = n - 1; // camera travel, in cards

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setStill(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (still) return;
    const el = sec.current!;
    let target = 0, current = -1, raf = 0, running = false, lastActive = -1;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };

    const apply = (p: number) => {
      const pos = p * SPAN;
      for (let i = 0; i < n; i++) {
        const c = cards.current[i];
        if (!c) continue;
        const d = pos - i; // <0 ahead, 0 in focus, >0 passing the camera
        let z: number, o: number;
        if (d <= 0) {
          z = Math.max(d, -3) * 650;
          o = d < -2.4 ? 0 : Math.min(1, (2.4 + d) / 1.2);
        } else {
          z = Math.min(d, 1) * 500;
          o = Math.max(0, 1 - d / 0.55);
        }
        const x = (i % 2 === 0 ? -1 : 1) * Math.min(1, Math.abs(d)) * 12;
        const y = Math.max(-1, Math.min(1, d)) * -4;
        c.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}vw), calc(-50% + ${y.toFixed(2)}vh), ${z.toFixed(1)}px)`;
        c.style.opacity = o.toFixed(3);
        c.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        const focus = Math.abs(d) < 0.5;
        c.style.pointerEvents = focus ? 'auto' : 'none';
      }
      const active = Math.min(n - 1, Math.max(0, Math.round(pos)));
      if (active !== lastActive && count.current) {
        count.current.textContent = `${String(active + 1).padStart(2, '0')}/${String(n).padStart(2, '0')}`;
        if (yearRef.current) yearRef.current.textContent = years[active] || '';
        lastActive = active;
      }
      if (bar.current) bar.current.style.transform = `scaleY(${p.toFixed(4)})`;
    };

    const loop = () => {
      const delta = target - current;
      current = Math.abs(delta) < 0.0005 ? target : current + delta * 0.14;
      apply(current);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        measure();
        if (current < 0) current = target;
        raf = requestAnimationFrame(loop);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(el);

    measure();
    current = target;
    apply(current);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [still, n, SPAN]);

  // Keyboard users: tabbing to a card scrolls the tunnel until that card is in front.
  const focusCard = (i: number) => {
    const el = sec.current;
    if (still || !el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (SPAN > 0 ? (i / SPAN) * total : 0), behavior: 'auto' });
  };

  return (
    <section
      id="work"
      ref={sec}
      className={`tunnel ${still ? 'is-still' : ''}`}
      style={{ ['--cards' as string]: n }}
      aria-labelledby="work-title"
    >
      <div className="tunnel-pin">
        <h2 id="work-title" className="sr-only">Experience</h2>
        <p className="tunnel-bg" aria-hidden="true"><span ref={yearRef}>{years[0]}</span></p>

        <ol className="tunnel-scene">
          {entries.map((r, i) => (
            <li key={r.slug}>
              <a
                ref={(el) => { cards.current[i] = el; }}
                className="card"
                href={`#work-${r.slug}`}
                onFocus={() => focusCard(i)}
              >
                <span className="card-top">
                  <span className="card-cat tag">{r.period}</span>
                  <span className="card-kind">{r.kind}</span>
                </span>
                <span className="card-title">{r.title}</span>
                <span className="card-meta">{r.role}{r.place ? `, ${r.place}` : ''}</span>
                <span className="card-blurb">{r.blurb}</span>
                <span className="card-open">Read more</span>
              </a>
            </li>
          ))}
        </ol>

        <p className="tunnel-hint" aria-hidden="true">
          <span ref={count}>01/{String(n).padStart(2, '0')}</span>
          <span>Scroll to move forward in time</span>
        </p>
        <div className="tunnel-bar" aria-hidden="true"><span ref={bar} /></div>
      </div>
    </section>
  );
}
