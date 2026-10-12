import { useEffect, useRef, useState } from 'react';
import type { Entry } from '../content';

export function ExperienceTimeline({ entries }: { entries: Entry[] }) {
  const [active, setActive] = useState(0);
  const n = entries.length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const inViewRef = useRef(false);

  const scrollTo = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  // Arrow key navigation — only active while the section is on-screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inViewRef.current) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => {
          const next = Math.min(n - 1, a + 1);
          scrollTo(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => {
          const next = Math.max(0, a - 1);
          scrollTo(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { inViewRef.current = e.isIntersecting; },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="work" ref={sectionRef} className="xp-timeline" aria-labelledby="xp-title">
      <div className="xp-header wrap">
        <h2 id="xp-title" className="tag xp-label">Experience</h2>
        <p className="xp-nav-hint" aria-hidden="true">
          <span className="xp-nav-keys">← →</span> navigate
        </p>
      </div>

      {/* Scrollable card row */}
      <div className="xp-scroll" ref={scrollRef}>
        <div className="xp-inner">
          <ol className="xp-cards" role="list">
            {entries.map((r, i) => (
              <li
                key={r.slug}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`xp-item${i === active ? ' is-active' : ''}`}
              >
                <a
                  className="xp-card"
                  href={`#work-${r.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => { setActive(i); scrollTo(i); }}
                >
                  <span className="xp-card-top">
                    {r.period && <span className="tag xp-period">{r.period}</span>}
                    <span className="xp-kind">{r.kind}</span>
                  </span>
                  <span className="xp-card-title">{r.title}</span>
                  <span className="xp-card-meta">{r.role}{r.place ? `, ${r.place}` : ''}</span>
                  <span className="xp-card-blurb">{r.blurb}</span>
                  <span className="xp-card-open">Read more</span>
                </a>
              </li>
            ))}
          </ol>

          {/* Timeline bar lives inside the inner container so dots align with cards */}
          <div className="xp-bar" aria-hidden="true">
            <div className="xp-bar-line" />
            {entries.map((r, i) => (
              <div key={r.slug} className={`xp-dot-wrap${i === active ? ' is-active' : ''}`}>
                <span className="xp-dot" />
                <span className="xp-dot-label">{(r.start ?? '').slice(0, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Counter */}
      <p className="xp-counter wrap" aria-live="polite" aria-atomic="true">
        <span>{String(active + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}</span>
        <span>{entries[active].title}</span>
      </p>
    </section>
  );
}

