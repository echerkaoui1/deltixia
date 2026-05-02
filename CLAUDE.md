# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**DELTIXIA** — French-language marketing site for a Moroccan digital transformation agency (Casablanca / Rabat). Pure static site for FTP upload to Hostinger shared hosting.

**Brand slogan (signature, do not change without asking):** "Ce que vous faites à la main, on le code." This is the proprietary positioning — not "Automatisez. Simplifiez. Développez." which is generic agency-speak the user explicitly rejected.

## Hard constraints (do not violate)

- **No build step, no Node, no PHP.** Everything runs in the browser from a static file server.
- **Tailwind CSS via CDN** (`https://cdn.tailwindcss.com`). The brand palette is configured inline in each page via `tailwind.config = { ... }` immediately after the CDN script. Do not introduce a `tailwind.config.js` file or PostCSS — the CDN ignores them.
- **Alpine.js via CDN** for navbar state, mobile menu, contact form, tabbed solutions.
- **Lucide Icons via CDN.** `main.js` calls `lucide.createIcons()` on boot and re-runs it on DOM mutations (so Alpine swaps re-render icons).
- Vanilla JS only.

## File structure

```
/                       FTP root — all upload targets
├── index.html          Hero + bento + tech section + CTA
├── services.html       3 service cards with cyan-glow + complementary skills + 4-step process
├── solutions.html      Alpine-tabbed cases (RH / Inventory / Dashboards) + others grid
├── about.html          Mission/Vision + 4 values + animated stats + timeline
├── contact.html        Form (front-end only) + info cards + map.png with city pins
├── assets/
│   ├── styles.css      Design system, animations, components
│   └── main.js         Particle canvas, custom cursor, tilt, magnetic, counters, reveal, scroll-progress
├── logo.png            Used in navbar + footer of every page
├── map.png             Used on contact.html only
└── skills-lock.json    Pinned external skills (frontend-design, tailwind-css-patterns, markdown-to-html)
```

The two image assets at the root are referenced as **`logo.png`** and **`map.png`**. Earlier filenames (`logo sans background.png`, `logo 2.png`, `logo 3.png`) no longer exist — don't reintroduce them.

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
- **Tone:** the previous iteration was rejected as "catastrophique / statique / pas moderne." When editing, push for motion, depth, atmosphere — not flat. Use the design tokens already in `styles.css` (aurora-bg, bg-grid, bg-dots, orb, card-spot, card-border-glow, tilt, magnetic, badge-live, marquee).

## Design system in `assets/styles.css`

Reusable classes — prefer these over inline styles:

- **Backgrounds:** `.aurora-bg`, `.bg-grid`, `.bg-dots`, `.grain`, `.orb` (`.orb-blue` / `-purple` / `-cyan`)
- **Typography:** `.gradient-text`, `.gradient-text-tri` (animated tri-color), `.text-outline`, `.display-xl`/`-lg`/`-md`, `.eyebrow`
- **Buttons:** `.btn` + variant (`.btn-primary` / `.btn-glass` / `.btn-ghost`); add `.magnetic` with `data-magnetic="0.3"` for cursor-attracted behavior
- **Cards:** `.card`, `.card-spot` (mouse-tracking radial spotlight), `.card-hover`, `.card-border-glow` (animated conic-gradient border), `.glass`
- **3D tilt:** wrap with `.tilt-wrap`, target `.tilt` with `data-tilt="6"`
- **Live badge:** `.badge-live` with inner `.dot`
- **Marquee:** `.marquee` containing two `.marquee-track` (duplicate content for seamless loop)
- **Reveal:** `.reveal` + optional `.reveal-delay-1`/`-2`/`-3`/`-4`
- **Counters:** any element with `data-counter="50"` (and optional `data-suffix="%"`, `data-prefix="+"`, `data-decimals="1"`, `data-duration="1600"`)
- **Particles:** `<canvas data-particles data-count="60">` — auto-pauses out of viewport
- **Cursor:** `.cursor-glow` is auto-injected; add `data-cursor-grow` to make any element expand it on hover

## When editing

- The Tailwind config block must stay identical across the 5 pages — when adding a brand color or font weight, update **all five files** so pages don't drift.
- Don't extract shared HTML into includes (no SSI assumed on Hostinger basic). When changing the navbar or footer, repeat the change in all 5 pages.
- The contact form is front-end only — `submit()` simulates with `setTimeout`. To send real emails, wire Formspree / Web3Forms / EmailJS in the Alpine `submit()` body.
- Test by opening any `.html` directly in a browser, or `python -m http.server` from the project root. There is nothing to "build."

## User preferences observed

- The user pushed back hard on a previous flat/static design. Bias toward motion, depth, and "digital" sensations (animated gradients, particles, live indicators, animated counters, tilt).
- The user pushed back on a generic slogan. Any taglines or hero copy must feel **proprietary** to DELTIXIA, not interchangeable agency speak.
- The user is on Windows; some image filenames may change between sessions — verify with `ls` before referencing assets.

## Skills available

`skills-lock.json` pins three skills cached under `.agents/skills/`:

- **frontend-design** — bold UI guidance (read before any major visual change)
- **tailwind-css-patterns** — Tailwind v4.1+ patterns; consult `references/` for layout, animations, accessibility
- **markdown-to-html** — not relevant here

Treat the cached `SKILL.md` and `references/*.md` as authoritative for those topics.
