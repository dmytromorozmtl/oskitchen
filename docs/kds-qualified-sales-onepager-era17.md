# Era 17 — KDS qualified sales one-pager

**Policy:** `era17-kds-qualified-sales-onepager-v1`  
**Status:** **sales_onepager_ready**  
**Updated:** 2026-05-28  
**Audience:** sales, founders, buyer kitchen ops leads  
**Maturity source of truth:** [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)  
**Scope boundary:** [`kds-v1-scope.md`](./kds-v1-scope.md)  
**Parent runbook:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

Use this one-pager when a pilot contract includes **daily-service kitchen display (KDS)**. It is **not** a substitute for staging smoke, GitHub Playwright evidence, or operator sign-off.

---

## Purpose and honest scope

KitchenOS KDS v1 supports **qualified daily-service pilots**:

- Today's active order queue on `/dashboard/kitchen`
- Bump → `READY` and recall → `PREPARING` with RBAC + audit
- Elapsed timer, urgency colors, optional overdue chime
- Supabase Realtime with polling fallback

**Pilot maturity:** `pilot_ready` (qualified) — engineering cert + staging operator path; **not** rush-hour or production Realtime SLO certified.

Related policies: `era15-kds-staging-smoke-recert-v1`, `era17-kds-staging-playwright-proof-v1`, `era16-operational-signoff-v1`.

---

## What KDS v1 includes

| Capability | Evidence |
|------------|----------|
| Daily queue load | `test:ci:kds-v1:integration` — bump + recall |
| RBAC | `kitchen.view`, `kitchen.bump`, `kitchen.recall` |
| Staging smoke wiring | `npm run smoke:kds-staging` |
| Operator checklist | [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) Tier A–D |
| Unified sign-off | `npm run smoke:operational-signoff-era16` (KDS + production calendar) |

---

## What is not included

- Rush-hour / peak-load certification
- Item-level bumping, course firing, expo orchestration
- Canonical station routing engine
- Default-CI Playwright KDS (Tier E is optional staging workflow only)
- Toast-class multi-station kitchen orchestration
- Production Realtime SLO guarantee

---

## Safe sales wording

**Allowed (qualified):**

- "Daily-service KDS queue with bump and recall — **qualified pilot path**"
- "Staging smoke + operator checklist — **not rush-hour certified**"
- "Kitchen permissions via existing `kitchen.*` RBAC"

**Not allowed:**

- "Rush-hour ready" or "peak service certified"
- "Restaurant-grade KDS" or "Toast parity"
- "Playwright always green in CI"
- "Production Realtime SLO"

---

## Evidence paths for pilots

### Engineering (pre-contract)

```bash
npm run test:ci:kds-staging-smoke:cert
npm run smoke:kds-staging
```

### Staging operator (pre-go-live)

1. Complete [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) Tier B–D on staging tenant.
2. Optional Tier E: `workflow_dispatch` **`playwright-kds-staging.yml`** — record GitHub run URL.
3. Run `npm run smoke:kds-staging-playwright` with `GITHUB_KDS_STAGING_RUN_*` when workflow completes.
4. Run `npm run smoke:operational-signoff-staging` with staging URL + operator email.

**Honest skip:** Without `E2E_STAGING_*` secrets or GitHub run URL → **SKIPPED WITH REASON** (not fake PASS).

---

## Forbidden pilot claims

Do **not** include in contracts, decks, or buyer FAQ:

- Rush-hour KDS certification
- Default-CI Playwright KDS pass
- Production Realtime SLO
- Full station routing / expo product
- Toast / Square KDS parity

Enforcement: `era17-pilot-forbidden-claims-enforcement-v1` — `npm run smoke:pilot-forbidden-claims-enforcement`.

---

## Support boundaries

| In scope (pilot) | Out of scope |
|------------------|--------------|
| Bump/recall on daily queue | Custom station routing |
| Permission denied UX on KDS | Hardware KDS device certification |
| Staging checklist walkthrough | 24/7 rush-hour on-call SLO |
| Webhook → order hub visibility | Marketplace kitchen integrations |

**Rollback:** Disable KDS module entitlement; orders remain in order hub; no data loss on bump audit trail.

---

## Sign-off checklist

| # | Item | Owner | Pass |
|---|------|-------|------|
| 1 | `test:ci:kds-staging-smoke:cert` green on release commit | Engineering | ☐ |
| 2 | Staging Tier B–D checklist complete | Kitchen lead | ☐ |
| 3 | Playwright GitHub run recorded OR explicit skip documented | DevOps | ☐ |
| 4 | Operational sign-off artifact reviewed | Owner + ops | ☐ |
| 5 | Contract uses **qualified** wording only | Sales + legal | ☐ |
| 6 | Forbidden claims scan PASS before signature | GTM | ☐ |

---

## Related docs

- [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) — operator tiers
- [`production-calendar-operator-checklist.md`](./production-calendar-operator-checklist.md) — paired production sign-off
- [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) — Playwright workflow secrets
