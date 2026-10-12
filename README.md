# sterling-site

Personal site: a flowing wave-field hero that the cursor drags through, a giant spaced name, a scroll-driven 3D work tunnel whose cards open project pages, and a slow wormhole at the bottom that dives into the contact page. A playable 16-step drum machine (Web Audio, no samples) lives on its own page, linked from the header; its kick stirs the waves. White and electric ultramarine, with a toggle that inverts them.

Vite + React + TypeScript. Fonts from Google Fonts: Big Shoulders Display, Newsreader, IBM Plex Mono.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Edit your content

Everything lives in `src/content.ts`: name, availability line, about paragraphs, email, links, the "Now" list, the projects, the wormhole text (`leap`), the contact page (`contact`) and the marquee text. Each project's `body`, `highlights` and `links` fill its detail page. Replace the `TODO` handles before you publish.

The default drum pattern is `DEFAULT` in `src/components/Sequencer.tsx`. Sounds are in `src/audio.ts`.

## Pages

The site uses plain hash addresses so it works on GitHub Pages without extra setup: `#top` home, `#work-<slug>` a project, `#contact` contact, `#sound` the drum machine.

## Deploy to GitHub Pages

1. Create a repo. Name it `<your-username>.github.io` to get `https://<your-username>.github.io`, or any other name to get `https://<your-username>.github.io/<repo>/`.
2. Push this folder to the `main` branch.
3. In the repo, open Settings → Pages and set Source to **GitHub Actions**.

The workflow in `.github/workflows/deploy.yml` builds on every push to `main` and sets the base path for you.

Custom domain: add a `public/CNAME` file containing the domain, then point DNS at GitHub Pages.
