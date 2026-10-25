# Riiddev — a curious developer's pixel world

A scrolling pixel-art portfolio built with React, Vite, and GSAP. The page moves from dusk to night as you explore the sections, with a hand-authored pixel portrait, procedural bougainvillea, animated project crates, and a GitHub activity corner.

## Run locally

Requires Node.js 18 or newer.

npm install
npm run dev

Open the local URL printed by Vite. To verify a production build, run npm run build and npm run preview.

## What's inside

- React + Vite for the app and local development.
- GSAP + ScrollTrigger for the intro sequence, scroll-driven dusk-to-night transition, and project interactions.
- Pixel portrait hand-authored as an SVG sprite. It blinks, follows the pointer, reacts to the active section, and hops when clicked.
- Project crates start with entries confirmed from the portfolio/README and merge public non-fork repositories from the GitHub API in the visitor's browser.
- A tiny autonomous companion (src/companion.js, src/Companion.jsx) built from the same sprite. It wanders, runs, hops, naps, peeks from behind blocks, hangs from corners and climbs back up, and reacts to the cursor, scrolling, and section changes. It is decorative only: aria-hidden, pointer-events: none, and calm and static under reduced motion.
- Reduced-motion support, keyboard navigation, and responsive styling.
- No backend, API key, or paid service is required. Public GitHub API limits still apply.

## Customize

- Edit copy, links, tools, and sprite colours in src/data.js.
- Replace the portrait with an image by setting PORTRAIT_SRC in src/data.js to a public asset path, for example /portrait.png.
- Tune the visual system and responsive behavior in src/styles.css.
- The old static portfolio is preserved in legacy/; the previous portrait asset remains in assets/.

## Build and hosting

npm run build writes the production app to dist/. Deploy the repository as a Vite project on Vercel or another static host. For GitHub Pages, configure the Pages source to use an appropriate workflow that builds the Vite app and publishes dist/.

## Notes

- The Earbuds in toggle displays floating music notes and a Spotify playlist link; it does not autoplay audio.
- Activity graphics are loaded from the configured jsDelivr URLs. If a graph cannot load, the section displays a fallback link to GitHub.
- GitHub repository data is public and cached in sessionStorage for ten minutes when available; the portfolio still shows its confirmed entries when the API is unavailable.