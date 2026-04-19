---
name: 15 Minute Sales Sprint
description: Free 15-min micro-event landing page for salespeople. Live with form, scarcity counter, social-proof toasts, automatic confirmation email + free chapter delivery.
type: project
originSessionId: 023a411f-3fc2-4e44-bd97-278fd6228bbb
---
# 15 Minute Sales Sprint

**Live URL:** https://15-minute-sales-sprint.netlify.app
**GitHub:** https://github.com/smagnacca/15-minute-sales-sprint
**Project root:** `~/Documents/Claude/Projects/15-minute-sales-sprint/`
**Status:** Live, polished, expert-panel punch-list shipped (items 1–10) + book section + testimonial photos + hybrid social proof system (real registrations from Netlify Blobs + simulated toasts) as of 2026-04-19.
**Event date:** **Wednesday, June 17, 2026 · 7:00 PM ET** (Zoom — link sent day before).

## Current hero copy (2026-04-19, post-panel)
- **Eyebrow:** `PRACTICAL AI · LIVE · 15 MINUTES` (now solid gold, no animation)
- **Hero badge:** `Wed June 17 · 7:00 PM ET` (green dot, no blink)
- **H1:** `Learn how to use AI to build connections and book more sales meetings on LinkedIn.` — solid white, no pulse
- **Subhead (italic serif):** *A free 15-minute live sprint — Wednesday, June 17 at 7:00 PM ET.*
- **Subtitle:** **One powerful play. Fifteen focused minutes.** A live micro-event for **salespeople and sales-adjacent pros** who don't have time to waste. Walk away with a move you can run that same week.
- **Live countdown timer** below CTA: days/hrs/min/sec ticking to event start
- Scott prefers `and` written out, NOT `&amp;` / `&`.

## Animation policy (post-panel, 2026-04-19)
**Cut from 15+ concurrent animations down to ~5 functional ones.** Per Graphic Designer feedback ("HBR/MIT Sloan use ~2 motion accents per page; this was carnival").

**Kept:**
- `pulse-cta` — gold glow on Reserve buttons (CTA emphasis)
- `fade-in` scroll reveals (Intersection Observer triggered, user-initiated)
- `count-flash` — gold scale-flash on attendance counter when toast bumps it (functional feedback)
- `toast-slide-in/out-left/right` — social proof toasts (only when toast appears)
- `count-up` — stat counters animate from 0 → target on scroll into view

**Removed:** `masthead-pulse`, `minutes-flash`, `phrase-pulse-blue`, `phrase-pulse-gold`, `verb-pulse`, `gold-border-pulse`, `hero-bg-drift`, `blink-dot`, `float-badge`, `blink-green/yellow/red` (status lights), `gold-text-glow`, `metallic-shimmer` on H2.

**Note:** The blue→gold sequential phrase pulse on H1 was removed when H1 was rewritten to Scott's AI/LinkedIn unified line. If you re-add a hero pulse later, the old keyframes are in git history at commit before `41d492b`.

## Scott's headshot
- Path: `src/img/scott.jpg` (331×344 PNG, professional portrait, 137 KB)
- Used in: bio block (120px circular avatar with gold border + glow)
- CSS: `object-fit: cover; object-position: center top` so face stays framed
- Gradient `var(--gradient-green)` kept as fallback background if image ever fails
- **Not yet used** in: confirmation email template (still uses gradient SM circle there — could swap if desired)

## Current state of key features (as of 2026-04-19, post-book-section)
- **Capacity:** 55 seats (soft-cap, single source of truth). `MAX_CAPACITY = 55` constant. Was previously contradictory (75 in hero / 55 in form) — panel flagged as #1 trust killer; now reconciled.
- **Live countdown timer** below hero CTA, ticks to `2026-06-17T19:00:00-04:00`. When event is live, swaps to "🔴 LIVE NOW — Join the Sprint" green pill.
- **Agenda block** below "Bonus" reciprocity in Sprint section: Min 1-5 (AI prompt), Min 6-10 (connection request), Min 11-15 (follow-up sequence).
- **Audience filter** (✓ for / ✗ not-for): 2-column 4-bullet block disqualifying tire-kickers, MLM, spam-at-scale.
- **Trust block** above register form: 3 green pills (No pitch / No upsell / Replay if you miss it).
- **Outcome testimonials** (beta cohort with real photos, 2026-04-19): Marcus T. (Enterprise AE / SaaS, `tai-b.jpg`), Priya S. (Financial Advisor, `farrell-d.jpg`), Dan R. (Regional Sales Manager, `troy-b.jpg`). Avatar images replaced initials. Quotes are placeholder; replace with real attendee quotes after Spring 2026 sessions.
- **Book authority section** (NEW, 2026-04-19): Placed after bio block before Sprint section. Features `Storyselling.jpg` cover image (140px width, gold border shadow) + Option 3 concept copy emphasizing human storytelling + AI synergy. Mobile-responsive grid (vertical stack on <640px).
- **Counter starting value:** 12 (fixed, no longer random). `INITIAL_COUNT = 12`.
- **Daily reset:** counter rolls back to 12 at 8 AM **visitor's local time** (`RESET_HOUR = 8`). Persists via `localStorage['sprintAttendance_v1']` keyed to a "day anchor" (most-recent 8 AM timestamp). Open-tab visitors auto-reset via 60s interval check.
- **Toast ↔ counter coupling:** every social-proof toast bumps the counter +1 with a gold scale-flash on the hero number (`count-flash` keyframe). Stops bumping when capacity hit.
- **Card 1 image** (`src/img/format-team-call.jpg`): diverse Zoom call on a desktop monitor. 288×233 PNG (small — slightly soft on Retina). Saved by Scott from chat.
- **Card 2 image** (`src/img/promise-basketball.jpg`): basketball going through net. 900×1200, full-resolution.
- **Card 3 image** (`src/img/why-now-runner.jpg`): runner crossing finish line, arms raised. 248×251 PNG (small — slightly soft on Retina). Saved by Scott from chat.
- **Card visual treatment:** 16:10 aspect ratio top of card, hover scale 1.05× over 0.6s, gold number badge floats over corner.

## What it is
A free 15-minute live virtual event for salespeople and sales-adjacent pros. One powerful, immediately-applicable idea per session. Featured (current) sprint topic: **Using LinkedIn To Transform Your Sales & Marketing (For Free)**. Sister site to The AI Mastery Summit, sharing brand system + animation vocabulary.

## Architecture
- **Single-page static site** in `src/index.html` (no build step). Inline CSS + JS, ~1200 lines.
- **Netlify Forms** for registration capture (form name: `sprint-registration`, fields: firstName, lastName, email, company, role, city [hidden, IP-geolocated], state [hidden, IP-geolocated]).
- **Netlify Function** at `netlify/functions/submission-created.js` triggered by Netlify's built-in `submission-created` event. Sends a branded HTML confirmation email via SendGrid (@sendgrid/mail) AND writes registration data (firstName + city + state) to Netlify Blobs for the social proof toast system.
- **Netlify Function** at `netlify/functions/recent-registrations.js` returns last 20 real registrations as JSON (privacy-safe payload). Used by social proof toasts.
- **Netlify Blobs** store: `sprint-data` / key: `recent-registrations` (FIFO, max 50 entries). `@netlify/blobs` package required.
- **Free chapter PDF** at `src/downloads/storyselling-chapter-1.pdf` (17 pp / 690 KB), served with `Content-Disposition: inline`.

## Hybrid social proof toast system (2026-04-19)
- **Threshold:** <5 real registrations stored = 100% simulated toasts; ≥5 = 70% real / 30% simulated.
- **Real queue:** round-robin so the same real registrant doesn't appear back-to-back.
- **Refresh:** page fetches `/.netlify/functions/recent-registrations` every 60s.
- **Geolocation:** `ipapi.co/json/` (free, no key needed) called once on page load to fill hidden `city`/`state` form fields. Silent fail if blocked.
- **Pacing:** toasts every 15-20s (was 35-55s pre-2026-04-19).
- **Privacy:** stored Blob entries contain firstName + city + state + timestamp ONLY. No email, no last name, no company.

## Sender / email config
- **From:** `Scott Magnacca <scott@scottmagnacca.com>` (uses the authenticated `scottmagnacca.com` domain on SendGrid).
- **Reply-To:** `scott.magnacca1@gmail.com` (replies route directly to Scott).
- **SENDGRID_API_KEY** stored as a Netlify env var (production context, secret).
- **Dashboard form-notification** also emails Scott separately — that one's the "you got a registration" alert.

## Why: Cialdini-loaded
Scarcity (50-seat ticker, capacity message), authority (Harvard/Babson/Fidelity-producer credentials), social proof (rotating "X from [city] just registered" toasts + Fidelity testimonials), reciprocity (free chapter), commitment/consistency (form micro-copy), liking (warm hosted bio + photo-style avatar).

## Why: A-quality form
Browser autofill via `autocomplete` tokens, `font-size:16px` (no iOS zoom), inline error display (no `alert()`), `prefers-reduced-motion`, skip-link, `:focus-visible` outlines, mobile-first responsive (form-row stacks on <600px).

## Known gotchas (carry forward — see also: feedback_netlify_forms_setup.md)
- **Netlify Forms** `processing_settings.ignore_html_forms` defaulted to `true` on this account — had to PATCH via API to enable form detection. Form was registered only after this + a redeploy + a real submission.
- **Custom subject for Netlify Form notifications** can only be set via dashboard UI — API ignores `custom_subject`. **Outstanding TODO:** set "15 Minute Sales Sprint Registration" via dashboard.
- **Akismet** aggressively flags plus-tagged emails from headless browsers — direct function invocation needed for QA (don't submit via Playwright with `+test` emails).

## Email preview workflow (always run after editing the email template)
**Whenever I edit `netlify/functions/submission-created.js`** (or any email-template logic), I must immediately:
1. Run `bash tools/preview-email.sh` from the project root
2. This regenerates `src/email-preview.html` from the live function code (using sample data: firstName=Scott, company=Babson), starts/reuses the python http.server on port 3001 if needed, and opens the rendered email in Scott's default browser
3. Show Scott the URL `http://localhost:3001/email-preview.html` so he can review the rendered HTML before any deploy

The preview file is gitignored (`src/email-preview.html`). Don't commit it. The script lives at `tools/preview-email.sh`.

This rule overrides the instinct to deploy first and let Scott check the live email — render locally, show him, then deploy.

## How to apply
- For tweaks: edit `src/index.html`, commit, push, and `netlify deploy --prod --dir=src --functions=netlify/functions` from the project root.
- For email template changes: edit `netlify/functions/submission-created.js`. PDF can be swapped by `cp`-ing a new file over `src/downloads/storyselling-chapter-1.pdf`.
- When a real event date is set: replace "Coming Soon" badge in hero, flip to a live countdown timer (reuse Summit countdown JS), add `.ics` calendar invite to the confirmation email.
