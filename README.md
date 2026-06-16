# YING — Brand identity + marketing website

Brand system and marketing site for **Yonder Infrastructure Networks Group (YING)** — an
independent, senior-led, bilingual (EN / 中文), AI-augmented infrastructure advisory firm
based in New Zealand.

Everything here is **framework-free**: semantic HTML5, modern CSS and a little vanilla JS.
No build step, no dependencies. Open `index.html` and it runs.

---

## Design decisions (summary)

- **Logo concept — "Winged Y."** A geometric *Y* with forked, ascending arms (forward
  momentum — **赢**, *yíng*, to win / advance) and a split stem, in a two-tone navy + teal
  (left wing navy, right wing teal). One master mark drives every variant; it reads from
  favicon (16px) to signage.
- **Palette.** Deep navy `#0E2C4D` base + a single **horizon-teal** accent `#17A2A6`
  (buttons use a slightly deeper `#0C7C80` so white text passes WCAG AA). Neutrals: Cloud,
  Mist, Slate. All text pairings verified ≥ AA (navy/white ≈ 14:1).
- **Type.** **Sora** (headings + wordmark), **Inter** (body), **Noto Sans SC** (中文 body),
  and **Ma Shan Zheng** (the brand 赢 / 英 calligraphic characters) — all open-licence
  (SIL OFL) Google Fonts.
- **Taglines.** Hero — *"Beyond the build."*; positioning — *"Infrastructure advisory for
  the long view."*
- **Architecture.** Single page with sticky anchor navigation; mobile-first; restrained motion.

---

## File structure

```
.
├── index.html                  # single-page marketing site (10 sections)
├── README.md
├── site.webmanifest            # PWA / app-icon manifest
├── robots.txt
├── sitemap.xml
├── favicon.svg                 # browser favicon (navy app-icon tile)
├── assets/
│   ├── css/styles.css          # design tokens + layout + components
│   ├── js/main.js              # nav, scroll-spy, reveal, EN/中文 toggle, form validation
│   └── img/og-image.png        # 1200×630 OpenGraph / Twitter card
└── brand/
    ├── brand-sheet.html        # one-page brand guidelines (open in a browser)
    ├── logo-primary-horizontal.svg
    ├── logo-stacked.svg
    ├── logo-monogram.svg       # the Y mark on its own
    ├── logo-mono-black.svg     # one-colour black (uses currentColor)
    ├── logo-reversed-white.svg # reversed for dark backgrounds
    ├── favicon.svg             # app-icon master
    └── ying-icon-512.png       # 512×512 PNG icon (apple-touch-icon / maskable)
```

---

## Preview locally

Any static server works. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
#  …and the brand sheet at http://localhost:8000/brand/brand-sheet.html
```

(You can also just double-click `index.html`, but a server is recommended so fonts and
relative paths behave exactly as in production.)

---

## Deploy (static host)

It's a plain static bundle — deploy the whole folder as-is.

**Cloudflare Pages**
1. Push this folder to a Git repo (or use *Direct Upload*).
2. Create a Pages project. **Build command:** *(none)*. **Build output directory:** `/` (root).
3. Deploy. Add your custom domain in the Pages dashboard.

**Netlify / GitHub Pages / S3 / any host** — upload the folder; no build needed.

After deploying, update the placeholder production domain (`https://www.example-ying.co.nz/`)
in `index.html` (canonical + OG/Twitter URLs), `robots.txt`, and `sitemap.xml`.

---

## Live deployment (development)

- **Repo:** https://github.com/BobHu-TTAP/ying-website (default branch `main`)
- **Cloudflare Pages project:** `ying-website`
- **Development URL:** https://development.ying-website.pages.dev
- **Production branch:** `main` — intentionally left **without** a deployment, and **no
  custom domain** is attached, so nothing is live on a production address yet.

This was deployed with **Wrangler Direct Upload** (not Git-connected), so pushing to GitHub
does **not** auto-deploy. To publish updates to the development URL:

```bash
export CLOUDFLARE_API_TOKEN=<your Pages:Edit token>
export CLOUDFLARE_ACCOUNT_ID=<your account id>
npx wrangler@latest pages deploy --branch development --commit-dirty true
```

**To enable auto-deploy on every `git push`** (recommended dev workflow): in the Cloudflare
dashboard → Workers & Pages → `ying-website` → Settings → connect the GitHub repo. Set the
production branch and any preview branches there. (This needs a one-time dashboard OAuth.)

**To go to production:** deploy the `main` branch (`--branch main`) and attach the custom
domain under the project's *Custom domains* tab.

---

## Before launch — insert real content

Every spot needing real content is marked with an HTML comment (`<!-- TODO… -->`). Search the
codebase for `TODO`, `placeholder`, `REPLACE`, and `example-ying`. Checklist:

- [ ] **Production domain** — canonical/OG URLs (`index.html`), `robots.txt`, `sitemap.xml`.
- [ ] **Contact details** — real email + phone in the Contact section and JSON-LD (currently clearly-marked placeholders).
- [ ] **Contact form endpoint** — set the form's `data-endpoint`/`action` to a Formspree URL or a Cloudflare Pages Function / Worker, then enable the `fetch()` block in `assets/js/main.js` (see the commented example).
- [ ] **NZBN** — footer + JSON-LD (`taxID`).
- [ ] **Team** — replace the four placeholder cards with real names, roles (EN + 中文), photos and short bios. *Do not publish photos without each person's consent.*
- [ ] **Insights** — replace the three "Coming soon" placeholder cards with real articles.
- [ ] **中文 translation** — UI chrome and key headings already swap via the EN/中文 toggle. Body paragraphs marked `<!-- TODO(content) -->` need professional translation (not machine-translated). All translatable strings live in `data-en` / `data-zh` attributes.
- [ ] **Social links** — add LinkedIn etc. (footer + JSON-LD `sameAs`).
- [ ] **OG image** — regenerate if branding changes (see below).

---

## Regenerating the PNG exports

The PNGs (`brand/ying-icon-512.png`, `assets/img/og-image.png`) are rasterised from HTML/SVG
sources. There's no CLI rasteriser bundled; any of these works:

- **Headless Chrome** (what was used here):
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=3000 --window-size=1200,630 \
    --screenshot=og-image.png file:///absolute/path/to/source.html
  ```
- Or `rsvg-convert`, `cairosvg`, Inkscape, or any "SVG → PNG" tool against the brand SVGs.

> Note on the wordmark SVGs: the **mark** is pure vector, but the lockup wordmark uses live
> `<text>` in Sora/Inter so it stays editable. For print or third-party handoff, **outline
> the text** (convert to paths) so it renders without the fonts installed.

---

## Accessibility & SEO notes

- WCAG 2.1 AA: skip link, semantic landmarks, single `<h1>`, labelled form fields with inline
  validation, visible focus rings, AA-verified contrast, `prefers-reduced-motion` honoured.
- SEO: title/description, canonical, OpenGraph + Twitter cards, `ProfessionalService` JSON-LD,
  `sitemap.xml`, `robots.txt`, SVG favicon + manifest.
- Bilingual-ready: `lang` attribute switches with the toggle; strings are kept in
  `data-en` / `data-zh` attributes for a future full EN/中文 build.

---

*Original artwork. Fonts under SIL OFL. No third-party logos, stock IP, or fabricated facts —
real names, projects, statistics and credentials are left as labelled placeholders.*
