// Page-to-page fade. A full-screen veil (.veil in App) fades in, the route changes
// underneath it, then the veil fades out to reveal the new page.

const FADE_IN_MS = 500;
let busy = false;

export function navigate(hash: string, { delay = 0 }: { delay?: number } = {}) {
  const target = hash.replace(/^#/, '');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    window.location.hash = target;
    return;
  }
  if (busy) return;
  busy = true;
  const root = document.documentElement;
  const lift = () => {
    root.classList.remove('is-leaving');
    busy = false;
  };
  window.setTimeout(() => {
    root.classList.add('is-leaving');
    window.setTimeout(() => {
      try {
        window.location.hash = target;
      } catch {
        /* if the host refuses the change, still lift the veil */
      }
      // give React a moment to render the new page, then lift the veil;
      // the timer is a backstop in case animation frames are paused
      requestAnimationFrame(() => requestAnimationFrame(lift));
      window.setTimeout(lift, 250);
    }, FADE_IN_MS);
  }, delay);
}
