# bysegura.com

Personal portfolio site for Antonio De Oliveira Segura — static HTML/CSS/JS, deployed via GitHub Pages.

## Stack

- **HTML / CSS / JS** — no frameworks, no build step
- **GitHub Pages** — auto-serves `main` branch at [bysegura.com](https://bysegura.com)

## Features

- Dark / light theme toggle with `localStorage` persistence (defaults to dark)
- Animated canvas background — stars in dark mode, clouds in light mode
- Fixed touch-bar navigation (vertical on desktop, horizontal dock on mobile)
- Twitch live status indicator via `api.bysegura.com`
- Contact form via Formspree
- `/projects` page
- Responsive for desktop, tablet, and mobile

## Structure

```
index.html        — main portfolio page
projects/
  index.html      — projects page
styles.css        — all styles
script.js         — main JS (theme, canvas, Twitch status, etc.)
fade.js           — fade-in animation
assets/           — icons and images
resume.pdf        — downloadable resume
CNAME             — custom domain (bysegura.com)
```

## Deploy

Just push to `main`. GitHub Pages serves it automatically.
