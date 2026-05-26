# Post-deploy checklist — storefront production

Run within **15 minutes** of Vercel Production deploy.

---

## 1. HTTP smoke (required)

```bash
# Replace with your Vercel Production domain (quotes required in zsh)
export STOREFRONT_SMOKE_BASE_URL="https://xn---production-xijza32a.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_SMOKE_ENV=production
npm run storefront:post-deploy
```

Troubleshooting: [`SMOKE_URL_TROUBLESHOOTING.md`](SMOKE_URL_TROUBLESHOOTING.md)

**Output:** `docs/artifacts/storefront-smoke-production-latest.md` — all checks ✓.

---

## 2. Spot checks (5 min)

| Check | URL / action |
|-------|----------------|
| Home | `/s/hello` — 200 |
| Checkout | Add item → checkout loads |
| Cron | Vercel → Crons → last run not 401 |
| Order Hub | Place test pay-later order → appears |

---

## 3. Sign-offs

- [ ] Update `storefront-qa-release-*.md` — Production ☑, Ship decision
- [ ] Product signed `STOREFRONT_STRIPE_SIGNOFF_RECORD.md`

---

## 4. Monitor (24h)

- Vercel function errors
- Order Hub volume
- Resend bounce (if email enabled)

---

## Rollback

Vercel → Deployments → previous deployment → **Promote to Production** → re-run post-deploy smoke on previous URL if needed.
