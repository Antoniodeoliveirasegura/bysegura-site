# Animation Plan — bysegura.com

Goal: make the whole site *transition nicely* — a memorable initial load, springy
icon hovers, smooth page/section/theme transitions — inspired by the terminal
boot-up + icon hover feel of elijahmuraoka.com, adapted to this site's own look.

## Design principles (non-negotiable constraints)

- **Stay vanilla.** Static HTML/CSS/JS, no build step, no React/GSAP/Framer, no new
  dependencies. Everything here is CSS animations + ~120 lines of plain JS.
- **Compositor-only motion.** Animate `transform`, `opacity`, `clip-path` only.
  Never animate `width/height/top/left/margin/padding/font-size`.
- **Reduced-motion is a first-class path.** Under `prefers-reduced-motion: reduce`
  everything is visible instantly, no transforms, no typing. This is required.
- **Don't block the first paint.** The intro reveals text that's already in the DOM;
  it must never delay LCP or hide content from crawlers.
- **Leave the canvas background alone.** The starfield/cloud system in `script.js` stays.

## Motion tokens (add to `:root` in styles.css)

```css
:root{
  --dur-press: 120ms;   /* button press */
  --dur-hover: 260ms;   /* hover settle */
  --dur-reveal: 520ms;  /* entrance reveals */
  --ease-out: cubic-bezier(.16,1,.3,1);       /* expo-out — reveals, page fades */
  --ease-spring: cubic-bezier(.34,1.56,.64,1); /* slight overshoot — hovers, icons */
}
```

Everything below references these — no hardcoded durations/easings scattered around.

---

## Phase 1 — Foundations & cleanup

1. Add the motion tokens above.
2. **Delete `fade.js`** and remove `<script src="fade.js"></script>` from `index.html`
   and `projects/index.html`. It's inert (targets a nonexistent `#content`) and would
   throw on any internal `<a>` click. Page transitions come from `@view-transition`,
   which already works.
3. Also remove the now-unused `#content`, `.fade-in`, `.fade-out` rules in `styles.css`.
4. Expand the reduced-motion block to disable **all** new motion (intro, reveals,
   magnetic hover, theme circle-wipe), not just view-transitions.

Checkpoint: both pages still load and cross-fade between each other via native view
transitions. Nothing visually changed yet.

---

## Phase 2 — Intro / boot reveal (headline #1)

The Elijah feel = a terminal booting, lines appearing in sequence. Adapt it to a
**staggered reveal** of the header, with an optional one-line "boot" caret to sell
the terminal vibe (your mono font already sells it).

Sequence on first load (per browser tab):
1. Optional: a short line like `> booting antonio.dev …` with a blinking caret,
   ~500ms, then it clears. (Taste knob — can be cut for a pure fade-up.)
2. Reveal in order, each `opacity 0→1` + `translateY(12px→0)`, `var(--dur-reveal) var(--ease-out)`:
   `h1.antonio` → `h2` → tagline `p` → "things i'm proud of" `h2` → its `li`s (stagger
   ~60ms each) → "things i want to do next" block the same way.
3. Total budget ≈ 1.1s. Cap it — later items shouldn't feel slow.

Implementation:
- Items start hidden via a `body.preload` class (so no flash if JS is slow, JS removes it).
- New `motion.js` adds `body.booted`, and sets `--i` (index) on each revealable element;
  CSS uses `animation-delay: calc(var(--i) * 60ms)`.
- Play once per tab via `sessionStorage` so navigating home↔projects doesn't replay the
  full boot every time (view transitions handle nav). **Taste knob:** replay-every-load
  vs once-per-tab.
- Reduced-motion: skip entirely, show everything.

Files: `styles.css` (keyframes + hidden initial state), new `motion.js`, `index.html`
(caret element + `motion.js` include), `projects/index.html` (same reveal for its content).

Checkpoint: home page boots in on load; reload with reduced-motion shows instant content.

---

## Phase 3 — Magnetic + springy icon hovers (headline #2)

Upgrade the `.touch-bar` buttons from "lift 3px + gradient" to feeling alive:

- **Scale** to ~1.08 on hover with `var(--ease-spring)` (keeps the per-button gradient).
- **Magnetic pull:** a `pointermove` listener on the touch-bar translates the hovered
  button (or just its icon) toward the cursor, clamped to ~6px, easing back on leave.
- **Icon micro-motion:** e.g. the moon/sun/GitHub icon gets a tiny rotate or bob.
- Active/press: `scale(.96)`, `var(--dur-press)`.

Implementation: ~25 lines in `motion.js` (compute cursor offset from button center,
`translate3d`, clamp; reset on `pointerleave`). Reduced-motion → scale only, no follow.

Checkpoint: hovering the rail feels springy and the buttons subtly track the cursor.

---

## Phase 4 — Page transitions & scroll reveals

- **Page transitions:** keep `@view-transition { navigation: auto }`; add custom
  `::view-transition-old(root)` / `::view-transition-new(root)` keyframes (cross-fade +
  slight slide) using the tokens. Give the touch-bar `view-transition-name: touch-bar`
  so it stays anchored across navigation instead of fading with the page.
- **Scroll reveals:** `IntersectionObserver` in `motion.js` adds `.in` to `.achievements`
  blocks (and project cards on the projects page) as they enter view → same fade-up
  keyframe as the intro, fired once. Below-the-fold content earns its entrance.

Checkpoint: navigating pages slides/fades with the rail pinned; scrolling reveals sections.

---

## Phase 5 — Theme toggle & micro-interactions

- **Theme swap via View Transitions API:** wrap the existing `setTheme()` call in
  `document.startViewTransition(...)` and animate a **circular clip-path wipe** expanding
  from the toggle button — the polished "expanding circle" dark/light swap. Fallback to
  the current instant swap where unsupported; instant under reduced-motion.
  - Note the coupling: the theme handler lives in `script.js`. Either move the click
    handler into `motion.js` or have `motion.js` wrap `setTheme`. Pick one, keep it in
    one place.
- Moon/sun icon: rotate + scale on swap instead of hard replace.
- Form inputs already transition border on focus — optionally add a subtle focus lift.
  Low priority.

Checkpoint: theme toggle wipes across the screen from the button; icon morphs.

---

## File change map

| File | Change |
|---|---|
| `styles.css` | motion tokens; intro/reveal keyframes + hidden states; view-transition custom anims; icon hover scale + active; expanded reduced-motion block; remove dead `#content/.fade-*` |
| `motion.js` **(new, ~120 lines)** | intro orchestrator (`--i` delays, `body.booted`, sessionStorage once); magnetic icons; IntersectionObserver reveals; theme view-transition wrapper |
| `index.html` | remove `fade.js`; add optional boot caret element; add `motion.js`; `body.preload` class |
| `projects/index.html` | remove `fade.js`; add `motion.js`; same reveal wiring |
| `fade.js` | **delete** |
| `script.js` | reconcile theme toggle with the view-transition wrapper (Phase 5) |

## Performance / a11y guardrails

- Compositor-only properties; `will-change` added narrowly and removed after.
- Intro must not delay text paint; reduced-motion shows content with zero transforms.
- Keep JS tiny and dependency-free; no layout thrash in the `pointermove` handler
  (read rect once per enter, not per move).

## Open taste knobs (decide during implementation)

1. Intro: keep the typed `> booting …` caret line, or pure staggered fade-up (no typing)?
2. Replay the intro on every load, or once per tab?
3. Magnetic pull on the **whole button** or just the **icon**, and how strong (~4–8px)?
4. Page transition: cross-fade only, or fade + directional slide?

## Suggested build order for the ultra agent

Phases are already dependency-ordered and each ends at an independently testable
checkpoint. Do 1→5 in order. Verify each in the browser (both themes, and with
`prefers-reduced-motion` forced on) before moving to the next.
