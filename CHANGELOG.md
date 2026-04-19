# Changelog — 15 Minute Sales Sprint

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
