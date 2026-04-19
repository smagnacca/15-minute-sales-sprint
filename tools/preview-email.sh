#!/bin/bash
# Render and preview any of the 15 Minute Sales Sprint email templates.
#
# Usage:
#   bash tools/preview-email.sh           → renders the LIVE confirmation email (#1)
#                                           from netlify/functions/submission-created.js
#   bash tools/preview-email.sh 1|2|3     → previews template by number from email-templates/
#   bash tools/preview-email.sh all       → previews all 3 templates side-by-side

set -e
cd "$(dirname "$0")/.."

ARG="${1:-live}"

render_live() {
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
}

render_template() {
  local n="$1"
  local src="email-templates/15-min-sales-sprint-${n}.html"
  local dst="src/email-preview-${n}.html"
  if [ ! -f "$src" ]; then
    echo "ERROR: $src not found"; exit 1
  fi
  # Replace {{firstName}} and {{zoomLink}} with sample values for preview
  sed -e 's/{{firstName}}/Scott/g' \
      -e 's|{{zoomLink}}|https://zoom.us/j/sample-link|g' \
      "$src" > "$dst"
  echo "Wrote $dst"
}

start_server() {
  lsof -i :3001 >/dev/null 2>&1 || (python3 -m http.server 3001 --directory src > /tmp/email-preview-server.log 2>&1 &) && sleep 1
}

case "$ARG" in
  live|"")
    render_live
    start_server
    open "http://localhost:3001/email-preview.html"
    ;;
  1)
    render_template 1
    start_server
    open "http://localhost:3001/email-preview-1.html"
    ;;
  2)
    render_template 2
    start_server
    open "http://localhost:3001/email-preview-2.html"
    ;;
  3)
    render_template 3
    start_server
    open "http://localhost:3001/email-preview-3.html"
    ;;
  all)
    render_template 1
    render_template 2
    render_template 3
    start_server
    open "http://localhost:3001/email-preview-1.html"
    open "http://localhost:3001/email-preview-2.html"
    open "http://localhost:3001/email-preview-3.html"
    ;;
  *)
    echo "Usage: $0 [live|1|2|3|all]"
    exit 1
    ;;
esac
