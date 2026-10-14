import { site, timeline, type Entry } from '../content';
import { WaveField } from '../components/WaveField';
import { LineChart } from '../components/LineChart';

export function WorkPage({ slug }: { slug: string }) {
  const isProject = site.projects.some((p) => p.slug === slug);
  const list: Entry[] = isProject ? site.projects : timeline;
  const back = isProject ? { href: '#projects', label: 'All projects' } : { href: '#work', label: 'All experience' };
  const i = list.findIndex((r) => r.slug === slug);

  if (i < 0) {
    return (
      <section className="detail-missing wrap">
        <h1 className="tag">Not found</h1>
        <p>There's nothing at this address. It may have been renamed.</p>
        <a href="#work">Back to experience</a>
      </section>
    );
  }

  const r = list[i];
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  const isExternal = (href: string) => /^https?:/.test(href);
  const site0 = r.links?.find((l) => isExternal(l.href));
  const linkProps = (href: string) => (isExternal(href) ? { target: '_blank', rel: 'noreferrer' } : {});

  return (
    <article className="detail" aria-labelledby="detail-title">
      <header className="detail-head">
        <WaveField gap={12} className="detail-waves" />
        <div className="detail-head-inner wrap">
          <a href={back.href} className="detail-back">{back.label}</a>
          <p className="detail-cat">
            {r.period && <span className="tag tag-inv">{r.period}</span>} <span>{r.kind}</span>
          </p>
          <h1 id="detail-title" className="detail-title">{r.title}</h1>
          <p className="detail-blurb">{r.blurb}</p>
          {site0 && (
            <a className="btn-out btn-inv" href={site0.href} target="_blank" rel="noreferrer">Visit {site0.label}</a>
          )}
        </div>
      </header>

      {r.stats && r.stats.length > 0 && (
        <dl className="detail-stats wrap">
          {r.stats.map((st) => (
            <div key={st.label}>
              <dt>{st.label}</dt>
              <dd>{st.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="detail-body wrap">
        <dl className="detail-facts">
          <div><dt className="tag">Role</dt><dd>{r.role}</dd></div>
          {r.place && <div><dt className="tag">Where</dt><dd>{r.place}</dd></div>}
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
                  {r.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className={isExternal(l.href) ? 'is-out' : undefined} {...linkProps(l.href)}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        <div className="detail-text">
          {r.body.map((p, k) => <p key={k}>{p}</p>)}
          {r.bullets && r.bullets.length > 0 && (
            <>
              <h2 className="tag">What I did</h2>
              <ul className="highlights bullets">{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </>
          )}
          {r.highlights && r.highlights.length > 0 && (
            <>
              <h2 className="tag">Highlights</h2>
              <ul className="highlights">{r.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            </>
          )}
          {r.sections?.map((sec) => (
            <section className="detail-section" key={sec.heading}>
              <h2 className="detail-h2">{sec.heading}</h2>
              {sec.paragraphs?.map((p, k) => <p key={k}>{p}</p>)}
              {sec.chart && <LineChart spec={sec.chart} />}
              {sec.table && (
                <div className="detail-table-wrap">
                  <table className="detail-table">
                    {sec.table.caption && <caption>{sec.table.caption}</caption>}
                    <thead><tr>{sec.table.head.map((h) => <th scope="col" key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {sec.table.rows.map((row) => (
                        <tr key={row[0]}>{row.map((c, k) => (k === 0 ? <th scope="row" key={k}>{c}</th> : <td key={k}>{c}</td>))}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {sec.list && <ul className="highlights">{sec.list.map((li) => <li key={li}>{li}</li>)}</ul>}
            </section>
          ))}
        </div>
      </div>

      {list.length > 1 && (
        <nav className="detail-nav wrap" aria-label={isProject ? 'More projects' : 'More experience'}>
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
