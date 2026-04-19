#!/bin/bash
# Render the SendGrid confirmation email to src/email-preview.html and open it
# in the browser. Use after any edit to netlify/functions/submission-created.js.
cd "$(dirname "$0")/.."
node -e "
const fs = require('fs');
const src = fs.readFileSync('netlify/functions/submission-created.js', 'utf8');
const match = src.match(/const SITE_URL[\s\S]*?function buildHtml[\s\S]*?^}/m);
fs.writeFileSync('/tmp/email-render.js', match[0] + '\nmodule.exports = { buildHtml };');
const { buildHtml } = require('/tmp/email-render.js');
const html = buildHtml({ firstName: 'Scott', company: 'Babson' });
fs.writeFileSync('src/email-preview.html', html);
console.log('Wrote src/email-preview.html (' + html.length + ' bytes)');
"
# Start server if not running, then open in browser
lsof -i :3001 >/dev/null 2>&1 || (python3 -m http.server 3001 --directory src > /tmp/email-preview-server.log 2>&1 &) && sleep 1
open "http://localhost:3001/email-preview.html"
