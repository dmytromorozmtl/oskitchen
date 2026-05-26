# KitchenOS — Pilot Launch Checklist (19 May 2026)

## Status: CODE READY — PENDING 6 MANUAL ACTIONS

### Production

- **URL:** https://os-kitchen.com
- **Deploy:** `dpl_CSE1mTbAzjDzuyLvtJcwSryYjzKg`
- **Health:** `status: ok` (DB + Supabase)

### Automated checks

```bash
bash scripts/ops/pilot-ready-check.sh
bash scripts/ops/check-supabase-site-url.sh
```

---

## Before inviting operators (~30 min)

### 1. Supabase Site URL (2 min) — **BLOCKER**

🔗 https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration

- **Site URL:** `https://os-kitchen.com`
- **Redirect URLs:** `https://os-kitchen.com/**`, `http://localhost:3000/**`
- Save

Without this, email confirmation links may point to `localhost:3000`.

### 2. Upstash Token (5 min)

🔗 https://console.upstash.com → Redis → REST Token

```bash
export UPSTASH_REDIS_REST_TOKEN="your-token-here"
bash scripts/ops/upload-missing-tokens.sh
vercel deploy --prebuilt --prod --yes
```

### 3. Resend API Key (5 min)

🔗 https://resend.com/api-keys

```bash
export RESEND_API_KEY="re_xxxxxxxx"
bash scripts/ops/upload-missing-tokens.sh
```

### 4. Stripe Webhook (2 min)

🔗 https://dashboard.stripe.com/webhooks (Live)

- Endpoint: `https://os-kitchen.com/api/webhooks/stripe` (confirm path in Dashboard)
- Compare `whsec_...` with Vercel `STRIPE_WEBHOOK_SECRET`

```bash
export STRIPE_WEBHOOK_SECRET="whsec_..."
bash scripts/ops/upload-missing-tokens.sh
```

### 5. Google Search Console (5 min)

🔗 https://search.google.com/search-console

- Add property: `https://os-kitchen.com`
- Submit sitemap: `https://os-kitchen.com/sitemap.xml`

### 6. E2E Auth Test (5 min)

Requires step 1 (Supabase Site URL) + test user:

```bash
export PLAYWRIGHT_BASE_URL="https://os-kitchen.com"
export E2E_PILOT_EMAIL="test-operator@kitchenos-test.com"
export E2E_PILOT_PASSWORD="TestPassword123!"
npm run test:e2e:pilot
```

### 7. Manual golden path (browser)

1. https://os-kitchen.com/signup
2. Confirm email
3. Complete onboarding
4. /dashboard/today
5. /dashboard/orders/new → create order
6. /dashboard/production → mark ready
7. /dashboard/packing
8. /dashboard/billing/plans → checkout buttons

---

## Inviting first operators

- **Signup URL:** https://os-kitchen.com/signup
- **Login with redirect:** https://os-kitchen.com/login?next=/dashboard/today
- **Status page:** https://os-kitchen.com/status
- **Runbook:** `docs/PILOT_STAGING_RUNBOOK.md` (if present)

---

## First week monitoring

```bash
# Daily
bash scripts/ops/pilot-ready-check.sh

# Health
curl -s https://os-kitchen.com/api/health | python3 -m json.tool
```

---

## Quick commands

```bash
# Upload tokens when you have them
export UPSTASH_REDIS_REST_TOKEN="..."
export RESEND_API_KEY="re_..."
bash scripts/ops/upload-missing-tokens.sh

# HTTP smoke (no auth)
export PLAYWRIGHT_BASE_URL="https://os-kitchen.com"
npm run test:e2e:pilot:http

# Full auth E2E
npm run test:e2e:pilot
```

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [OPS_FINAL_ACTIONS_19MAY.md](OPS_FINAL_ACTIONS_19MAY.md) | Detailed OPS steps |
| [FINAL_STATE_19MAY2026.md](FINAL_STATE_19MAY2026.md) | Full technical state |
| [PILOT_100_PERCENT_READY.md](PILOT_100_PERCENT_READY.md) | Pilot readiness summary |
