# Changelog — 15 Minute Sales Sprint

## 2026-04-20 — Engagement scroll animations (engagement-animation agent)

Added section-by-section scroll-triggered reveals across the full page using CSS transitions + IntersectionObserver. All animations are one-shot (fire on entry, don't repeat), GPU-composited (transform + opacity only), and fully respect `prefers-reduced-motion`. No new JS libraries or build dependencies.

**New animation vocabulary:**
- `.card-lift` — `translateY(28px) scale(0.97) → none` over 0.72s. Replaces bare `fade-in` on all cards and panels.
- `.slide-left` / `.slide-right` — `translateX(±22px) → none` over 0.65s. Used for two-column split reveals.
- `.word-reveal-word` — `translateY(12px) → none` over 0.45s per word span. Used for section headings.
- `.agenda-cell` — `translateY(18px) → none` over 0.6s; staggered 200ms apart via dedicated observer.
- `.stat-glow-once` — 1.4s gold text-shadow burst fires once after each counter finishes counting.

**Section-by-section changes:**
- **What section h2:** Word-by-word phrase reveal — "15 minutes." → "One idea." → "Zero fluff." each fade up in sequence (0 / 160 / 320ms delays).
- **What cards (3):** Upgraded from `fade-in` → `card-lift` with 130ms stagger between cards.
- **Bio block:** Removed parent `fade-in`; avatar slides from left, text block slides from right (100ms delay).
- **Book section:** Cover slides from left, copy slides from right (120ms delay).
- **Sprint section h2:** Smooth `fade-in` on scroll entry.
- **Outcome boxes (4):** Alternating left/right slides with 120ms stagger — box 1&3 left, box 2&4 right.
- **Agenda cells (3):** Sequential stagger — cell 1 → 200ms → cell 2 → 200ms → cell 3.
- **Audience filter:** ✓ column slides left, ✗ column slides right — simultaneous split reveal.
- **Stat cards (3):** `card-lift` with stagger; gold glow burst fires once when counter completes.
- **Testimonials intro + 3 cards:** All `card-lift` with 150ms stagger.
- **Register box:** `card-lift` entrance as user scrolls to form.
- **Trust pills (No pitch / No upsell / Replay):** Left → center → right cascade (100ms / 200ms delays).

**Also created:** `~/.claude/skills/engagement-animation.md` — a reusable skill that encodes this animation vocabulary, guiding principles, and workflow for future sessions on any project.

Commit: `26274dc`

---

## 2026-04-20 — Hero H1 blue wave sweep animation

Replaced the one-shot tagline-blue/tagline-gold phrase pulse with a sequential **blue wave sweep** that:
- Starts all white text
- Wave flashes "Learn how to use AI" sky blue and it **stays blue** (3.5s)
- Wave flashes "build connections" sky blue and it **stays blue** (3.5s)
- 1-second pause with both phrases blue
- Wave flashes "book more sales meetings on LinkedIn" sky blue and it **stays blue** (3.5s)
- All text holds blue for 10 seconds
- Cycle resets when H1 scrolls back into view

Total cycle: 21.5s. Uses three independent keyframe animations (`wave-p1`, `wave-p2`, `wave-p3`) triggered by IntersectionObserver on H1 entry. Restructured H1 markup to three `pulse-phrase` spans for granular animation control.

Removed old animations: `phrase-pulse-blue`, `phrase-pulse-gold`. Removed classes: `.tagline-blue`, `.tagline-gold`.

Files: `src/index.html` (CSS keyframes + H1 markup + JS observer).

Commit: `ba63d5f`

---

## 2026-04-19 — Targeted motion restore (3 conversion-triggered animations)

Added back 3 of the 12 animations stripped in the expert-panel punch-list — but all **trigger-gated** (fire on user action or real event), never ambient. Keeps the panel's "motion as reward, not wallpaper" discipline while reclaiming the conversion moments the stripped set was leaving on the table.

**1. One-shot hero H1 phrase pulse.** Wrapped `AI` (blue, 0.6s delay) and `LinkedIn` (gold, 2.1s delay) in the H1 — each flashes once over 3s on page load, then holds white. Pulls the reader's eye through the two phrases that drive the "is this for me?" decision in the first 3 seconds. Fill-mode `both`, so no ambient loop.

**2. Scarcity-gated countdown pulse.** Three tiers wired into `updateCountdown()`:
- `<7 days` → soft gold glow on all cells (4s cycle)
- `<48 hrs` → brighter/faster gold glow (2s cycle)
- `<2 hrs` → seconds cell flips red + fast red pulse (1s cycle)

Dormant when there's no real urgency — so when it fires, it *means* something. Amplifies the final-72-hour registration cluster.

**3. One-shot gold-border sweep on the Bonus reciprocity box.** IntersectionObserver fires a single 2.4s gold-border glow when the box enters the viewport (threshold 0.5), then unobserves. Pulls the eye to the free-chapter reciprocity trigger at the exact scroll moment the reader is deciding whether to keep scrolling or register.

**All three respect `prefers-reduced-motion: reduce`** — animations disabled for users who've opted out.

**What was NOT brought back** (still ambient / still bad): `masthead-pulse`, `minutes-flash`, `verb-pulse`, `blink-dot`, `hero-bg-drift`, `float-badge`, `gold-text-glow`, `metallic-shimmer`, status-light blinks.

Files: `src/index.html` (CSS + H1 markup + JS). No new dependencies.

---

## 2026-04-19 — Email Polish + Template Library

**Confirmation email tweaks (live):**
- Header fonts +25% (eyebrow 13→17px, tagline 18→23px) for readability
- "WHAT HAPPENS NEXT" + "📖 YOUR THANK-YOU GIFT" labels: 11→15px, deeper navy color (#1A2040) for crisp contrast
- Replaced "SM" initial circle with Scott's actual headshot (`scott.jpg`) in the signature avatar
- Added 100px Storyselling.jpg book cover image inside the gift box (next to "Chapter 1 of...")
- Removed dynamic company personalization ("at Babson") → now reads "at our exclusive event"
- Added curiosity teaser block: "Imagine reaching 135 million professionals... AI move we'll show you live" (italic serif hook + curiosity question + bold close, gold left-border accent)
- Mobile header letter-spacing 0.18em → 0.10em + nowrap so "THE 15 MINUTE SALES SPRINT" stays on one line at 390px
- Dropped redundant "Within 5 minutes" bullet (stated the obvious — they're reading the email)
- Bullet text bumped 14→15px

**Audit results:** 49-second read time (down from 55s), all section labels pass WCAG AAA contrast (≥14:1), mobile/desktop both render cleanly.

**Email template library (NEW):**
- Created `email-templates/` directory with three reusable templates following the same structural DNA:
  - `15-min-sales-sprint-1.html` — Registration confirmation (sent immediately on signup)
  - `15-min-sales-sprint-2.html` — 48-hour reminder (Monday morning before Wed event), uses "Stop Talking. Start Persuading." theme
  - `15-min-sales-sprint-3.html` — Day-of email (Wed morning of event), uses Warren Buffett quote + prominent Zoom CTA
- Reusable components: header eyebrow + tagline → greeting → teaser block (gold-accent quote box) → expectations list → action card → photo signature → dark footer
- All use `{{firstName}}` and `{{eventDateTime}}` placeholders for easy adaptation
- Updated `tools/preview-email.sh` to support `--template <name>` arg for previewing any template

**Commits:**
- `8fb25cd` — Bigger header, darker labels, Scott photo, book cover
- `82d6d32` — Mobile header fix + tighter teaser + drop filler bullet
- (this commit) — Email template library

---

## 2026-04-19 — Hybrid Social Proof System (real + simulated toasts)

**Added:**
- New Netlify Function `recent-registrations.js` — exposes last 20 real registrations as JSON (privacy-safe: firstName + city + state only, no email/last name)
- `submission-created.js` now writes registration data to Netlify Blobs (`sprint-data` store, `recent-registrations` key, max 50 entries, FIFO)
- Hidden `city` and `state` fields on the form, auto-populated via `ipapi.co/json/` IP geolocation on page load
- Hybrid toast logic: <5 real registrations = 100% simulated; ≥5 real = 70% real / 30% simulated, with round-robin recycling so the same real registrant doesn't appear back-to-back
- 60-second periodic refetch of real registrations so new ones surface in toasts within a minute

**Why:** Solves consistency issue between fake toast counter and actual form submissions. Toasts now reflect actual registration activity once the campaign matures, while still maintaining urgency pacing during launch phase.

**Research basis:** 5+ social proof signals threshold (Spiegel Research Center). 70/30 mix preserves consistent 15-20s pacing without making the page feel artificial as real volume grows.

**Toast frequency:** Sped up from 35-55s to 15-20s for higher urgency density.

**Commits:**
- `7e59d79` — Speed up social proof toasts to 15-20s
- `ebc8af6` — Hybrid social proof toasts (real + simulated mix)

**Live verification:** `curl https://15-minute-sales-sprint.netlify.app/.netlify/functions/recent-registrations` → `{"count":0,"registrations":[]}` (will populate as real registrations come in)

---

## 2026-04-19 — Book Section + Testimonial Photos

**Added:**
- Book authority section below bio block: Storyselling.jpg cover image + Option 3 concept copy ("AI can generate content, but only humans tell stories that create real connection...")
- Testimonial avatar photos: tai-b.jpg (Marcus T.), farrell-d.jpg (Priya S.), troy-b.jpg (Dan R.) replacing text initials
- Book section responsive CSS (mobile stacks vertically)

**Commits:**
- `9f3ea51` — Add book section + testimonial photos
- `37ef57e` — Update book section with Option 3 concept copy

**Live:** https://15-minute-sales-sprint.netlify.app

**Next:** Form CTA testing, email deliverability QA, final pre-event checklist (June 16-17).
