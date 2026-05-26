# Storefront — Week 1 hardening (post-launch)

Execute **after** first production release is stable (24–72h monitoring).

---

## 1. Turnstile in production

| Step | Action |
|------|--------|
| 1 | Cloudflare Turnstile → create site → copy site key + secret |
| 2 | Vercel prod: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| 3 | Redeploy |
| 4 | Smoke: checkout + contact show widget; submit without solving → error |

Without keys: rate limits still apply (`storefront_contact_submit`, `storefront_checkout_submit`).

---

## 2. Redirects at edge

| Step | Action |
|------|--------|
| 1 | Vercel prod: `STOREFRONT_REDIRECTS_ENABLED=true` |
| 2 | Admin → **Redirects** → add 2–3 rules (301 for permanent marketing URLs) |
| 3 | Smoke |

```bash
export STOREFRONT_SMOKE_BASE_URL=https://<prod-or-staging>
export STOREFRONT_REDIRECT_FROM=/legacy-menu
export STOREFRONT_REDIRECT_TO=/menu
npm run smoke:storefront-redirects
```

**Example rules:**

| From | To | Status |
|------|-----|--------|
| `/old-catering` | `/catering` | 301 |
| `/order-now` | `/menu` | 302 |

---

## 3. Lighthouse on staging

Repo variable: `PLAYWRIGHT_BASE_URL` (staging).

```bash
# Manual
LHCI_BASE_URL=https://staging.example.com E2E_STORE_SLUG=demo npm run lighthouse:storefront
```

CI: `lighthouse-storefront.yml` runs after Playwright on `main` (workflow_run). Thresholds in `lighthouserc.cjs` (performance ≥0.85, LCP ≤2500ms).

**If failing:** optimize hero images, reduce JS on `/menu` and `/checkout` — see `docs/STOREFRONT_PERFORMANCE_POLICY.md`.

---

## 4. Required checks (confirm)

- [ ] `Storefront staging gate` green on last `main` push
- [ ] `Playwright storefront` green (when URL configured)
- [ ] Optional: `Lighthouse storefront` green

---

## Acceptance

Week 1 complete when: Turnstile live (or documented waiver), ≥2 redirects smoke-tested, Lighthouse run once on staging with scores recorded in QA artifact appendix.
