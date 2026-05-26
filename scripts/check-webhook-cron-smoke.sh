#!/usr/bin/env bash
# Synthetic health check for webhook job cron (dry run — no DB drain).
# Usage:
#   export APP_URL="https://your-host.example"   # no trailing slash
#   export CRON_SECRET="your-cron-secret"
#   ./scripts/check-webhook-cron-smoke.sh
#
# Exit 0 only when HTTP 200 and JSON contains "ok": true.
set -euo pipefail

: "${APP_URL:?Set APP_URL (e.g. https://staging.example)}"
: "${CRON_SECRET:?Set CRON_SECRET}"

url="${APP_URL%/}/api/cron/webhook-jobs?dryRun=1"
tmp="$(mktemp)"
code="$(curl -sS -o "$tmp" -w "%{http_code}" -H "Authorization: Bearer ${CRON_SECRET}" "$url")"

if [[ "$code" != "200" ]]; then
  echo "check-webhook-cron-smoke: expected HTTP 200, got ${code}" >&2
  cat "$tmp" >&2 || true
  rm -f "$tmp"
  exit 1
fi

if command -v jq >/dev/null 2>&1; then
  if ! jq -e '.ok == true' "$tmp" >/dev/null 2>&1; then
    echo "check-webhook-cron-smoke: response JSON missing ok:true" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    exit 1
  fi
else
  if ! grep -q '"ok"[[:space:]]*:[[:space:]]*true' "$tmp"; then
    echo "check-webhook-cron-smoke: install jq or verify JSON manually" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    exit 1
  fi
fi

echo "check-webhook-cron-smoke: OK"
cat "$tmp"
rm -f "$tmp"
