# Riiddev — frontend, one level at a time

A personal portfolio inspired by illustrated editorial layouts and Riiddev's pixel-art GitHub identity. The hero combines a pastel sky, layered waves, a pixel ninja, and a clickable portrait speech bubble.

## Run locally

No build step or package installation is required. Open `index.html` in a browser or use a local static server such as VS Code Live Server. The page loads GSAP and ScrollTrigger from a CDN for the richer motion; the content and core layout do not depend on a backend.

## File structure

- `index.html` — page structure, hero scene, editorial sections, and GitHub graphics.
- `styles.css` — responsive styling, CSS illustrations, waves, pixel sprite, and reduced-motion styles.
- `content.js` — the single place to edit the speech bubble lines, projects, tool tiles, and social links.
- `main.js` — dynamic content rendering, project detail toggles, navigation progress, and optional GSAP motion.
- `assets/riiddev-portrait.jpg` — the temporary avatar supplied for the portfolio.

## Replace the portrait

Replace `assets/riiddev-portrait.jpg` with another image while keeping the same filename. The circular crop and zoom are controlled by `--zoom`, `--fx`, and `--fy` on `.portrait__img` in `styles.css`.

## Edit project cards

Update the `projects` array in `content.js`. Each project has a short summary, technology labels, expandable details, and links. For a real screenshot, add an `image: { src, alt }` property to a project and place the image in `assets/`; otherwise the project uses a lightweight typographic cover.

The project descriptions are based on available repository READMEs. NASIB +62 is marked as work in progress. Agent HQ's simulated crew/activity and setup requirements are stated explicitly; the portfolio does not imply AI agents are connected by default.

## Motion and accessibility

- GSAP animates the title and selected scroll reveals when its CDN scripts are available.
- CSS keeps the experience usable if GSAP is unavailable.
- The site respects `prefers-reduced-motion`.
- Project-detail buttons expose their expanded state to assistive technology.
- No API keys, database, or paid backend service is required for the portfolio itself.

## Static hosting

The site can be hosted on GitHub Pages or any static host. For GitHub Pages, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save. Hosting settings must be enabled in GitHub before a public Pages URL becomes available.
