# bysegura.com

Personal portfolio site for Antonio De Oliveira Segura — built with React + Vite, deployed via GitHub Pages.

## Stack

- **React 18** + **React Router** — SPA with `/` and `/projects` routes
- **Vite** — dev server and build tool
- **GitHub Actions** — auto-deploys to `gh-pages` branch on every push to `main`

## Features

- Dark / light theme toggle with `localStorage` persistence (defaults to dark)
- Animated canvas background — stars in dark mode, clouds in light mode
- Fixed touch-bar navigation (vertical on desktop, horizontal dock on mobile)
- Twitch live status indicator via `api.bysegura.com`
- Contact form via Formspree
- Responsive for desktop, tablet, and mobile

## Dev

```bash
npm install
npm run dev
```

## Deploy

Pushing to `main` triggers the GitHub Action which builds and pushes to the `gh-pages` branch automatically.

To deploy manually:

```bash
npm run deploy
```
