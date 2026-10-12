import { useState } from 'react';
import { site } from '../content';
import { Marquee } from '../components/Marquee';
import { Calendly, asset } from '../components/Calendly';

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.getElementById('email-text');
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  };
  return (
    <div className="email">
      <a id="email-text" className="email-text" href={`mailto:${site.email}`}>{site.email}</a>
      <button type="button" className="btn-text" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

export function ContactPage() {
  return (
    <article className="contact-page" aria-labelledby="contact-title">
      <Marquee text={site.marquee} />
      <div className="contact-grid wrap">
        <div className="contact-main">
          <h1 id="contact-title" className="tag">Contact</h1>
          <p className="contact-lede">{site.contact.lede}</p>
          <CopyEmail />
          <a className="btn-resume" href={asset(site.resume.file)} target="_blank" rel="noreferrer">{site.resume.label}</a>
          <ul className="links">
            {site.links.map((l) => (
              <li key={l.label}><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </div>

        <dl className="contact-facts">
          <div>
            <dt className="tag">Good fit</dt>
            <dd>
              <ul className="highlights">
                {site.contact.openTo.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="tag">Based</dt>
            <dd>{site.base}</dd>
          </div>
          <div>
            <dt className="tag">Reply time</dt>
            <dd>{site.contact.replyTime}</dd>
          </div>
        </dl>
      </div>

      <div className="contact-cal wrap">
        <Calendly />
      </div>
    </article>
  );
}
