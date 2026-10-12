import type { Project } from '../content';

/** Home-page list of projects, each with outbound buttons and a link to its own page. */
export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="projects wrap" aria-labelledby="projects-title">
      <h2 id="projects-title" className="tag projects-label">Projects</h2>
      <ul className="proj-list">
        {projects.map((p) => (
          <li className="proj" key={p.slug}>
            <p className="proj-kind">{p.kind}</p>
            <h3 className="proj-title">
              <a href={p.live ?? `#work-${p.slug}`} {...(p.live ? { target: '_blank', rel: 'noreferrer' } : {})}>
                {p.title}
              </a>
            </h3>
            <p className="proj-blurb">{p.blurb}</p>
            {p.stack && (
              <ul className="chips" aria-label="Built with">
                {p.stack.map((s) => <li key={s}>{s}</li>)}
              </ul>
            )}
            <p className="proj-actions">
              {p.live && <a className="btn-out" href={p.live} target="_blank" rel="noreferrer">Live site</a>}
              {p.source && <a className="btn-out btn-ghost" href={p.source} target="_blank" rel="noreferrer">Source</a>}
              <a className="proj-more" href={`#work-${p.slug}`}>Details</a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
