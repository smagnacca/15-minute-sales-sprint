const sgMail = require('@sendgrid/mail');
const { getStore } = require('@netlify/blobs');
const { google } = require('googleapis');

const OUTREACH_SHEET_ID = '1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE';
const OUTREACH_TAB = '15-min-sprint';

async function appendToOutreachSheet({ firstName, lastName, email, company, role, city, state }) {
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!raw) { console.warn('GOOGLE_SERVICE_ACCOUNT_JSON not set; skipping outreach sheet append'); return; }
    const credentials = JSON.parse(raw);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const nowEt = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).replace(',', '');

    // Dedup by email (col D)
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: OUTREACH_SHEET_ID,
      range: `${OUTREACH_TAB}!D2:D`,
    });
    const rows = (existing.data.values || []).map(r => (r[0] || '').trim().toLowerCase());
    const emailLc = email.toLowerCase();
    const matchIndex = rows.indexOf(emailLc);

    const rowValues = [nowEt, firstName, lastName, email, company, role, city, state, '15-min-sales-sprint', 'New'];

    if (matchIndex >= 0) {
      const rowNumber = matchIndex + 2;
      // Preserve existing Status
      const statusRes = await sheets.spreadsheets.values.get({
        spreadsheetId: OUTREACH_SHEET_ID,
        range: `${OUTREACH_TAB}!J${rowNumber}`,
      });
      const existingStatus = (statusRes.data.values && statusRes.data.values[0] && statusRes.data.values[0][0]) || 'New';
      rowValues[9] = existingStatus;
      await sheets.spreadsheets.values.update({
        spreadsheetId: OUTREACH_SHEET_ID,
        range: `${OUTREACH_TAB}!A${rowNumber}:J${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowValues] },
      });
      console.log(`Outreach sheet: updated row ${rowNumber} for ${email}`);
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: OUTREACH_SHEET_ID,
        range: `${OUTREACH_TAB}!A:J`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowValues] },
      });
      console.log(`Outreach sheet: appended row for ${email}`);
    }
  } catch (err) {
    console.error('Outreach sheet append failed:', err.message || err);
  }
}

const REGISTRATIONS_KEY = 'recent-registrations';
const MAX_STORED_REGISTRATIONS = 50;

async function appendRegistration({ firstName, city, state }) {
  if (!firstName) return;
  try {
    const store = getStore('sprint-data');
    const existing = (await store.get(REGISTRATIONS_KEY, { type: 'json' })) || [];
    const entry = {
      firstName: firstName.split(' ')[0].slice(0, 24),
      city: (city || '').slice(0, 40),
      state: (state || '').slice(0, 6),
      ts: Date.now()
    };
    const updated = [entry, ...existing].slice(0, MAX_STORED_REGISTRATIONS);
    await store.setJSON(REGISTRATIONS_KEY, updated);
    console.log(`Stored real registration: ${entry.firstName} from ${entry.city}, ${entry.state} (total: ${updated.length})`);
  } catch (err) {
    console.error('Failed to store registration in blobs:', err.message || err);
  }
}

const SITE_URL = 'https://15-minute-sales-sprint.netlify.app';
const CHAPTER_URL = `${SITE_URL}/downloads/storyselling-chapter-1.pdf`;
const FROM = { email: 'scott@scottmagnacca.com', name: 'Scott Magnacca' };
const REPLY_TO = 'scott.magnacca1@gmail.com';
const SUBJECT = 'Welcome to the 15 Minute Sales Sprint — your free chapter is inside';

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function buildHtml({ firstName, company }) {
  const name = escapeHtml(firstName) || 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Welcome to the 15 Minute Sales Sprint</title>
</head>
<body style="margin:0;padding:0;background:#F5F7FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#1A2040;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">You're registered. Download your free chapter of Storyselling in the Age of AI.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F7FA;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(8,13,26,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#080D1A 0%,#0D2045 50%,#1A3A6B 100%);padding:40px 32px;text-align:center;">
          <div style="font-size:17px;font-weight:800;letter-spacing:0.10em;text-transform:uppercase;color:#EEAF00;margin-bottom:10px;white-space:nowrap;">The 15 Minute Sales Sprint</div>
          <div style="font-family:Georgia,serif;font-style:italic;font-size:23px;color:#FFF8E1;line-height:1.3;">One idea. 15 minutes. A better sales career.</div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:36px 36px 8px;">
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:900;color:#1A2040;letter-spacing:-0.02em;line-height:1.2;">You're in, ${name}.</h1>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#4B5563;">Thanks for reserving your spot at our exclusive event. Your seat at the next <strong style="color:#1A2040;">15 Minute Sales Sprint</strong> is locked in.</p>
        </td></tr>

        <!-- Teaser: why this matters -->
        <tr><td style="padding:0 36px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#F8FAFD 0%,#EEF3F9 100%);border-left:4px solid #EEAF00;border-radius:10px;">
            <tr><td style="padding:22px 24px;">
              <p style="margin:0 0 10px;font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:1.5;color:#1A2040;">Imagine reaching <strong style="font-style:normal;color:#1A3A6B;">135 million professionals</strong> — every single day.</p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#4B5563;">What if you knew how to engage the right ones — so <em>they</em> ask to connect with <em>you</em>?</p>
              <p style="margin:0;font-size:16px;line-height:1.55;color:#1A2040;font-weight:700;">That's the power of LinkedIn + one simple AI move. We'll show you live.</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- What happens next -->
        <tr><td style="padding:0 36px 12px;">
          <div style="font-size:15px;font-weight:900;text-transform:uppercase;letter-spacing:0.14em;color:#1A2040;margin-bottom:14px;">What happens next</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0;border-radius:12px;background:#FAFBFD;">
            <tr><td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-size:15px;color:#4B5563;line-height:1.55;"><span style="color:#EEAF00;font-weight:900;margin-right:8px;">→</span><strong style="color:#1A2040;">Day before the event:</strong> Live link + 1-page LinkedIn playbook in your inbox.</td></tr>
            <tr><td style="padding:14px 18px;font-size:15px;color:#4B5563;line-height:1.55;"><span style="color:#EEAF00;font-weight:900;margin-right:8px;">→</span><strong style="color:#1A2040;">Event day:</strong> Show up. 15 minutes. Walk away with one move you can run that afternoon.</td></tr>
          </table>
        </td></tr>

        <!-- Free chapter card -->
        <tr><td style="padding:32px 36px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#FFFDF5 0%,#FFF8E1 100%);border:1.5px solid rgba(238,175,0,0.4);border-radius:16px;">
            <tr><td style="padding:28px 28px 24px;">
              <div style="font-size:15px;font-weight:900;text-transform:uppercase;letter-spacing:0.14em;color:#1A2040;margin-bottom:14px;">📖 Your Thank-You Gift</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:top;padding-right:18px;width:110px;">
                    <img src="${SITE_URL}/img/Storyselling.jpg" alt="Storyselling in the Age of AI book cover" width="100" style="display:block;width:100px;height:auto;border-radius:6px;box-shadow:0 4px 14px rgba(238,175,0,0.25);" />
                  </td>
                  <td style="vertical-align:top;">
                    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1A2040;letter-spacing:-0.01em;line-height:1.25;">Chapter 1 of <em style="font-family:Georgia,serif;color:#1A3A6B;">Storyselling in the Age of AI</em></h2>
                    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4B5563;">A preview chapter from my new book — yours to read before the Sprint. It pairs perfectly with what we'll cover live.</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;"><tr><td style="background:linear-gradient(90deg,#EEAF00 0%,#DDD055 50%,#EEAF00 100%);border-radius:12px;">
                <a href="${CHAPTER_URL}" style="display:inline-block;padding:16px 28px;font-size:15px;font-weight:800;color:#080D1A;text-decoration:none;letter-spacing:0.01em;">📖 Download Chapter 1 →</a>
              </td></tr></table>
              <p style="margin:14px 0 0;font-size:12px;color:#6B7280;">PDF · 17 pages · 700 KB</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Signature -->
        <tr><td style="padding:32px 36px 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:16px;vertical-align:top;">
              <img src="${SITE_URL}/img/scott.jpg" alt="Scott Magnacca" width="56" height="56" style="display:block;width:56px;height:56px;border-radius:50%;border:2px solid #EEAF00;object-fit:cover;object-position:center top;" />
            </td>
            <td style="vertical-align:top;">
              <div style="font-size:15px;color:#1A2040;line-height:1.55;">See you live,<br/><strong style="color:#1A3A6B;">Scott Magnacca</strong></div>
              <div style="font-size:12px;color:#6B7280;margin-top:2px;">Harvard ALM · Babson MBA · 4,127+ pros trained</div>
            </td>
          </tr></table>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">Got a question? Just hit reply — this email comes straight to my inbox.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#080D1A;padding:24px 36px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.55);">You're receiving this because you registered for the 15 Minute Sales Sprint.</p>
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);"><a href="${SITE_URL}" style="color:#EEAF00;text-decoration:none;">15-minute-sales-sprint.netlify.app</a> · Reply directly to reach Scott</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText({ firstName, company }) {
  const name = firstName || 'there';
  return `You're in, ${name}.

Thanks for reserving your spot at our exclusive event. Your seat at the next 15 Minute Sales Sprint is locked in.

Imagine reaching 135 million professionals — every single day. What if you knew how to engage the right ones — so they ask to connect with you? That's the power of LinkedIn + one simple AI move. We'll show you live.

WHAT HAPPENS NEXT
- Day before the event: live link + 1-page LinkedIn playbook in your inbox.
- Event day: show up, 15 minutes, walk away with one move you can run that afternoon.

YOUR THANK-YOU GIFT
A preview chapter from my new book "Storyselling in the Age of AI" — yours to read before the Sprint:

${CHAPTER_URL}

(PDF · 17 pages · 700 KB)

See you live,
Scott Magnacca
Harvard ALM · Babson MBA · 4,127+ pros trained

Got a question? Just hit reply — this email comes straight to me.

—
You're receiving this because you registered at ${SITE_URL}.`;
}

exports.handler = async (event) => {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('SENDGRID_API_KEY missing');
      return { statusCode: 200, body: 'no-api-key' };
    }

    const payload = JSON.parse(event.body || '{}');
    const submission = payload.payload || payload;
    const formName = submission.form_name || (submission.data && submission.data['form-name']);
    const data = submission.data || submission;

    if (formName && formName !== 'sprint-registration') {
      console.log('Skipping non-sprint form:', formName);
      return { statusCode: 200, body: 'skipped' };
    }

    const email = (data.email || '').trim();
    const firstName = (data.firstName || '').trim();
    const lastName = (data.lastName || '').trim();
    const company = (data.company || '').trim();
    const role = (data.role || '').trim();
    const city = (data.city || '').trim();
    const state = (data.state || '').trim();

    // Store registration for social proof toasts (firstName + city only — no PII)
    await appendRegistration({ firstName, city, state });

    // Pipe lead into Outreach Machine sheet. Never block registration on failure.
    if (email) {
      await appendToOutreachSheet({ firstName, lastName, email, company, role, city, state });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn('Invalid or missing email; skipping send. data:', JSON.stringify(data));
      return { statusCode: 200, body: 'invalid-email' };
    }

    sgMail.setApiKey(apiKey);
    const msg = {
      to: email,
      from: FROM,
      replyTo: REPLY_TO,
      subject: SUBJECT,
      text: buildText({ firstName, company }),
      html: buildHtml({ firstName, company }),
      trackingSettings: {
        clickTracking: { enable: true, enableText: false },
        openTracking: { enable: true }
      },
      mailSettings: { sandboxMode: { enable: false } }
    };

    const [resp] = await sgMail.send(msg);
    console.log(`Sent confirmation to ${email} (${firstName} ${lastName}) — SendGrid ${resp.statusCode}`);
    return { statusCode: 200, body: 'sent' };
  } catch (err) {
    console.error('submission-created error:', err && err.response && err.response.body ? JSON.stringify(err.response.body) : err.message || err);
    // Always 200 so Netlify doesn't retry forever
    return { statusCode: 200, body: 'error-logged' };
  }
};
