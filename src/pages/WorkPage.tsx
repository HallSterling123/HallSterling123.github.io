import { site } from '../content';
import { WaveField } from '../components/WaveField';

export function WorkPage({ slug }: { slug: string }) {
  const list = site.releases;
  const i = list.findIndex((r) => r.slug === slug);

  if (i < 0) {
    return (
      <section className="detail-missing wrap">
        <h1 className="tag">Not found</h1>
        <p>There's no project at this address. It may have been renamed.</p>
        <a href="#work">Back to all work</a>
      </section>
    );
  }

  const r = list[i];
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];

  return (
    <article className="detail" aria-labelledby="detail-title">
      <header className="detail-head">
        <WaveField gap={12} className="detail-waves" />
        <div className="detail-head-inner wrap">
          <a href="#work" className="detail-back">All work</a>
          <p className="detail-cat">
            <span className="tag tag-inv">#{r.cat}</span> <span>{r.kind}</span>
          </p>
          <h1 id="detail-title" className="detail-title">{r.title}</h1>
          <p className="detail-blurb">{r.blurb}</p>
        </div>
      </header>

      <div className="detail-body wrap">
        <dl className="detail-facts">
          <div><dt className="tag">Role</dt><dd>{r.role}</dd></div>
          {r.stack && (
            <div>
              <dt className="tag">Built with</dt>
              <dd><ul className="chips">{r.stack.map((s) => <li key={s}>{s}</li>)}</ul></dd>
            </div>
          )}
          {r.links && r.links.length > 0 && (
            <div>
              <dt className="tag">Links</dt>
              <dd>
                <ul className="detail-links">
                  {r.links.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></li>)}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        <div className="detail-text">
          {r.body.map((p, k) => <p key={k}>{p}</p>)}
          {r.highlights && r.highlights.length > 0 && (
            <>
              <h2 className="tag">Highlights</h2>
              <ul className="highlights">{r.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            </>
          )}
        </div>
      </div>

      {list.length > 1 && (
        <nav className="detail-nav wrap" aria-label="More projects">
          <a href={`#work-${prev.slug}`} className="detail-nav-link">
            <span className="tag">Previous</span>
            <span className="detail-nav-title">{prev.title}</span>
          </a>
          <a href={`#work-${next.slug}`} className="detail-nav-link is-next">
            <span className="tag">Next</span>
            <span className="detail-nav-title">{next.title}</span>
          </a>
        </nav>
      )}
    </article>
  );
}
