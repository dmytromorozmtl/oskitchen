# Turnstile — Vercel setup (Week 1)

**Scope:** Checkout, contact, catering, guest account, cart recovery.  
**Code:** `lib/storefront/turnstile.ts`, `components/storefront/turnstile-widget.tsx`

---

## 1. Create widget (Cloudflare)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Turnstile** → **Add site**.
2. Widget mode: **Managed** (recommended) or **Non-interactive** for low friction.
3. Hostnames: add production domain, `*.vercel.app`, and `localhost` for local dev.
4. Copy **Site key** and **Secret key**.

---

## 2. Vercel environment variables

| Variable | Environments | Value |
|----------|--------------|-------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Production** + **Preview** | Site key from Cloudflare |
| `TURNSTILE_SECRET_KEY` | **Production** + **Preview** | Secret key (server only) |

**Important:** `NEXT_PUBLIC_*` must exist in Preview if you test staging.

---

## 3. Redeploy

Vercel → Deployments → **Redeploy** (Production and staging preview).

Env changes do not apply until redeploy completes.

---

## 4. Verification

| Check | URL / action | Expected |
|-------|--------------|----------|
| Widget visible | `/s/hello/checkout` | Turnstile iframe or checkbox |
| Contact submit | `/s/hello/contact` | 200 / success message |
| No secret in client | View page source | Only site key, never secret |
| Rate limit still on | Rapid submits | 429 after policy limit |

```bash
npm run storefront:week1-verify
```

---

## Test mode (staging only)

Cloudflare provides keys that always pass verification:

| Key | Value |
|-----|-------|
| Site (visible pass) | `1x00000000000000000000AA` |
| Secret | `1x0000000000000000000000000000000AA` |

Use in **Preview** only — not for production.

---

## Rollback

Remove both keys from Vercel → redeploy.  
`verifyTurnstileToken()` becomes no-op; IP rate limits remain (`storefront-rate-limit.ts`).

---

## Not in scope (Week 1)

- Dynamic builder forms (`StorefrontFormRenderer`) — honeypot + per-form DB cap only; file upload is Week 4.
