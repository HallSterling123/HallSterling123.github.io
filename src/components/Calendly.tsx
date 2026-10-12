import { site } from '../content';

/** Resolves a file in /public against the site's base path (works on GitHub project pages too). */
export const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;

/**
 * Inline Calendly booking calendar, coloured to match the site.
 * Uses Calendly's plain iframe embed, so no third-party script runs on the page.
 */
export function Calendly() {
  const base = site.calendly.trim();

  if (!base) {
    return (
      <div className="cal cal-empty">
        <p className="tag">Book a call</p>
        <p>
          Your booking calendar goes here. Paste your Calendly event link into <code>calendly</code> in{' '}
          <code>src/content.ts</code> and it will appear in this spot.
        </p>
      </div>
    );
  }

  const url = new URL(base);
  url.searchParams.set('embed_type', 'Inline');
  url.searchParams.set('hide_gdpr_banner', '1');
  url.searchParams.set('hide_landing_page_details', '1');
  url.searchParams.set('background_color', 'ffffff');
  url.searchParams.set('text_color', '1200ff');
  url.searchParams.set('primary_color', '1200ff');

  return (
    <div className="cal">
      <div className="cal-head">
        <p className="tag">Book a call</p>
        <a href={base} target="_blank" rel="noreferrer" className="cal-open">Open in Calendly</a>
      </div>
      <iframe className="cal-frame" src={url.toString()} title="Book a call with Sterling" loading="lazy" />
    </div>
  );
}
