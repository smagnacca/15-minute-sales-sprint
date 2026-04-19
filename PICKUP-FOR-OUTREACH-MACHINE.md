# Pickup Prompt — Wire 15-Minute-Sales-Sprint registrations into the Outreach Machine

**Use this:** Open a new Claude session *from inside* `~/Documents/Claude/Projects/email-outreach-machine/` and paste the block below as your first message. It's fully self-contained — no prior context required.

---

## ⬇️ COPY EVERYTHING BELOW THIS LINE INTO THE NEW CHAT ⬇️

I need you to wire up a new lead source into this Outreach Machine project. Specifically: registrations from my **15-Minute Sales Sprint** landing page should flow into a **new tab called `15-min-sprint`** on the same Google Sheet that the Outreach Machine already uses.

**Scope (what you should and should NOT do):**
- ✅ Build the webhook receiver in this project that accepts the lead payload and writes to the Sheet
- ✅ Create / configure the `15-min-sprint` tab on the existing Sheet (correct columns, header row, formatting)
- ✅ Document the env vars and webhook URL the Sprint project needs
- ✅ Provide the exact ~5 lines I need to add to the Sprint project's `submission-created.js` (don't edit the Sprint repo from this session — just give me the snippet to paste)
- ❌ Do NOT modify the existing Outreach Machine outbound sequences, contact-form processing, or other lead sources
- ❌ Do NOT change the existing Sheets tabs that other lead sources write to

---

### Source system (read-only context, do not modify from this session)

- **Project:** `~/Documents/Claude/Projects/15-minute-sales-sprint/`
- **Live URL:** https://15-minute-sales-sprint.netlify.app
- **GitHub:** https://github.com/smagnacca/15-minute-sales-sprint
- **Form name:** `sprint-registration` (Netlify Forms)
- **Trigger:** Netlify built-in `submission-created` event fires `netlify/functions/submission-created.js` on every registration
- **Currently does:** Sends SendGrid confirmation email + writes (firstName, city, state) to Netlify Blobs for social-proof toasts on the landing page
- **Will add:** A 5-line outbound `fetch()` POST to the webhook URL you create here, after the SendGrid send

### Lead payload the Sprint will POST (already captured by the form)

```json
{
  "source": "15-min-sales-sprint",
  "submittedAt": "2026-04-19T16:42:11.000Z",
  "firstName": "Sarah",
  "lastName": "Hartwell",
  "email": "sarah@acme.com",
  "company": "Acme Corp",
  "role": "Sales Leader",
  "city": "Boston",
  "state": "MA"
}
```

All fields are strings except `submittedAt` (ISO 8601). `role` is one of: `Salesperson`, `Sales Leader`, `Marketing`, `Sales Ops`, `Founder`, `Other`, or empty. `city` / `state` are auto-derived from IP geolocation (may be empty if the visitor blocked it).

---

### What to build in THIS project (email-outreach-machine)

1. **Identify the existing Google Sheets auth method this project already uses** (service account JSON? OAuth tokens? Google Apps Script bound to the Sheet?). Reuse it — do not introduce a new auth path.

2. **Identify the existing Sheet ID** the Outreach Machine writes to. Confirm with me before adding a new tab to a Sheet you're not 100% sure about.

3. **Create the `15-min-sprint` tab** on that Sheet with this header row (row 1, frozen, bold):

   | A | B | C | D | E | F | G | H | I | J |
   |---|---|---|---|---|---|---|---|---|---|
   | Submitted At (ET) | First Name | Last Name | Email | Company | Role | City | State | Source | Status |

   - Column A: ISO datetime converted to America/New_York display
   - Column I: always `15-min-sales-sprint` (so I can filter all sprint leads later)
   - Column J: starts as `New` — leave room for the outreach sequence to update it later (`Contacted`, `Replied`, `Booked`, etc.)
   - Set Column D (Email) to data validation: `must be a valid email`
   - Add filter view + freeze row 1

4. **Build the webhook receiver function** (Netlify Function, Google Apps Script Web App, or whatever framework matches this project's existing pattern):
   - **Endpoint:** something like `POST /.netlify/functions/sprint-lead-webhook` (or equivalent)
   - **Auth:** Require an `X-Outreach-Secret` header matching env var `OUTREACH_WEBHOOK_SECRET`. Reject 401 if missing/wrong. Generate a random 32-char secret and tell me what to set it to.
   - **Validation:** Reject payloads missing `email` or `firstName`. Sanitize all fields (trim, length-cap).
   - **Dedup:** Before appending, check if `email` already exists in the `15-min-sprint` tab. If yes, update the row instead of duplicating. Don't break if dedup fails — log and append anyway.
   - **Append the row** with the schema above.
   - **Return** `{ status: 'ok', action: 'appended' | 'updated', row: <rowNumber> }` on success, `{ status: 'error', message: ... }` on failure.
   - **Always return 200** (even on internal errors) so the Sprint's webhook doesn't retry forever — log errors instead.

5. **Document everything** in this project's README/CHANGELOG:
   - The new endpoint URL
   - The env vars I need to set on BOTH sides:
     - In this project (Outreach Machine): the Sheet ID, Google auth credentials, `OUTREACH_WEBHOOK_SECRET`
     - In the Sprint project (give me the snippet): `OUTREACH_WEBHOOK_URL`, `OUTREACH_WEBHOOK_SECRET`
   - The exact ~5-line snippet I need to paste into `15-minute-sales-sprint/netlify/functions/submission-created.js` (right after the SendGrid send, wrapped in try/catch so a failed webhook never blocks the email)

6. **Test end-to-end with a real submission** once everything's wired:
   - I'll register on https://15-minute-sales-sprint.netlify.app with a unique test email
   - Confirm the row appears in the `15-min-sprint` tab within 30 seconds
   - Confirm the confirmation email still sends (the webhook must not break the email path)
   - Test the dedup by submitting the same email twice — should update, not duplicate

---

### Constraints + best practices

- **Privacy:** Email addresses ARE stored in the Sheet (this is fine — it's the outreach pipeline's source-of-truth). Last name + company also stored. Do NOT log full PII to function logs in production — just log `email` (so I can grep for issues).
- **Idempotency:** If the same submission webhook fires twice (Netlify retries on 5xx), the dedup logic handles it.
- **Failure isolation:** A failed webhook call must NEVER block the registration confirmation email. The Sprint's `submission-created.js` will wrap the outbound `fetch` in try/catch.
- **No coupling:** The Sprint project knows ONLY the webhook URL + secret. It doesn't know about Sheets, doesn't know what Status values exist, doesn't know about the outreach sequence. All of that lives here.
- **Future-proof:** Build the receiver so a future lead source (quiz, podcast signup, etc.) could use the same endpoint by just sending `source: '<their-source-name>'` and writing to its own tab. For now, hardcode the `15-min-sprint` tab — but design the function so adding a tab-routing map later is a one-line change.

---

### Order of operations

1. Read this project's existing code first — understand how it auths to Sheets, what framework the existing functions use, what conventions are in place
2. Tell me the Sheet ID and auth method you found, get my confirmation before touching the Sheet
3. Create the `15-min-sprint` tab manually (or via API) with the schema above
4. Build the webhook function
5. Generate the secret + give me the env var values + the Sprint snippet
6. We test end-to-end with a real submission

**Confirm you understand the scope and ask me anything you need before starting. Don't code blindly.**

---

## ⬆️ COPY EVERYTHING ABOVE THIS LINE ⬆️

---

## After the new session is done

That session will give you:
1. A snippet to paste into `15-minute-sales-sprint/netlify/functions/submission-created.js`
2. Two env var values to set in the Sprint's Netlify env (`OUTREACH_WEBHOOK_URL`, `OUTREACH_WEBHOOK_SECRET`)

Open Claude in **this** (15-min-sprint) folder again, paste the snippet + env vars, and we'll deploy + test from this side.
