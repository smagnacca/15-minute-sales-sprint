# 15 Minute Sales Sprint — Email Template Library

Three reusable email templates that share the same structural DNA. Use these as the source of truth for the brand voice, layout, color, and component patterns. Copy and tweak content for new campaigns.

## The three templates

| # | File | When | Subject line | Theme |
|---|---|---|---|---|
| **1** | `15-min-sales-sprint-1.html` | Immediately on registration | *Welcome to the 15 Minute Sales Sprint — your free chapter is inside* | Confirmation + reciprocity (free chapter) + curiosity (135M LinkedIn pros) |
| **2** | `15-min-sales-sprint-2.html` | Monday morning, 48 hours before event | *Two days until your 15 Minute Sales Sprint* | "Stop Talking. Start Persuading." + calendar block CTA |
| **3** | `15-min-sales-sprint-3.html` | Wednesday morning of event (~8 AM) | *Tonight at 7 PM ET — your 15 Minute Sales Sprint* | Warren Buffett quote + prominent Zoom CTA |

## The reusable structural DNA (every email has these 7 zones, in order)

```
1. HEADER          Dark navy gradient. Eyebrow (gold, all-caps, 17px) + tagline (italic serif, 23px).
2. (Optional strip) Live-tonight gold strip — only used in #3 to signal urgency.
3. GREETING        H1 ("You're in" / "Two days" / "Tonight") + 1-line context paragraph.
4. TEASER BLOCK    Light-blue card with gold left border. 3 paragraphs:
                   (a) italic serif hook
                   (b) curiosity question OR data point
                   (c) bold navy payoff line
5. BULLET LIST     "What happens next" / "What to expect" / "What to bring".
                   2-3 bullets. Gold arrow + bold lead + gray body.
6. ACTION CARD     Cream box with gold border. Eyebrow + H2 + 1-2 lines + GOLD CTA button.
                   In #3, this card is INVERTED (dark navy bg) to make the Zoom CTA dominate.
7. SIGNATURE       Scott's photo (56px gold-bordered circle) + "See you live, Scott Magnacca"
                   + credentials line. Reply-direct invitation below.
8. FOOTER          Dark navy strip with unsubscribe text + reply-direct reminder.
```

## Design tokens (use these, don't invent new ones)

```
COLORS
  Navy deep:       #080D1A    Dark navy mid:   #0D2045
  Brand navy:      #1A3A6B    Headline navy:   #1A2040
  Gold mango:      #EEAF00    Gold light:      #DDD055
  Cream tint:      #FFF8E1    Section bg:      #F8FAFD
  Body gray:       #4B5563    Muted gray:      #6B7280

FONTS
  Sans body:    -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif
  Serif accent: Georgia, serif (used for tagline + teaser hook + book title italics)

SIZES (passed WCAG AAA contrast in light + dark contexts)
  H1 greeting:        28px / 900
  H2 card title:      20-24px / 900
  Body paragraph:     15-16px / 400-700
  Section labels:     15px / 900 / 0.14em letter-spacing / uppercase
  Eyebrow header:     17px / 800 / 0.10em letter-spacing / uppercase
  Tagline:            23px / italic serif
  CTA button:         15-17px / 800-900
  Footer:             11-13px / muted

GRADIENTS
  Header:        linear-gradient(135deg,#080D1A 0%,#0D2045 50%,#1A3A6B 100%)
  Gold CTA:      linear-gradient(90deg,#EEAF00 0%,#DDD055 50%,#EEAF00 100%)
  Cream card:    linear-gradient(135deg,#FFFDF5 0%,#FFF8E1 100%)
  Teaser bg:     linear-gradient(135deg,#F8FAFD 0%,#EEF3F9 100%)
```

## Variables (placeholder syntax)

These tokens appear in the templates and should be replaced before sending:

| Token | Example value | Notes |
|---|---|---|
| `{{firstName}}` | `Sarah` | Falls back to "there" if missing |
| `{{zoomLink}}` | `https://us02web.zoom.us/j/...` | Only in template #3 |

To use real interpolation in the live SendGrid send (template #1), the function `submission-created.js` builds the HTML at request time with JS template literals. For #2 and #3 (which need to be sent on a schedule), wire them through SendGrid's Dynamic Templates feature OR build a Netlify scheduled function that pulls registrations from Blobs and sends per-recipient via SendGrid.

## Voice rules (apply to all 3)

- **Read time target: under 60 seconds.** Every word earns its spot.
- **Curiosity > completeness.** The teaser block raises a question; the live event answers it.
- **Specific over generic.** "135 million professionals" beats "lots of people". "7 PM ET sharp" beats "evening".
- **Italics + bold are pacing devices.** Serif italic = emotional/memorable line. Bold navy = the sentence you must remember.
- **No company personalization.** Avoid `at ${company}` — felt awkward when it rendered "at Babson" for non-Babson registrants. Use "at our exclusive event" instead.
- **Always end with a reply-invitation.** "Just hit reply — straight to my inbox." Lowers barrier, builds trust.
- **WCAG AAA contrast on every text element.** Test with `color-contrast` tools before shipping.

## How to preview

```bash
# Render template #1 (the live confirmation, built from submission-created.js)
bash tools/preview-email.sh

# Open templates 2 and 3 directly (they're already static HTML)
open email-templates/15-min-sales-sprint-2.html
open email-templates/15-min-sales-sprint-3.html
```

## How to create a new email in this style

1. Copy the closest existing template (#1 for confirmations, #2 for reminders, #3 for day-of)
2. Update the 7 zones in order — keep the structure, swap the content
3. Run an audit: word count <250, read time <60s, no contrast failures
4. Render at mobile (390px) and desktop (1200px) with Playwright before sending
5. Always include `{{firstName}}` for personalization
6. Update this README's table at the top with the new template

## Anti-patterns to avoid

- ❌ More than 3 bullets in the "what happens next" block (kills momentum)
- ❌ Multiple CTAs competing in one email (one primary action, one secondary at most)
- ❌ Stock photography in the hero — use Scott's actual headshot or branded asset
- ❌ Letter-spacing wider than 0.10em on long uppercase strings (mobile wraps badly)
- ❌ Body text smaller than 15px (under 14px fails accessibility on most clients)
- ❌ Naked URLs (always use anchor text — "Open Zoom Link →" not "https://zoom.us/...")
