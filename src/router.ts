import { useEffect, useState } from 'react';

// Pages are addressed with plain hash words, which work on GitHub Pages with no server
// config and inside sandboxed previews (no slashes or other punctuation):
//   #contact          contact page
//   #sound            the drum machine
//   #work-<slug>      a project page
// Anything else (#top, #about, #work, #leap, or nothing) is the home page, scrolled to that section.

export type Route =
  | { page: 'home'; anchor?: string }
  | { page: 'work'; slug: string }
  | { page: 'contact' }
  | { page: 'sound' };

export function parse(hash: string): Route {
  // accept the older "#/contact" and "#/work/<slug>" forms too
  const h = decodeURIComponent(hash.replace(/^#\/?/, ''));
  if (h.startsWith('work-')) return { page: 'work', slug: h.slice(5) };
  if (h.startsWith('work/')) return { page: 'work', slug: h.slice(5) };
  if (h === 'sound') return { page: 'sound' };
  if (h === 'contact') return { page: 'contact' };
  if (h) return { page: 'home', anchor: h };
  return { page: 'home' };
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
