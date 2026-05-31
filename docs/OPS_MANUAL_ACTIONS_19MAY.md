# OS Kitchen — Manual OPS Actions (19 May 2026)

Выполнить **до приглашения платных операторов**. Каждый пункт ~5–10 минут.

---

## 1. Supabase Site URL

1. Open [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration)
2. **Site URL:** `https://os-kitchen.com`
3. **Redirect URLs** (add all):

```
https://os-kitchen.com/**
https://os-kitchen.com/auth/callback
https://os-kitchen.com/login
https://os-kitchen.com/signup
https://os-kitchen.com/dashboard/**
http://localhost:3000/**
```

4. Save

**Verify:** Sign up → confirmation email link opens `os-kitchen.com`, not `localhost:3000`.

---

## 2. Upstash Redis (distributed rate limits)

1. [Upstash Console](https://console.upstash.com) → your Redis database → **REST API**
2. Copy **UPSTASH_REDIS_REST_TOKEN** (URL already in Vercel)
3. Vercel → Project `kitchen-os` → Settings → Environment Variables → Production:

```bash
vercel env add UPSTASH_REDIS_REST_TOKEN production
# paste token

vercel env add RATE_LIMIT_ADAPTER production
# value: upstash
```

4. Redeploy production (prebuilt or git push)

**Verify:** `curl -s https://os-kitchen.com/api/health | jq .checks.rateLimitAdapter` → `adapter: "upstash"` (not `memory`).

---

## 3. Resend (transactional email)

1. [Resend API Keys](https://resend.com/api-keys) → Create API key
2. Vercel Production:

```bash
vercel env add RESEND_API_KEY production
```

3. Ensure `RESEND_FROM_EMAIL` is a verified domain sender

**Verify:** Trigger password reset or team invite → email received.

---

## 4. Stripe Webhook Secret

1. [Stripe Webhooks](https://dashboard.stripe.com/webhooks) (Live mode)
2. Endpoint: `https://os-kitchen.com/api/webhooks/stripe` (or your configured path)
3. Compare signing secret `whsec_...` with Vercel `STRIPE_WEBHOOK_SECRET`

```bash
vercel env ls production | grep STRIPE_WEBHOOK
```

4. If mismatch → update Vercel and redeploy

**Verify:** Stripe Dashboard → Send test webhook → 200 response.

---

## 5. Google Search Console

1. [Google Search Console](https://search.google.com/search-console)
2. Add property: **URL prefix** `https://os-kitchen.com`
3. Verify (DNS TXT or HTML tag — see `docs/GSC_SETUP.md`)
4. **Sitemaps** → Submit: `https://os-kitchen.com/sitemap.xml`
5. URL Inspection → Request indexing for `/`, `/pricing`, `/demo`

---

## 6. E2E with authentication

```bash
cd /Users/dmytro/Desktop/2026/OS Kitchen
export PLAYWRIGHT_BASE_URL="https://os-kitchen.com"
export E2E_PILOT_EMAIL="your-pilot-test@example.com"
export E2E_PILOT_PASSWORD="YourSecureTestPassword123!"
npm run test:e2e:pilot
```

Requires a confirmed Supabase user with dashboard access.

---

## 7. Manual golden path (browser)

| Step | URL / action | Expected |
|------|----------------|----------|
| 1 | `/signup` | Account created or email sent |
| 2 | Email link | Lands on app, session active |
| 3 | `/onboarding` | Can complete wizard |
| 4 | `/dashboard/today` | Dashboard loads |
| 5 | `/dashboard/orders/new` | Create order |
| 6 | `/dashboard/production` | Mark production step |
| 7 | `/dashboard/packing` | Packing flow |
| 8 | `/dashboard/billing/plans` | Checkout buttons enabled (Stripe live) |
| 9 | Mobile | Sidebar scrolls, menu usable |

---

## 8. Optional: Lighthouse baseline

Reports from session 15 (homepage):

| Category | Score |
|----------|-------|
| Performance | 81 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 92 |

Re-run: `npx lighthouse https://os-kitchen.com --view`
