# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**DELTIXIA**, French-language marketing site for a Moroccan digital transformation agency. Single office in **Rabat** (the user removed Casablanca from all copy, do not reintroduce it). Pure static site for FTP upload to Hostinger shared hosting.

**Brand slogan (signature, do not change without asking):** "Ce que vous faites à la main, on le code." This is the proprietary positioning, not "Automatisez. Simplifiez. Développez." which is generic agency-speak the user explicitly rejected.

## Hard constraints (do not violate)

- **No build step, no Node, no PHP.** Everything runs in the browser from a static file server.
- **Tailwind CSS via CDN** (`https://cdn.tailwindcss.com`). The brand palette is configured inline in each page via `tailwind.config = { ... }` immediately after the CDN script. Do not introduce a `tailwind.config.js` file or PostCSS, the CDN ignores them.
- **Alpine.js via CDN** for navbar state, mobile menu, contact form, tabbed solutions.
- **Icons : inline SVG sprite** at `assets/icons.svg` (single 14 KB file with all 48 `<symbol>` definitions). Reference with `<svg class="w-4 h-4" aria-hidden="true"><use href="assets/icons.svg#name"/></svg>`. The Lucide CDN was removed for perf reasons, do not reintroduce it.
- Vanilla JS only.

## File structure

```
/                       FTP root, all upload targets
├── index.html          Hero + bento + tech section + CTA
├── services.html       3 service cards with cyan-glow + complementary skills + 4-step process
├── solutions.html      Alpine-tabbed cases (RH / Inventory / Dashboards) + others grid
├── about.html          Mission/Vision + 4 values + animated stats + timeline
├── contact.html        Form (front-end only) + info cards + map.png with city pins
├── assets/
│   ├── styles.css      Design system, animations, components
│   └── main.js         Particle canvas, custom cursor, tilt, magnetic, counters, reveal, scroll-progress
├── logo.png            Used in navbar + footer of every page (compressed to ~22 KB at 400px wide)
├── favicon_io/         Favicon set (16/32, apple-touch, android-chrome 192/512, .ico, site.webmanifest)
└── skills-lock.json    Pinned external skills (frontend-design, tailwind-css-patterns, markdown-to-html)
```

The only image asset at the root is **`logo.png`**. Earlier filenames (`logo sans background.png`, `logo 2.png`, `logo 3.png`, `map.png`/`map.jpg`) no longer exist, don't reintroduce them. The Morocco "map" in `contact.html` is rendered in pure CSS+SVG (silhouette, GPS coordinates, single Rabat marker with pulse-ring), no raster image dependency.

## Brand system (must be exact)

| Token | Hex | Usage |
|-------|-----|-------|
| `deltixia.dark` | `#0A0F1C` | Page background |
| `deltixia.blue` | `#2563EB` | Primary, gradient start |
| `deltixia.purple` | `#7C3AED` | Secondary, gradient mid |
| `deltixia.cyan` | `#06B6D4` | Accents, hover glow signature |
| `deltixia.light` | `#F2F4F7` | Body text, surfaces |

- **Font:** Poppins exclusively (300/400/500/600/700) from Google Fonts. The user is explicit that no other font is allowed.
- **Aesthetic:** dark mode cyber-corporate with animated aurora gradients, particle network in canvas, glassmorphism cards (`.glass`, `.card`), cyan glow on hover, subtle blue→purple gradients, grain overlay.
- **Tone:** the previous iteration was rejected as "catastrophique / statique / pas moderne." When editing, push for motion, depth, atmosphere, not flat. Use the design tokens already in `styles.css` (aurora-bg, bg-grid, bg-dots, orb, card-spot, card-border-glow, tilt, magnetic, badge-live, marquee).

## Design system in `assets/styles.css`

Reusable classes, prefer these over inline styles:

### Core (everywhere)
- **Backgrounds:** `.aurora-bg`, `.bg-grid`, `.bg-dots`, `.grain`, `.orb` (`.orb-blue` / `-purple` / `-cyan`)
- **Typography:** `.gradient-text`, `.gradient-text-tri`, `.gradient-flow` (light→cyan→purple→light moving sweep), `.text-outline`, `.huge-text` (clamp 4-12rem), `.display-xl`/`-lg`/`-md`, `.eyebrow`, `.kpi-mega` (tabular nums)
- **Editorial accents:** `.tape-text` (cyan rotated tape badge for section headers, replace generic eyebrow when you want punch), `.deco-star` (rotating ✳ asterisk), `.text-glow-cyan/-purple`
- **Buttons:** `.btn` + variant (`.btn-primary` / `.btn-glass` / `.btn-ghost`); add `.magnetic` with `data-magnetic="0.3"` for cursor-attracted behavior
- **Cards:** `.card`, `.card-spot` (JS-driven radial spotlight via `--mx/--my`), `.card-hover`, `.card-border-glow` (animated conic-gradient border), `.glass`, `.bento-card` (richer bento with corner ID), `.scan-border` (sweeping highlight)
- **3D tilt:** wrap with `.tilt-wrap`, target `.tilt` with `data-tilt="6"`
- **Live badge / pulse:** `.badge-live` (with inner `.dot`), `.pulse-ring` (double-ring expand)
- **Marquee:** `.marquee` containing two `.marquee-track` (duplicate content for seamless loop)
- **Reveal:** `.reveal` + optional `.reveal-delay-1`/`-2`/`-3`/`-4`
- **Particles:** `<canvas data-particles data-count="40">`, auto-pauses out of viewport, mobile auto-halves
- **Cursor:** `.blob-cursor` (autoinjected, ring that follows mouse, expands on `.bento-card`/`.card`/links/`[data-blob-grow]`)
- **Divider:** `.divider-glow` (gradient line with traveling halo)

### Live OS / dashboard mock components
- **`.os-window`**, full mac-style window with `.os-titlebar` (`.os-traffic` lights + `.os-url` + optional `.badge-live`), and `.os-body`. Used in index hero.
- **`.log-line`**, single log row with `.tag` (`.tag-ok` / `.tag-run` / `.tag-info`) + `<time>`. Containers with `[data-log-feed]` get auto-injected lines from `main.js` every ~3.5s.
- **`.sparkline`**, SVG mini-graph; the `.area` path fades in after the line draws.
- **`.float-notif`**, floating toast that sways via `floatNotif` keyframes (good for "+47 actions" badge floating off the OS panel).
- **`.halo`**, element gets a soft pulsing radial backdrop via `::before`.

### Data-driven JS hooks (bound at boot)
- **`data-counter="50"`** + optional `data-suffix`, `data-prefix`, `data-decimals`, `data-duration`, animated count-up on scroll.
- **`data-ticker="1247"`** + `data-max="1500"`, `data-interval="2000"`, number that increments every interval, loops back to start when max reached. Cyan flash on each update.
- **`data-live-kpi="142"`** + `data-variance=".05"`, `data-decimals`, `data-suffix`, `data-prefix`, KPI that drifts ±variance every 1.8s (gives "live" feeling).
- **`data-scramble`**, text gets the decryption-style scramble animation on first scroll-into-view + on hover.
- **`data-parallax="20"`**, element translates with mouse position (depth). Apply to backdrop layers (aurora, orbs, grids).

### When to reach for what
- New section header with personality → `.tape-text` over a `.huge-text` headline mixing `.gradient-flow` + `.text-outline italic` + `.deco-star`.
- "Live" feeling needed → `.badge-live` + `data-ticker` or `data-live-kpi` numbers + a `.sparkline` if there's room.
- Standard service/feature card → `.bento-card .card-spot` with corner `.bento-id`.
- Hero showcase → asymmetric grid + `.os-window` mock with `[data-log-feed]` (see index.html for canonical example).

## When editing

- The Tailwind config block must stay identical across the 5 pages, when adding a brand color or font weight, update **all five files** so pages don't drift.
- Don't extract shared HTML into includes (no SSI assumed on Hostinger basic). When changing the navbar or footer, repeat the change in all 5 pages.
- The contact form is front-end only, `submit()` simulates with `setTimeout`. To send real emails, wire Formspree / Web3Forms / EmailJS in the Alpine `submit()` body.
- Test by opening any `.html` directly in a browser, or `python -m http.server` from the project root. There is nothing to "build."

## User preferences observed

- The user pushed back hard on a previous flat/static design. Bias toward motion, depth, and "digital" sensations (animated gradients, particles, live indicators, animated counters, tilt).
- The user pushed back on a generic slogan. Any taglines or hero copy must feel **proprietary** to DELTIXIA, not interchangeable agency speak.
- The user is on Windows; some image filenames may change between sessions, verify with `ls` before referencing assets.

## Skills available

`skills-lock.json` pins three skills cached under `.agents/skills/`:

- **frontend-design**, bold UI guidance (read before any major visual change)
- **tailwind-css-patterns**, Tailwind v4.1+ patterns; consult `references/` for layout, animations, accessibility
- **markdown-to-html**, not relevant here

Treat the cached `SKILL.md` and `references/*.md` as authoritative for those topics.
