import { useEffect, useState } from 'react';
import { site } from './content';
import { WaveField } from './components/WaveField';
import { SpacedTitle } from './components/SpacedTitle';
import { WorkTunnel } from './components/WorkTunnel';
import { Sequencer } from './components/Sequencer';
import { WorkPage } from './pages/WorkPage';
import { parse, useRoute } from './router';
import { navigate } from './transition';
import { ErrorBoundary } from './components/ErrorBoundary';
import { asset } from './components/Calendly';
import { Wormhole } from './components/Wormhole';
import { ContactPage } from './pages/ContactPage';

function useClock(tz: string) {
  const fmt = () =>
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 15000);
    return () => window.clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return time;
}

function useVisitCount() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    try {
      const next = Number(localStorage.getItem('visits') ?? '0') + 1;
      localStorage.setItem('visits', String(next));
      setN(next);
    } catch {
      setN(null);
    }
  }, []);
  return n;
}

function useContrast() {
  const [inverted, setInverted] = useState(() => {
    try {
      return localStorage.getItem('contrast') === 'blue';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (inverted) document.documentElement.setAttribute('data-contrast', 'blue');
    else document.documentElement.removeAttribute('data-contrast');
    try {
      localStorage.setItem('contrast', inverted ? 'blue' : 'white');
    } catch {
      /* ignore */
    }
  }, [inverted]);
  return [inverted, () => setInverted((v) => !v)] as const;
}

export default function App() {
  const time = useClock('America/New_York');
  const visits = useVisitCount();
  const [inverted, toggleContrast] = useContrast();
  const route = useRoute();
  const pageKey = route.page === 'work' ? `work-${route.slug}` : route.page;

  // Links that change page fade through the veil; anchors within the home page just scroll.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      const href = a?.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const next = parse(href);
      const cur = parse(window.location.hash);
      const samePage =
        next.page === cur.page && (next.page !== 'work' || (cur.page === 'work' && next.slug === cur.slug));
      if (samePage) return;
      e.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // On every route change: jump to the requested section, or to the top of a new page.
  useEffect(() => {
    if (route.page === 'home' && route.anchor) {
      requestAnimationFrame(() => document.getElementById(route.anchor!)?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
  }, [route]);

  return (
    <>
      <header className="bar">
        <a href="#top" className="bar-name">{site.name}</a>
        <nav className="bar-nav" aria-label="Sections">
          <a href="#about">About</a>
          <a href="#work" aria-current={route.page === 'work' ? 'page' : undefined}>Work</a>
          <a href="#contact" aria-current={route.page === 'contact' ? 'page' : undefined}>Contact</a>
          <a href="#sound" className="bar-sound" aria-current={route.page === 'sound' ? 'page' : undefined}>
            <span className="bar-sound-led" aria-hidden="true" />Sound
          </a>
        </nav>
        <div className="bar-right">
          <span className="bar-clock">NYC {time}</span>
          <button type="button" className="bar-toggle" onClick={toggleContrast} aria-pressed={inverted}>
            {inverted ? 'White' : 'Blue'}
          </button>
        </div>
      </header>

      <div className="veil" aria-hidden="true" />

      <main id="top" key={pageKey}>
        <ErrorBoundary resetKey={pageKey}>
        {route.page === 'work' && <WorkPage slug={route.slug} />}
        {route.page === 'sound' && <Sequencer />}
        {route.page === 'contact' && <ContactPage />}
        {route.page === 'home' && (
          <>
        <section className="hero" aria-label="Introduction">
          <WaveField className="hero-waves" />
          <div className="hero-copy wrap">
            <p className="hero-avail">
              {site.availability} <a href="#contact">Get in touch</a>
            </p>
            <p className="hero-tag tag">{site.heroTag}</p>
          </div>
          <SpacedTitle text={site.name} className="hero-name wrap" />
        </section>

        <section id="about" className="about wrap" aria-labelledby="about-title">
          <h2 id="about-title" className="tag about-label">About</h2>
          <div className="about-body">
            {site.about.map((p, i) => <p key={i}>{p}</p>)}
            <p className="about-resume">
              <a className="btn-resume" href={asset(site.resume.file)} target="_blank" rel="noreferrer">{site.resume.label}</a>
            </p>

            <h3 className="tag now-label">Now</h3>
            <dl className="now">
              {site.now.map((n) => (
                <div className="now-row" key={n.what}>
                  <dt><span className="now-where">{n.where}</span> <span className="now-what">{n.what}</span></dt>
                  <dd>{n.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <WorkTunnel releases={site.releases} />

        <section id="leap" className="leap" aria-label="Contact">
          <Wormhole href="#contact" kicker={site.leap.kicker} title={site.leap.title} />
        </section>
          </>
        )}
        </ErrorBoundary>
      </main>

      <footer className="foot wrap">
        <ul className="badges" aria-label="Site badges">
          <li className="badge b1">Built with<br />React</li>
          <li className="badge b2">Best viewed<br />at any width</li>
          <li className="badge b3">128 BPM<br />certified</li>
          <li className="badge b4">Hosted on<br />GitHub</li>
        </ul>
        <p className="foot-credit">
          Design inspired by the work of{' '}
          <a href="https://djdave.xyz/" target="_blank" rel="noreferrer">DJ_Dave</a> and{' '}
          <a href="https://wodniack.dev/" target="_blank" rel="noreferrer">Antoine Wodniack</a>.
          All code and artwork on this site are original.
        </p>
        <p className="foot-meta">
          {visits !== null && <>Visit no. {visits}. </>}© {new Date().getFullYear()} {site.name}. {site.base}.
        </p>
      </footer>
    </>
  );
}
