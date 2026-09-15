# bysegura.com

Personal portfolio site for Antonio De Oliveira Segura. Static HTML/CSS/JS, deployed via GitHub Pages.

## Stack

- **HTML / CSS / JS**: no frameworks, no build step
- **GitHub Pages**: serves `main` at [bysegura.com](https://bysegura.com)

## Features

- Terminal-style design with dark / light themes (follows the OS until toggled, saved in `localStorage`)
- Circular theme wipe and cross-page transitions via the View Transitions API
- Animated particle background that links to the cursor
- One-time boot intro and scroll reveals, all disabled under `prefers-reduced-motion`
- Project case studies on `/projects/` (live embed where a site allows framing, repo file tree and language bar otherwise) plus smaller builds
- HTML resume at `/resume/` with a downloadable PDF
- Contact form via Formspree (AJAX, with a plain POST fallback)
- Meta / Open Graph tags, sitemap, and a custom 404

## Structure

```
index.html            home
projects/index.html   projects
resume/index.html     resume
404.html              not found page
assets/css/site.css   all styles (shared)
assets/js/site.js     all behaviour (shared)
assets/icons.svg      SVG icon sprite
resume.pdf            downloadable resume
CNAME                 custom domain
```

## Local preview

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173. Paths are root-relative, so open the site through a server rather than `file://`.

## Deploy

Push to `main`. GitHub Pages serves it automatically.
