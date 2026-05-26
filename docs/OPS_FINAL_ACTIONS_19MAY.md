# KitchenOS — Final OPS Actions (19 May 2026)

Выполнить эти действия **перед приглашением платных операторов**. Каждое ~2–5 минут.

**Production:** https://os-kitchen.com  
**Vercel project:** `kitchen-os` (team `aervio`)

---

## Статус env (авто-проверка 19 May 2026)

| Variable | Vercel Production | `.env.staging.local` |
|----------|-------------------|----------------------|
| `NEXT_PUBLIC_APP_URL` | ✅ | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | — |
| `STRIPE_WEBHOOK_SECRET` | ✅ | ✅ (verify value) |
| `UPSTASH_REDIS_REST_URL` | ✅ | — |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ **missing** | ❌ empty |
| `RESEND_API_KEY` | ❌ **missing** | ❌ empty |
| `RATE_LIMIT_ADAPTER` | ✅ (verify = `upstash`) | — |

---

## 1. Supabase Site URL

🔗 https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration

- **Site URL:** `https://os-kitchen.com`
- **Redirect URLs:**

```
https://os-kitchen.com/**
https://os-kitchen.com/auth/callback
https://os-kitchen.com/login
https://os-kitchen.com/signup
https://os-kitchen.com/dashboard/**
http://localhost:3000/**
```

- Нажми **Save**

**Verify:** Email confirmation links open `os-kitchen.com`, not `localhost:3000`.

---

## 2. Upstash Token

🔗 https://console.upstash.com → Redis → **REST API** → copy **UPSTASH_REDIS_REST_TOKEN**

```bash
cd /Users/dmytro/Desktop/2026/KitchenOS
printf '%s' 'YOUR_TOKEN_HERE' | vercel env add UPSTASH_REDIS_REST_TOKEN production
printf '%s' 'upstash' | vercel env add RATE_LIMIT_ADAPTER production
vercel deploy --prebuilt --prod --yes   # or redeploy from Dashboard
```

**Verify:**

```bash
curl -s https://os-kitchen.com/api/health | jq .checks.rateLimitAdapter
# expect: "adapter": "upstash"
```

---

## 3. Resend API Key

🔗 https://resend.com/api-keys → Create API key

```bash
printf '%s' 're_xxxxxxxx' | vercel env add RESEND_API_KEY production
```

Ensure `RESEND_FROM_EMAIL` uses a **verified domain**.

**Verify:** Password reset or invite email arrives.

---

## 4. Stripe Webhook Secret

🔗 https://dashboard.stripe.com/webhooks (Live mode)

1. Find endpoint for `https://os-kitchen.com/api/webhooks/stripe` (or your webhook path)
2. Reveal signing secret `whsec_...`
3. Compare with Vercel:

```bash
vercel env pull .env.vercel.production.local --environment=production
grep STRIPE_WEBHOOK .env.vercel.production.local
```

4. If mismatch → `printf '%s' 'whsec_...' | vercel env add STRIPE_WEBHOOK_SECRET production --force`

**Verify:** Stripe → Send test webhook → **200** response.

---

## 5. Google Search Console

🔗 https://search.google.com/search-console

1. Add property: `https://os-kitchen.com`
2. Verify (DNS TXT or HTML tag — see `docs/GSC_SETUP.md`)
3. **Sitemaps** → Submit: `https://os-kitchen.com/sitemap.xml`

---

## 6. E2E с аутентификацией

Requires confirmed Supabase user (after step 1):

```bash
cd /Users/dmytro/Desktop/2026/KitchenOS
export PLAYWRIGHT_BASE_URL="https://os-kitchen.com"
export E2E_PILOT_EMAIL="test-operator@kitchenos-test.com"
export E2E_PILOT_PASSWORD="TestPassword123!"
npm run test:e2e:pilot
```

---

## 7. Ручной golden path

| # | Step | Expected |
|---|------|----------|
| 1 | https://os-kitchen.com/signup | Account created / check email |
| 2 | Confirm email | Session active |
| 3 | Onboarding | Completes |
| 4 | /dashboard/today | Dashboard loads |
| 5 | /dashboard/orders/new | Create order |
| 6 | /dashboard/production | Mark ready |
| 7 | /dashboard/packing | Confirm pack |
| 8 | /dashboard/billing/plans | Checkout buttons active |

---

## Quick production smoke (no auth)

```bash
curl -s https://os-kitchen.com/api/health | jq .status
export PLAYWRIGHT_BASE_URL=https://os-kitchen.com
node ./node_modules/@playwright/test/cli.js test tests/e2e/pilot-golden-path-http.spec.ts --project=ci-critical-paths
```
