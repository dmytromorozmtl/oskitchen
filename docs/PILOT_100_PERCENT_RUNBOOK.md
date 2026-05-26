# Paid pilot — 100% completion runbook

**Audience:** Ops, Tech Lead, Product  
**Goal:** Close every blocker before first paid pilot customer.

---

## Next step (one command)

```bash
npm run pilot:100-next           # ONE command: Upstash scan + deploy probe + next queue step
npm run staging:ops:status       # what is missing (no secrets printed)
npm run pilot:next-step:doc      # regenerate detailed NEXT_STEP guide (RU)
npm run pilot:next-step          # runs exactly one action, then stop
npm run pilot:next-step -- --list   # show full queue with ✓/○
```

Blockers:
- **Upstash:** `npm run pilot:upstash:gate` (or `--wizard` / paste `.env.upstash.paste.local`)
- **Deploy 404:** `npm run pilot:deploy:gate -- --url=https://….vercel.app`

Live guide (auto-updated): [`docs/generated/NEXT_STEP_INSTRUCTIONS.md`](./generated/NEXT_STEP_INSTRUCTIONS.md)

If you pasted examples from docs into `.env.staging.local` (e.g. `ВАШ-ID`, `AX…`):

```bash
npm run staging:env:clean-placeholders
```

Repeat until the queue shows all ✓, then manual golden path + sign-off.

---

## Quick path (automated)

```bash
npm ci
npm run staging:env:sync-local      # DB + Supabase from .env.local
npm run staging:secrets:generate    # CRON, ENCRYPTION
npm run setup:impersonation-totp    # copy secret → .env.staging.local + Vercel
# Upstash: console.upstash.com → REST → paste UPSTASH_* into .env.staging.local

npm run pilot:100-gate              # code + DB + report
```

Report: [`docs/generated/PILOT_GO_NO_GO_STATUS.md`](./generated/PILOT_GO_NO_GO_STATUS.md)

---

## Blocker 1 — Upstash + TOTP (Ops)

| Step | Action |
|------|--------|
| 1 | `npm run staging:totp:generate` → scan QR; secret saved to `.env.staging.local` |
| 2 | **Upstash:** `npm run staging:upstash:wizard` (interactive) or [`UPSTASH_STAGING_SETUP.md`](./UPSTASH_STAGING_SETUP.md) |
| 3 | `npm run vercel:staging-push -- --apply` + redeploy staging |
| 4 | `npm run verify:staging-env` (must pass, no `--local-pilot`) |

**Локально без Upstash (не Vercel GO):** `npm run pilot:local-continue`

---

## Blocker 2 — Deploy staging + build (Ops/CI)

| Step | Action |
|------|--------|
| 1 | `npm run build` locally (or GitHub **Paid Pilot Gate** workflow). If OOM: `NODE_OPTIONS=--max-old-space-size=8192 npm run build` |
| 2 | Merge to deploy branch; Vercel staging deploy green |
| 3 | `NEXT_PUBLIC_APP_URL` on Vercel = real staging URL |
| 4 | Redeploy after env push |

**CI:** Actions → **Paid Pilot Gate** → Run workflow.

---

## Blocker 3 — HTTP smoke + E2E (Ops)

```bash
export SMOKE_BASE_URL=https://your-staging.vercel.app
export CRON_SECRET=...   # same as Vercel
npm run smoke:golden-path-http

export PLAYWRIGHT_BASE_URL=$SMOKE_BASE_URL
export E2E_PILOT_EMAIL=owner@pilot.com
export E2E_PILOT_PASSWORD=...
npm run test:e2e:pilot
```

Optional staff: `E2E_PILOT_STAFF_EMAIL`, `E2E_PILOT_STAFF_PASSWORD`.

---

## Blocker 4 — Manual golden path (Product)

[`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md) — owner + staff + negative checks (~45–60 min).

**Staff invite required** for B-section: invite with `orders.view` before staff login tests.

---

## Blocker 5 — Sign-off (Tech + Ops + Product)

```bash
npm run pilot:record-signoff -- --role=tech --by="Tech Lead" --go
npm run pilot:record-signoff -- --role=ops --by="Ops Lead" --go
npm run pilot:record-signoff -- --role=product --by="Product" --go --notes="Golden path complete"
```

Artifact: `docs/artifacts/PILOT_SIGNOFF.json` — all three roles → verdict **GO**.

Update [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) Staging/Prod columns.

---

## Definition of done

| Check | Command / artifact |
|-------|------------------|
| Code | `npm run verify:pilot-readiness` |
| DB | `npm run staging:pilot:db` + report |
| Vercel env | `npm run verify:staging-env` |
| Deploy | Staging URL loads `/login` |
| HTTP | `npm run smoke:golden-path-http` |
| E2E | `npm run test:e2e:pilot` |
| Manual | Golden path checklist signed |
| Sign-off | `PILOT_SIGNOFF.json` verdict GO |
