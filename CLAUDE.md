# HALCYON Website — Project Context

## What This Is

A single-page marketing website for **Halcyon**, an AI automation consultancy based in Chennai, India. Founded by **Sanjith Dhandapani**. The site is entirely vanilla HTML/CSS/JS — no framework, no build step, no dependencies beyond Google Fonts.

**File:** `D:\Claude Projects\Halcyon Website\index.html` — the only file that matters.

**Preview server:** `npx serve -p 3900 .` — config lives in `.claude/launch.json`. Start it with the `halcyon` launch config. Previous server ID was `e304908b-58ce-4329-9c25-1eb773eaa89a` (will change each session).

---

## Business Context

- Halcyon builds **bespoke operational systems** for SMEs in manufacturing, construction, industrial supply, and trading.
- Clients come via **referral only** — no cold outreach. The site's job is to give a referred prospect confidence before they reach out.
- Sanjith **visits clients in person** in Chennai. There is no "online" service. Never imply remote/online delivery.
- The target audience is **MDs and business owners** of established SMEs, not tech-savvy buyers.
- **Don't lead with AI** — position it as operational intelligence, not AI software.
- Pricing is shown on the site as reference points; actual engagements are scoped in discovery.
- **Live clients:** Neocrete (Supervisor Management System) and Swathi Engineering Agencies (Intelligent Quotation Engine).

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
- **No "I" or "we"** in body copy — write in direct, declarative sentences
- **No "free"** anywhere — it cheapens the brand
- **No third-person "the founder"** — use "Sanjith Dhandapani / Founder, Halcyon"
- **No "Indian"** qualifier — just "businesses"
- **No sector tags row** — the Manufacturing · Construction · Trading line was removed

---

## Page Architecture

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
Three pricing tiers (updated to match Sanjith's current pricing structure):

| Tier | For | What | Setup | Monthly |
|------|-----|------|-------|---------|
| **Starter** | Small business, 1 problem | 1 custom automation or workflow | ₹15,000–40,000 | ₹8,000/mo |
| **Growth** | Active SME, multiple workflows | 2–3 apps or agents built over time | ₹60,000–1,20,000 | ₹15,000–20,000/mo |
| **Partner** | Serious operation, ongoing build | Continuous build + strategy | Quoted per project | ₹25,000–35,000/mo |

Features per tier: 1 / 2 / Unlimited within scope. Support: Email / WhatsApp / Dedicated + monthly call. All include "Discovery session included."

Footer note: "All retainers include monthly improvements, same-day support, and API usage up to a baseline. Every new application is scoped and quoted separately."

### 8. Contact (`#contact`) — Onboarding Flow
Two-column layout:

**Left column (c-left):**
- Sanjith Dhandapani / Founder, Halcyon
- Email: sanjith@halcyon.uno
- Location: Chennai, Tamil Nadu, India
- Response: Personal, within 24 hours.

**Right column (c-right) — 3-step onboarding:**
1. **Step 1:** "What kind of business do you run?" — chip selector (Manufacturing / Construction / Industrial Supply / Trading / Services / Other)
2. **Step 2:** "What's the main challenge you want to solve?" — textarea with descriptive placeholder
3. **Step 3:** "Where can you be reached?" — Name + Email (required) + Phone (optional)

On submit → posts to Formspree (`https://formspree.io/f/xjgqkkkq`) with structured JSON (business type + challenge + contact info). Shows "Message sent. / Sanjith will be in touch personally within 24 hours." Fallback error message directs to sanjith@halcyon.uno.

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
