# HALCYON Website — Project Context

## What This Is

A marketing website for **Halcyon**, an AI automation consultancy based in Chennai, India. Founded by **Sanjith Dhandapani**. The site is entirely vanilla HTML/CSS/JS — no framework, no build step, no dependencies beyond Google Fonts.

**Architecture (2026-07, current — "Halcyon Homepage" design import):** The live site is a **single scrolling page** built from Sanjith's Claude Design mockup (`Halcyon Homepage.dc.html`, project `b8e1554c-c1ea-4bad-a483-b4d8c51dbebb`, read via the DesignSync MCP). Sticky top **header** (mark + HALCYON wordmark + anchor nav + Begin button) → **hero** ("Tranquility engineered." over a faint hexagon watermark) → **What we do** (3-col) → **How we work** (horizontal timeline) → **Our work** (case cards with metric grids + Live/In-progress pills) → **Engagements** (3 tiers) → **Principle** (pull-quote interlude) → **Contact** (split: founder details + the working 3-step form) → footer. Anchor links + smooth scroll; `≤820px` collapses nav to a hamburger `#mmenu`. **Fonts: Cormorant Garamond (display) + Jost (UI) — NOT Inter.** Extra color tokens from the DS: `--body #b8b4ae`, `--faint #5f5c58`, `--gold-dim #4a3f1e`, `--hairline #1c1c1c`, `--gold-hover #d4ab48`. Cards use `border-radius:12px` (softer than the old sharp look). **This replaced the multi-view rail SPA** (recoverable from git commit `e0502e2`). When implementing the mockup, real proof numbers / 3-system structure / no-"AI" / the working form were preserved over the mockup's stale placeholders. The project also holds `Halcyon Orbit - Navigator.dc.html` and `How We Work - Circular Studies.dc.html` (non-linear nav explorations) not yet implemented.

**Files:** `index.html` (the homepage) plus `work/supervisor-field-app.html`, `work/quotation-engine.html` (case studies), sharing `work/case.css` and `work/case.js`. `vercel.json` uses `{"handle":"filesystem"}` so real files serve before the SPA fallback — do not revert that or the case studies 404.

### Case studies (`/work/…`)
Two deep-dive pages linked from the homepage "Our work" cards (the cards are `<a class="case">`; the Tender card stays a `<div>` as it has no case study). Each page: hero + animated stat strip, before/after problem panels, an animated schematic of the real UI, a metrics grid, a weekly bar chart, a value section, a methodology note, next-case link and CTA. Per-page `<title>`/meta/canonical/OG plus `Article` + `BreadcrumbList` JSON-LD; both are in `sitemap.xml`.

**Motion rules for these pages:** counters animate from 0 but the *real* value is hard-coded in the HTML as the fallback (never ship `>0<` — crawlers and no-JS visitors would read zero). The reveal is scoped to `.js [data-reveal]` with an inline `<script>` in `<head>` adding the class, so content stays visible if scripting fails. Everything is gated behind `prefers-reduced-motion`.

### Demo deployments (safe to link publicly)
Each case study links a **purpose-built demo**, not the production app:
- Supervisor → `https://halcyon-supervisor-demo.vercel.app/`
- Quotation → `/theworks/quotation` (same origin; the standalone deploy was retired 2026-08-23)

Both run on **self-contained sample data** and need no password, and neither makes a Supabase call or carries a production project ref. The quotation demo is a fictional general contractor, "Meridian Contracts Pvt Ltd"; it was an industrial flooring company until 2026-08-17. As of 2026-08-23 it carries **no on-screen sample-data banner**: the page around it says so instead, and the disclosure it does carry is printed on the generated PDF. The supervisor demo still shows its banner. Each case study has a subtle hero link plus a `.trydemo` band after the UI schematic, cross-linking the other demo. All external links use `target="_blank" rel="noopener"`.

⚠️ **Never publish the production app URLs.** `https://swathi-supervisor.vercel.app` is the live client system (97 sites, 46 real client companies, contact phone on every site, supervisor names/PINs). Per that repo's own `CLAUDE.md`, its operational tables use **permissive RLS (anon full CRUD)** and security rests on "the obscure URL + PIN gate" — the anon key ships in the JS bundle, so publishing the URL would expose real client data regardless of the PIN. The Quotation app records no live URL at all. Both production apps have sat on the **same** Supabase project since the 2026-08-22 merge, so this is one blast radius now, not two: exposing `urrrwpekgmehpfjvfzpf` exposes the quotation data too.

### Source of truth for every number
All statistics come from the **live Supabase production databases**, read via the Supabase MCP. **Re-query before changing any figure.**

**Where to query, as of 2026-08-22.** The Supabase estate was consolidated from 5 projects to 2 that day. One project now carries both Swathi apps, split by Postgres schema:
- **Supervisor** = `urrrwpekgmehpfjvfzpf`, **`public`** schema. Unchanged by the merge.
- **Quotation** = the **same project** `urrrwpekgmehpfjvfzpf`, **`quotation`** schema. Its own project `skjdtlezdcnqdmhwsapz` was merged in and then deleted. **Schema-qualify every query** (`quotation.quotes`, `quotation.companies`, `quotation.sites`): a bare `sites` or `app_settings` resolves to the supervisor's tables, which mean different things (a job site with geo and work stages there, a delivery address under a company here). The quotation schema is also not exposed to PostgREST, so REST reads 404 by design; use SQL.
- **Tender** = **deleted**. `dnowfenlgdpnrkkjoxmc` no longer exists, and no application code for it survives anywhere on the server. Tender figures can no longer be re-queried against anything live.

The full write-up of what moved and why, plus backups of both deleted databases, is `/root/projects/supabase-backups-2026-08-22/README.md`.

⚠️ **The homepage publishes one tender figure: `129` "tenders surfaced in a scan" (`index.html:438`).** Its database is gone, so that number cannot be re-verified. The only surviving record is `/root/projects/supabase-backups-2026-08-22/tender-agent/`, which keeps 20 of the 612 tender rows plus run telemetry; its `scrape_logs_summary` puts the largest single harvest at **162 found / 128 inserted** (source `gem`, 2026-07-11). Nothing in the backup reproduces 129 exactly. Do not restate, round or extend that figure. Raise it with Sanjith before the next edit to that card.

Supervisor figures verified 4 Aug 2026; quotation figures recounted 1 Sep 2026:
- **Supervisor:** 289 visits (281 completed), 97 sites (86 active, 79 visited), 19 supervisors logging of 30, 64,369 sqm, 204 progress assessments, 331 work days, 26 issues (13 resolved), 62 teams / 39 applicators, live since 22 Jun 2026. **GPS: 92% of completed site visits** (81/88 `kind='visit'`); 79% across all 289 records. The earlier "100% GPS verified" and "28 members / 23 sites / 42 visits in 9 days" claims were **not supported by the data** and have been corrected.
- **Quotation, recounted 1 Sep 2026** covering 1 Jul to 31 Aug 2026: **₹22.08 crore total quoted**, 176 quotations (171 distinct serials, 5 amendments), ₹3.21 lakh median, ₹12.55 lakh average, ₹3.68 cr largest, ₹602 smallest, 80 companies, 83 sites, 398 line items, 117 site price overrides across 75 sites, 32 active days, live since 1 Jul 2026. ⚠️ **The 4 Aug figures were contaminated and are retired: do not restate ₹47.54 cr, 36 quotations, ₹1.32 cr average, ₹23.03 cr largest, 15 companies, 18 sites, 74 line items or 37 overrides.** 14 rollout-era test rows worth ₹41.46 cr were culled from the database on 2026-08-22; the two remaining ambiguous rows (Sundaram, Renault) are real and stay, on Sanjith's ruling. ⚠️ **"20 system configurations" and "4 brands supported" on the case study page still date from 4 Aug and are unverified.** The catalogue now holds 7 systems, 7 brands and 3 divisions, and the `brand` column on `quotation.quotes` is dirty (an empty string, plus "Nerolac Brand" and "Nerolac " as separate values), so neither cell can be recounted cleanly. Raise both with Sanjith before the next edit to that grid. The earlier "40+ products across 8 application categories" was **not supported** and has been replaced.
- Time-saving figures are always a *stated* assumption × a *measured* count, with the assumption shown inline. The "1 hour per quote" baseline is client-stated, not system-measured.

**Preview server:** `npx serve -p 3900 .` — config lives in `.claude/launch.json`. Start it with the `halcyon` launch config. Previous server ID was `e304908b-58ce-4329-9c25-1eb773eaa89a` (will change each session).

---

## Business Context

- Halcyon builds **bespoke operational systems** for SMEs in manufacturing, construction, industrial supply, and trading.
- Clients come via **referral only** — no cold outreach. The site's job is to give a referred prospect confidence before they reach out.
- **Meetings are held online.** In Chennai an in-person meeting is possible. **There are no site visits**, at any stage, in any city. (Corrected 2026-08-28. This line originally said Sanjith visits clients in person and there is no online service; a first correction still allowed a Chennai meeting at the client's own premises, which is the same promise in softer words. See `halcyon-studio/brand/proof-ledger.md`.)
- The target audience is **MDs and business owners** of established SMEs, not tech-savvy buyers.
- **Don't lead with AI** — position it as operational intelligence, not AI software.
- Pricing is shown on the site as reference points; actual engagements are scoped in discovery.
- **Client:** One live client — **Swathi Engineering Agencies** — with **two live systems**: Supervisor Field App and Quotation Engine (all numbers from production data). The **Tender Intelligence App** is a **standalone demonstration build** (a working system built to show the capability, NOT deployed for any company) — on the site it carries a "Demonstration" pill + "Built to show the capability", never a client name or "In progress". Do NOT reframe it as a client system, and do NOT reintroduce Neocrete or any second client unless told. (Neocrete was in earlier drafts; no longer referenced.)
- **Proof, not promises:** Every statistic on the site comes from Swathi production data. Never invent, round, extrapolate, or add a number that isn't confirmed. Methodology is "available on request."

---

## Design System

### Fonts (Google Fonts)
- `Cormorant Garamond` — display/headings (CSS var `--d`), weights 300 + 400, italic variants
- `Inter` — body copy (CSS var `--b`), weights 300 + 400 + 500
- `DM Mono` — labels, counters, mono tags (CSS var `--m`), weight 400

### Colour Palette
```css
--obsidian: #0C0C0C   /* primary background */
--charcoal: #161616   /* card/section backgrounds */
--smoke:    #2C2C2C   /* borders, dividers */
--gold:     #C49A38   /* primary accent — buttons, bars, highlights */
--teal:     #1E7A72   /* section labels only */
--offwhite: #F0EEEA   /* primary text on dark */
--stone:    #888480   /* secondary/muted text */
```

### Typography conventions
- Section labels: DM Mono, 10px, 0.22em letter-spacing, uppercase, `--teal`
- H2 titles: Cormorant Garamond 300, `clamp(26px, 4.2vw, 44px)`, `--offwhite`
- Body/sub: Inter 300, 14–15px, 1.75–1.8 line-height, `--stone`
- Gold bars: 18–20px wide, 1px tall, `--gold` — used as decorative dividers in cards

### Key rules from Sanjith
- **No "I" or "we"** in body copy — write in direct, declarative sentences. ⚠️ NOTE: the 2026-07 full-site upgrade copy (Results subhead, What We Do intro, Who This Is For) uses "we" verbatim from Sanjith's own brief — left as written but flagged to him; if he confirms the no-"we" rule still holds, convert those to declarative.
- **No "free"** anywhere — it cheapens the brand. Use "no cost" / "Discovery session included". (The FAQ "what does this cost" answer was normalised from "free discovery conversation" → "a discovery conversation at no cost" to honour this.)
- **No third-person "the founder"** — use "Sanjith Dhandapani / Founder, Halcyon"
- **No "Indian"** qualifier — just "businesses"
- **No sector tags row** — the Manufacturing · Construction · Trading line was removed

### Visual non-negotiables (2026-07 upgrade)
- **No gradients, no drop shadows, no glow, no icons — anywhere.** The cursor-glow radial gradients on cards and the button drop-shadow were removed in this pass. Do not reintroduce.
- **Gold (`--gold`) is sparing** — numbers and emphasis only, never large fills.
- **No stock icon grids, no client logo wall, no testimonials, no carousels.** Type scale + whitespace + a large gold number is the visual anchor. Restraint is the differentiator.
- The `#results` stat strip is a single 4-column grid divided by 1px `--smoke` hairlines (not separate bordered boxes); values are single-token figures (`38 hrs`, `< 1 min`, etc.) so the labels beneath align.
- FAQ uses native `<details>`/`<summary>` (no JS, no library); the +/− affordance is built from two thin gold pseudo-element bars, not an icon.

---

## Page Architecture

**Current section order (after 2026-07 upgrade):** Nav → Hero → **Results** (`#results`) → What We Do → How We Work → Our Work → Engagements → **FAQ** (`#faq`) → **Founder** (`#founder`) → Contact → Footer. Nav links: Results · What We Do · How We Work · Our Work · Engagements · Contact. The detailed subsections below predate the upgrade and describe the older, shorter layout; treat the order above as canonical.

Section design notes (2026-07 second revision):
- **Results** = a 4-column divided **stat strip** (single dominant figures: `38 hrs`, `95%`, `< 1 min`, `5 min` — no ragged wrapping) + an **interactive tabbed proof showcase** (`.proof-tabs` buttons switch `.proof-panel`s via a small JS handler; three systems, each with Problem / Numbers / What changed in a 3-col grid). No stacked proof blocks.
- **How We Work** = a vertical **timeline** (`.how-list` / `.how-step`): large gold Cormorant number on the left, title + body on the right, hairline dividers. Handles uneven step lengths cleanly.
- **Removed** (were briefly live, then cut on Sanjith's feedback): the "Who This Is For" section, the "Methodology" section, and the founder "vision" line. Do not reinstate without being asked.
- **No em dashes anywhere** in visible copy — Sanjith's rule as of this revision. Use commas, semicolons, or parentheses.
- Kept single-page (Sanjith floated multi-page; declined for narrative coherence, offered as a future option).

Single page, one `index.html`. Sections in order:

### 1. NAV (`#nav`)
Fixed, 52px, blur backdrop. HALCYON wordmark (left) + 4 nav links (right) + hamburger (mobile). Active link tracked via IntersectionObserver on sections.

### 2. Mobile Menu (`#mob-menu`)
Full-screen overlay, slides in from right (`translateX(100%)` → `translateX(0)`). Contains all nav links + "Tranquility engineered." tagline at bottom.

### 3. Hero (`#hero`)
Full viewport (`100svh`). Stacked vertically:
- `OPERATIONAL INTELLIGENCE` label (teal mono)
- `THE` (gold, 13px, 0.44em spacing)
- `HALCYON` (Cormorant 300, `clamp(68px, 11.5vw, 136px)`)
- `Tranquility engineered.` (italic gold)
- horizontal rule
- 1-sentence body (stone)
- `BEGIN A CONVERSATION` CTA button
- Pulsing gold scroll indicator line at bottom

Hero elements animate in via staggered `heroIn` keyframe (opacity + translateY, delays from 0.1s to 1.1s).

**Parallax:** On scroll, HALCYON title drifts up at 0.28× scroll speed. Body text and CTA fade out by ~55% viewport scroll.

### 4. What We Do (`#what`)
Three capability cards in a grid (`flex-wrap`, gap 1px, `--smoke` background creating hairline separators).

Cards:
- **Workflow Intelligence** — Operations mapped. Every friction point identified before anything is built.
- **Bespoke Systems** — Every solution built from scratch. No templates. No off-the-shelf software.
- **Ongoing Partnership** — No disappearing after delivery. Monthly improvements, same-day support, and API costs included.

Each card has an animated gold bar (width 0 → 20px, triggered on `.r-scale.in`).

### 5. How We Work (`#how`)
Charcoal background. 4 numbered steps in a flex grid:
- 01 We Meet / 02 We Map / 03 We Build / 04 We Stay

### 6. Our Work (`#work`)
**All dark** — same charcoal as the rest of the site (the old paper/cream section was removed entirely).

Three cards:
1. **Supervisor Management System** — Field Operations — Neocrete
2. **Intelligent Quotation Engine** — Sales Operations — Swathi Engineering Agencies
3. **AI Business Analyst** — Business Intelligence — Currently in development (dimmed, 0.55 opacity, "In Build" badge)

Footer: "Client names withheld. References available on request."

### 7. Engagements (`#engagements`)
**Not fixed packages.** Each engagement is priced by **complexity** — scored internally across four axes and banded into **Light / Standard / Complex**; the visitor does not select a bundle. The section `h2` ("Not packages.<br>Starting points.") and `sec-intro` are unchanged. Three `.tier` cards, middle card carries `.tier feat` (gold-border emphasis — must stay on the centre card):

| Band | Headline | Positioned for | Card points |
|------|----------|----------------|-------------|
| **Light** | "A single problem, solved right." | One clear operational gap | A single tool, solving one specific gap · 1 enhancement available per month · Email support |
| **Standard** (`feat`) | "Real logic, real stakes." | Multiple workflows / real business logic, as one connected engagement | Multiple workflows, or real business logic under the hood · 1 enhancement available per month · WhatsApp support |
| **Complex** | "Systems, not just tools." | Multiple systems + critical workflows carrying real operational weight | Multiple systems working together · Built for daily, mission-critical use · Direct access to the founder |

The **monthly enhancement is framed as *available*, not automatic/included** (Light + Standard only; **Complex omits it** deliberately, since that band already implies continuous, ongoing work rather than a monthly cadence). No fixed ₹ figures appear on the site — pricing is set per engagement from the internal complexity score.

`eng-note`: "No setup fee is quoted before the workflow is mapped. Every engagement includes support within 24 hours and running costs up to a baseline, with an additional enhancement available each month."

(Earlier drafts used Starter/Growth/Partner bundles with fixed prices — superseded by the Light/Standard/Complex complexity banding above.)

### 8. Contact (`#contact`) — Onboarding Flow
Two-column layout:

**Left column (c-left):**
- Sanjith Dhandapani / Founder, Halcyon
- Email: sanjith@halcyon.uno
- Location: Plot No. 2041, 15th Main Road, H Block, Anna Nagar West, Chennai – 600040 (also in the JSON-LD `PostalAddress`)
- Response: Personal, within 24 hours.

**Right column (c-right) — 3-step onboarding.** The flow is intentionally enriched to give Sanjith enough to prep for a first call/visit before he replies:
1. **Step 1: "Tell me about your business."**
   - Industry chip selector (Manufacturing / Construction / Industrial Supply / Trading / Services / Other) — **required**
   - Company name — **required**
   - "What does your business do?" — **required** (the specific business, beyond the broad industry chip)
2. **Step 2: "What's the main challenge you want to solve?"**
   - Main challenge textarea — **required**
   - "How is it handled today?" textarea — **optional** (spreadsheets / WhatsApp / paper / existing software)
3. **Step 3: "Where can you be reached?"**
   - Your name — **required**
   - Your role — optional (e.g. Managing Director)
   - City, optional (the hint reads just "optional"; the city is what tells Sanjith whether an in-person meeting is possible, which is Chennai only, and never a site visit)
   - Email — **required**
   - WhatsApp / Phone — optional

`.ob-cap` is a DM Mono 9px uppercase caption used above field groups (e.g. "Industry") and for the optional-field hints; its `<span>` renders the "— optional" suffix de-emphasised.

On submit → posts the same structured JSON to **both** the Google Apps Script endpoint (Sheets log + email) and Formspree (`https://formspree.io/f/xjgqkkkq`, drives success/error state). Payload keys: `name, role, email, phone, company, city, business_type, business_detail, challenge, current_process` (optional fields fall back to `'Not provided'`). Shows "Message sent. / Sanjith will be in touch personally within 24 hours." Fallback error message directs to sanjith@halcyon.uno.

Progress bar: thin gold line at top of right column, fills 33% → 66% → 100% as steps advance. Back button slides content back from left. "← Back" link on steps 2 and 3.

### 9. Footer
HALCYON wordmark + "Tranquility engineered." tagline (left). "Operational Intelligence · Chennai / © 2026 Halcyon. All rights reserved." (right, DM Mono 10px).

---

## Animation System

### Three reveal classes (triggered by IntersectionObserver)

```css
.r        /* General: opacity 0 + translateY(28px) → none. Spring ease 0.9s */
.r-title  /* Section h2s: clip-path inset(0 0 100% 0) → inset(0 0 -8% 0). 1s spring. */
.r-scale  /* Cards: opacity 0 + scale(0.97) + translateY(32px) → none. 0.85s spring */
```

**Critical bug fix:** `.r-title` uses `clip-path` which makes intersection area = 0, so the standard IO with `threshold: 0.08` never fires. There is a **separate** `titleIO` with `threshold: 0` for `.r-title` elements.

```javascript
// Standard IO — for .r and .r-scale
const io = new IntersectionObserver(..., { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.r, .r-scale').forEach(el => io.observe(el));

// Title IO — threshold 0 to fire even when clip-path hides the element
const titleIO = new IntersectionObserver(..., { threshold: 0, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.r-title').forEach(el => titleIO.observe(el));
```

### Stagger delays
`.d1`, `.d2`, `.d3`, `.d4` add `transition-delay: 0.1s, 0.2s, 0.3s, 0.4s`. Applied to individual cards within a grid, not the grid wrapper.

### Animated gold bars
`.card-bar` and `.eng-bar` start at `width: 0` and animate to `20px`/`18px` via `transition` with a `0.35s delay` — triggered by parent `.r-scale.in`.

### Hero parallax (JS)
```javascript
heroName.style.transform = `translateY(${scrollY * 0.28}px)`
heroTag.style.transform  = `translateY(${scrollY * 0.18}px)`
heroBody.style.opacity = Math.max(0, 1 - scrollY / (vh * 0.55))
heroCta.style.opacity  = Math.max(0, 1 - scrollY / (vh * 0.55))
```
Uses `requestAnimationFrame` with a `ticking` flag to avoid scroll jank.

### Magnetic buttons (JS)
On `mousemove`: `btn.style.transform = translate(x*0.18px, y*0.22px)` with fast `0.12s` ease.
On `mouseleave`: transition switches to `0.55s cubic-bezier(0.34, 1.56, 0.64, 1)` for spring return to origin.

### Cursor glow on cards (JS + CSS)
```javascript
el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
el.style.setProperty('--my', `${e.clientY - rect.top}px`);
```
CSS `::before` pseudo-element on `.card`, `.eng`, `.w-card`:
```css
background: radial-gradient(280–320px circle at var(--mx,50%) var(--my,50%), rgba(196,154,56,0.06–0.07), transparent 65%);
opacity: 0 → 1 on hover.
```

### Onboarding step transitions
```css
.ob-step { display: none; }
.ob-step.active { display: block; animation: stepIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
.ob-step.back-in { animation: stepInBack 0.45s ... }  /* slides from left */
```

---

## Key Decisions Made

| Decision | Reason |
|----------|--------|
| No framework, no build step | Simplicity. Single static file, can be opened directly in a browser. |
| All sections dark (obsidian/charcoal) | Previous design had a light "paper" section for Our Work. Removed for visual consistency — the whole site is now dark. |
| Removed sections | Removed "Why Halcyon" (redundant) and "Who You'll Work With" (Sanjith's preference — he meets clients in person). |
| No "I" or "we" in body copy | Sanjith's specific request — the copy should be declarative statements, not first-person. |
| No "free" anywhere | Sanjith's request — it cheapens the brand. Changed to "Discovery session included". |
| Contact is an onboarding flow | Replaced flat form with 3-step flow to capture structured info (sector + problem + contact), which helps Sanjith prepare for first calls. |
| Two separate IntersectionObservers | clip-path on `.r-title` causes zero intersection area, so `threshold: 0` required for title IO. |
| `100svh` for hero | Uses `svh` (small viewport height) instead of `vh` to avoid mobile browser chrome issues. |
| `@media (hover: hover)` for card lifts | Prevents hover transform from triggering on touch devices. |
| mailto: for form submission | No backend. Constructs a mailto link on submit. Works without a server. |

---

## What's Left / Possible Next Steps

### High priority
- [ ] **Meta description update** — current one still says "Indian businesses in manufacturing" — should be updated to match the rest of the copy
- [ ] **Favicon** — none exists yet
- [ ] **Mobile testing** — animations and onboarding flow need testing on real mobile devices
- [ ] **OG tags** — no Open Graph tags for link previews (WhatsApp, LinkedIn sharing)

### Nice to have
- [ ] **Formspree integration** — swap the `mailto:` with Formspree so submissions are reliably received even if the client's mail app isn't configured. Sanjith mentioned this in early sessions.
- [ ] **Testimonials / quotes section** — as client relationships grow, a short quote from Neocrete or Swathi Engineering would add social proof
- [ ] **Case study depth** — the Our Work cards are intentionally brief. Could expand to individual case study pages if needed.
- [ ] **Cookie/privacy notice** — not legally required for a static site with no tracking, but worth considering if analytics are added later

### Potential improvements
- [ ] The `h-scroll-line` (pulsing gold scroll indicator) disappears once the user scrolls past the hero — could fade out smoothly instead of just going off-screen
- [ ] The mobile menu hamburger icon doesn't animate into an X on open — simple CSS improvement
- [ ] The nav active state could use a gold underline instead of just colour change
- [ ] Form validation feedback — currently no visual error state when required fields are empty in step 3

---

## File Structure

```
D:\Claude Projects\Halcyon Website\
├── index.html          ← The entire website. One file.
├── CLAUDE.md           ← This file.
└── .claude\
    └── launch.json     ← Preview server config (npx serve -p 3900 .)
```

No other files. No CSS files, no JS files, no images, no assets.

---

## Easing Reference

```
Standard:    cubic-bezier(0.4, 0, 0.2, 1)          — var(--ease)
Spring:      cubic-bezier(0.16, 1, 0.3, 1)          — used for reveals
Overshoot:   cubic-bezier(0.34, 1.56, 0.64, 1)      — magnetic button return
```
