#!/bin/bash
# Daily pilot monitoring — one command for ops.
# Usage: bash scripts/ops/pilot-dashboard.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

BASE_URL="${PILOT_BASE_URL:-https://os-kitchen.com}"
VERCEL_PROJECT="${VERCEL_PROJECT:-kitchen-os}"

echo "=== KitchenOS Pilot Dashboard — $(date) ==="
echo ""

echo "▶ System Health ($BASE_URL)"
HEALTH=$(curl -sS --max-time 15 "${BASE_URL}/api/health" 2>/dev/null || echo "{}")
if [ "$HEALTH" = "{}" ]; then
  echo "  ❌ Could not reach /api/health"
else
  python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  Status: {d.get(\"status\", \"unknown\")}')
print(f'  Version: {d.get(\"version\", \"?\")}')
for k, v in d.get('checks', {}).items():
    ok = v.get('ok') if isinstance(v, dict) else v
    mark = '✅' if ok else '❌'
    extra = ''
    if isinstance(v, dict) and 'latencyMs' in v:
        extra = f' ({v[\"latencyMs\"]}ms)'
    if isinstance(v, dict) and 'adapter' in v:
        extra = f' adapter={v[\"adapter\"]}'
    print(f'  {k}: {mark}{extra}')
" <<<"$HEALTH"
fi

echo ""
echo "▶ Public Status Page"
STATUS_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "${BASE_URL}/status" 2>/dev/null || echo "000")
if [ "$STATUS_HTTP" = "200" ]; then
  echo "  ✅ /status HTTP 200"
else
  echo "  ❌ /status HTTP $STATUS_HTTP"
fi

echo ""
echo "▶ Current Deployment (Vercel CLI)"
if command -v vercel >/dev/null 2>&1; then
  vercel list "$VERCEL_PROJECT" 2>&1 | grep -E "● Ready|Ready" | head -1 || echo "  (no Ready deployment found — run: vercel login)"
else
  echo "  vercel CLI not installed — https://vercel.com/aervio/kitchen-os"
fi

echo ""
echo "▶ Cron Jobs (Vercel CLI)"
if command -v vercel >/dev/null 2>&1; then
  vercel crons ls "$VERCEL_PROJECT" 2>&1 | head -15 || echo "  (cron list unavailable — vercel crons ls)"
else
  echo "  vercel CLI not installed"
fi

echo ""
echo "▶ Stripe Summary (requires STRIPE_SECRET_KEY)"
if [ -n "${STRIPE_SECRET_KEY:-}" ]; then
  STRIPE_JSON=$(curl -sS --max-time 15 "https://api.stripe.com/v1/subscriptions?limit=5&status=all" \
    -u "${STRIPE_SECRET_KEY}:" 2>/dev/null || echo "{}")
  python3 -c "
import sys, json
d = json.load(sys.stdin)
if d.get('error'):
    print('  Error:', d['error'].get('message', d['error']))
else:
    print(f'  Sample subscriptions (up to 5):')
    for s in d.get('data', []):
        plan = (s.get('items', {}).get('data') or [{}])[0].get('price', {}).get('nickname') or '?'
        print(f'    {s[\"id\"][:14]}… — {s[\"status\"]} — {plan}')
" <<<"$STRIPE_JSON" 2>/dev/null || echo "  Stripe API parse failed"
else
  echo "  STRIPE_SECRET_KEY not set (export from .env.local for live counts)"
fi

echo ""
echo "▶ Recent Signups (24h, requires SUPABASE_SERVICE_ROLE_KEY)"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-${SUPABASE_URL:-}}"
if [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] && [ -n "${SUPABASE_URL:-}" ]; then
  USERS_JSON=$(curl -sS --max-time 15 \
    "${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null || echo "{}")
  python3 -c "
import sys, json
from datetime import datetime, timedelta, timezone
d = json.load(sys.stdin)
users = d.get('users') or d.get('data') or []
cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
recent = []
for u in users:
    created = u.get('created_at')
    if not created:
        continue
    ts = datetime.fromisoformat(created.replace('Z', '+00:00'))
    if ts >= cutoff:
        recent.append(u)
print(f'  Signups in last 24h: {len(recent)}')
for u in recent[:5]:
    email = u.get('email') or '(no email)'
    print(f'    {email} — {u.get(\"created_at\", \"\")[:19]}')
if len(recent) > 5:
    print(f'    … and {len(recent) - 5} more')
" <<<"$USERS_JSON" 2>/dev/null || echo "  Supabase admin API parse failed"
else
  echo "  Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY"
fi

echo ""
echo "▶ Ops Scripts"
echo "  Pilot ready:    bash scripts/ops/pilot-ready-check.sh"
echo "  Quick accept:   bash scripts/ops/quick-acceptance.sh"
echo "  Weekly report:  bash scripts/ops/weekly-pilot-report.sh"

echo ""
echo "▶ Quick Links"
echo "  Production: ${BASE_URL}"
echo "  Health:     ${BASE_URL}/api/health"
echo "  Status:     ${BASE_URL}/status"
echo "  Vercel:     https://vercel.com/aervio/kitchen-os"
echo "  Supabase:   https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz"
echo "  Stripe:     https://dashboard.stripe.com"

echo ""
echo "=== End of Dashboard ==="
