# Beta Launch Sign-Off (steps 1–6)

Formal gate before **guided closed beta**. Run automated checks, then collect human sign-offs.

## Automated gate (all steps)

```bash
npm run beta:launch -- --json
# Report: docs/artifacts/BETA_LAUNCH_REPORT.json
```

With Playwright (step 4 + 5 E2E):

```bash
export SMOKE_BASE_URL="https://staging..."
export SMOKE_DELIVERY_CONNECTION_ID_OTHER="uuid"
eval "$(npm run smoke:session-cookie --silent)"
npm run beta:launch -- --with-playwright --json
```

---

## Step 1 — DBA

| Field | Value |
|-------|-------|
| Packet | `docs/artifacts/DBA_MIGRATION_PACKET.md` |
| Command | `npm run dba:migration-review` |
| Record approval | `npm run dba:record-signoff -- --by="Name" --ticket=JIRA-123` |
| Artifact | `docs/artifacts/DBA_SIGNOFF.json` |

**Sign-off:** DBA ______________ Date __________

---

## Step 2 — DevOps

| Check | Command |
|-------|---------|
| Full remediation | `npm run staging:remediation-all` |
| Backfill only | `npm run check:backfill` |

**Sign-off:** DevOps ______________ Date __________

---

## Step 3 — Env

| Check | Command |
|-------|---------|
| Template | `.env.staging.example` → Vercel |
| TOTP setup | `npm run setup:impersonation-totp` |
| Verify | `npm run verify:staging-env -- --strict` |

**Sign-off:** DevOps ______________ Date __________

---

## Step 4 — QA

| Check | Command |
|-------|---------|
| Bundle | `npm run beta:qa-bundle -- --with-playwright` |
| Or orchestrator | `npm run beta:launch -- --step=4 --with-playwright` |

**Sign-off:** QA ______________ Date __________

---

## Step 5 — Product

| Check | Command |
|-------|---------|
| DB scope | `npm run verify:staff-scope` |
| Order parity | `npm run verify:staff-parity -- --owner-email=OWNER@` |
| Manual UI | `docs/MANUAL_STAFF_VISIBILITY_CHECKLIST.md` |
| Staff E2E | `E2E_STAFF_*` + `staff-order-visibility` spec |
| Record | `npm run beta:record-product-signoff -- --by="..."` |

**Artifact:** `docs/artifacts/PRODUCT_SIGNOFF.json`

**Sign-off:** Product ______________ Date __________

---

## Step 6 — Founder

| Kitchen | Email | Preflight | Date |
|---------|-------|-----------|------|
| 1 | | `npm run beta:kitchen-preflight -- --email=` | |
| 2 | | | |
| 3 | | | |

Batch: `npm run beta:cohort -- --emails=a@,b@,c@`

**Sign-off:** Founder ______________ Closed beta start __________
