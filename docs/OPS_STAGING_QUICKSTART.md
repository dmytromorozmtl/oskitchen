# KitchenOS Staging — Quickstart

Run **one command per line**. Do not paste `#` comment lines into the terminal.

**Start here (ops):** [PILOT_HANDOFF_FINAL.md](./PILOT_HANDOFF_FINAL.md)

---

## One-time setup

```bash
cd /path/to/KitchenOS
cp .env.staging.template .env.staging.local
```

Fill **real secrets** in `.env.staging.local` (not the empty template).

```bash
npm run verify:staging-env -- --local-pilot
```

Full gate before Vercel: `npm run verify:staging-env`

---

## Deploy

```bash
bash scripts/ops/deploy-staging.sh
```

If Vercel preview expired (`DEPLOYMENT_NOT_FOUND`): [OPS_VERCEL_REDEPLOY.md](./OPS_VERCEL_REDEPLOY.md)

```bash
echo "STAGING_URL=https://YOUR-NEW-PREVIEW.vercel.app" > .staging-deploy-url
export STAGING_URL=https://YOUR-NEW-PREVIEW.vercel.app
```

---

## Verify + Go/No-Go

```bash
bash scripts/ops/verify-staging.sh
bash scripts/ops/pilot-go.sh
```

`pilot-go.sh` runs HTTP verification + E2E HTTP smoke.

---

## E2E (authenticated)

```bash
export PLAYWRIGHT_BASE_URL=https://YOUR-NEW-PREVIEW.vercel.app
export E2E_PILOT_EMAIL=your-test-user@example.com
export E2E_PILOT_PASSWORD=your-password
npm run test:e2e:pilot
```

---

## Full instructions

- [PILOT_STAGING_RUNBOOK.md](./PILOT_STAGING_RUNBOOK.md)
- [PILOT_FINAL_CHECKLIST.md](./PILOT_FINAL_CHECKLIST.md)

---

## Common errors

| Error | Fix |
|-------|-----|
| `DEPLOYMENT_NOT_FOUND` | [OPS_VERCEL_REDEPLOY.md](./OPS_VERCEL_REDEPLOY.md) |
| `Missing DATABASE_URL` | Fill `.env.staging.local` |
| `Invalid URL` in Playwright | `export PLAYWRIGHT_BASE_URL=https://...` |
| `syntax error` on env source | Use `.env.staging.local`; quote `RESEND_FROM_EMAIL="KitchenOS <noreply@…>"` |
