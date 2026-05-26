# Manual UI smoke checklist (~20 min)

**Your staging owner:** `workspace.moroz@gmail.com` · storefront slug **`hello`**

Mark each step ✅ before production deploy.

---

## A. Team invite + magic link (incognito)

| # | Step | Expected |
|---|------|----------|
| A1 | Login as owner → `/dashboard/storefront/team` | Team page loads |
| A2 | Invite `test+smoke@yourdomain.com` (STAFF) | Success message + **Copy magic link** appears |
| A3 | Copy link → open in **incognito** | `/invite/{token}` — “Join team” or login prompt |
| A4 | Sign up / login with **same email** as invite | Redirect to `/dashboard/storefront/team?invited=1` |
| A5 | Owner view: pending invite gone, member listed | Member row with STAFF |
| A6 | Cancel another pending invite (optional) | Removed from list |

CLI equivalent (already green on your DB):

```bash
npm run smoke:team-invites -- --owner-email=workspace.moroz@gmail.com
```

---

## B. Dashboard core

| # | Step | Expected |
|---|------|----------|
| B1 | `/dashboard` | Loads without 500 |
| B2 | `/dashboard/orders` | Order list (may be empty) |
| B3 | Create or open one order | Detail page loads |
| B4 | Sidebar “Show all modules” toggle | Nav expands / focuses |

---

## C. Public storefront

| # | Step | Expected |
|---|------|----------|
| C1 | `/s/hello` | Storefront renders (your slug) |
| C2 | Add item to cart / checkout path | No crash (payment may be test mode) |
| C3 | Owner preview `?preview=1` when unpublished | Works when logged in |

---

## D. Public API

| # | Step | Expected |
|---|------|----------|
| D1 | Dashboard → Developer → create API key `kos_...` | Secret shown once — save it |
| D2 | `curl -H "Authorization: Bearer kos_..." https://YOUR_HOST/api/public/v1/orders` | `200` + `{ data: [...] }` |
| D3 | Wrong key | `401` |

```bash
export SMOKE_PUBLIC_API_KEY="kos_your_key"
export SMOKE_PUBLIC_API_BASE="https://your-staging-host"
npm run smoke:public-api
```

---

## E. Platform security (quick)

| # | Step | Expected |
|---|------|----------|
| E1 | Logged out → `/platform` | Redirect to `/login` |
| E2 | Regular tenant → `/platform` | No platform dashboard (403 or redirect) |

---

## F. Integrations honesty

| # | Step | Expected |
|---|------|----------|
| F1 | `/dashboard/integrations/health` | BETA / roadmap labels — no fake “verified” for Woo/DoorDash |
| F2 | Woo/Shopify pages | **BETA** badge visible |

---

## Sign-off

- [ ] A–F completed on **staging**
- [ ] `npm run smoke:team-invites -- --owner-email=...` exit 0
- [ ] PR CI green (`ci.yml` + `ci-smoke.yml`)

Then: [PRODUCTION_DEPLOY_CHECKLIST.md](./PRODUCTION_DEPLOY_CHECKLIST.md)
