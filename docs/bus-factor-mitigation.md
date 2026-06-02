# Bus factor mitigation plan

**Policy:** `bus-factor-mitigation-v1`  
**Updated:** 2026-06-02  
**Owner:** Founder  
**Review cadence:** Quarterly (or after first engineering hire)  
**Snapshot:** Engineering headcount **1** · bus factor **1** · ~566 dashboard routes · 399 Prisma models · 1,300+ internal docs

This plan reduces **key-person risk** for OS Kitchen — what breaks if the sole engineer is unavailable for 48+ hours, and how to mitigate before Series A diligence or first paid pilot at scale.

**Honesty rule:** Documentation and CI reduce risk but **do not replace** a second engineer for production on-call. Investors and design partners should hear: “Mitigations in place; hire #2 is planned.”

---

## Executive summary

| Risk tier | If founder unavailable 48h | Mitigation status (June 2026) |
|-----------|------------------------------|-------------------------------|
| **P0 — Production down** | No deploy fix, no Sev-1 triage | Runbooks exist; **no backup on-call** |
| **P0 — Secrets / infra** | Vercel, Supabase, Stripe access may be single-holder | Checklist below — **verify shared vault** |
| **P1 — Pilot customer** | CS responses stall; no hotfix | [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) + limitation sheet |
| **P1 — Integrations** | Webhook/cron debugging stops | 37+ runbooks in `docs/runbooks/` |
| **P2 — Sales / GTM** | Demos pausable | Recorded demo + honest limitation sheet |
| **P2 — Roadmap velocity** | Zero feature shipping | Expected — not an incident |

**Target bus factor:** **2** for production ops by Q4 2026 (founder + full-stack #2 or contracted on-call).

---

## Current single points of failure

### People

| Role | Holders today | Impact if absent |
|------|---------------|------------------|
| Engineering / deploy / on-call | 1 (founder) | No code fixes, no prod deploys, no migration apply |
| Product / PM / sales claims gate | 1 (founder) | No LIVE promotion sign-off; claims drift risk |
| Customer success (pilot) | 0 dedicated FTE | Founder covers — pilot syncs slip |
| Legal / finance | External ad hoc | Contract delays — not same-day ops |

### Systems (access concentration)

| System | Critical for | Backup access required |
|--------|----------------|------------------------|
| **GitHub** (repo + Actions secrets) | CI, deploy triggers | ☐ Second admin or org break-glass |
| **Vercel** (prod + staging) | Hosting, env vars, crons | ☐ Second team member |
| **Supabase** (Postgres + Auth) | All tenant data | ☐ Second project admin |
| **Stripe** (platform + Connect) | Payments, marketplace payouts | ☐ Second team member |
| **Domain / DNS** | os-kitchen.com, staging | ☐ Registrar login in shared vault |
| **Sentry** (when configured) | Sev-1 signals | ☐ Second member |
| **Upstash / Resend** | Rate limits, email | ☐ Documented in staging checklist |

**Action:** Complete § Access continuity checklist before next prod deploy.

---

## Knowledge map (what must be written down)

High-complexity areas where tacit knowledge is highest risk:

| Domain | Canonical doc / path | Second person can execute? |
|--------|----------------------|:--------------------------:|
| Deploy + rollback | [`migration-deployment-process.md`](./migration-deployment-process.md) · [`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md) | Partial — with runbook |
| Prisma migrations | [`docs/runbooks/DATABASE_MIGRATION_RUNBOOK.md`](./runbooks/DATABASE_MIGRATION_RUNBOOK.md) | Partial — needs DB access |
| Webhook failures | [`docs/runbooks/WEBHOOK_FAILURE_RUNBOOK.md`](./runbooks/WEBHOOK_FAILURE_RUNBOOK.md) | Yes — if given env |
| Cron failures | [`docs/runbooks/CRON_FAILURE_RUNBOOK.md`](./runbooks/CRON_FAILURE_RUNBOOK.md) | Yes |
| Incidents | [`INCIDENT_RESPONSE_RUNBOOK.md`](./INCIDENT_RESPONSE_RUNBOOK.md) | Partial — no backup engineer |
| Staging vault | [`staging-environment-checklist.md`](./staging-environment-checklist.md) | No — secrets holder only |
| Integration LIVE promotion | [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) | Yes — process documented |
| Sales-safe claims | [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) | Yes — CS can read |
| CI / smoke matrix | [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md) | Yes — run documented npm scripts |
| Architecture surface | [`navigation-audit.md`](./navigation-audit.md) · [`component-library.md`](./component-library.md) | Browse-only |

**Gap:** No ADR folder — add lightweight `docs/adr/` for major decisions (Task backlog).

---

## Mitigation pillars

### 1 — Documentation (done / in progress)

| Asset | Purpose | Status |
|-------|---------|--------|
| 122-task executor artifacts | Execution trace | `artifacts/execution-log.txt` |
| Pilot + staging checklists | Ops without founder narrative | Published |
| Runbook library | Incident playbooks | 37+ files |
| Sales limitation sheet | Pause overselling if founder out | Task 58 done |
| This plan | Bus factor explicit | Task 59 |

**Rule:** Any production change ships with runbook link or checklist update — see [`release-notes-process.md`](./release-notes-process.md).

### 2 — Automation & CI (reduces human-only steps)

| Control | Bus factor effect |
|---------|-------------------|
| GitHub Actions CI | Catches regressions without founder review of every line |
| `npm run verify-claims` | Blocks forbidden sales copy drift |
| Prisma validate + migration checks in CI | Schema mistakes caught pre-deploy |
| E2E + unit cert matrix | [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md) — runnable by hire #2 |
| Production cron manifest | Experimental routes gated — reduces surprise prod behavior |

**Gap:** P0 staging smokes still SKIPPED without ops credentials — unblocks when vault shared.

### 3 — Access continuity

Complete within **14 days**:

| # | Action | Owner | Done |
|---|--------|-------|:----:|
| A1 | Password manager vault (1Password / Bitwarden) with GitHub, Vercel, Supabase, Stripe, DNS | Founder | ☐ |
| A2 | Second admin on GitHub org (trusted advisor or hire) | Founder | ☐ |
| A3 | Second Vercel team member | Founder | ☐ |
| A4 | Supabase second owner + documented connection strings in vault | Founder | ☐ |
| A5 | Stripe second admin + Connect dashboard access documented | Founder | ☐ |
| A6 | Emergency contact card: who customers email if founder unreachable | Founder | ☐ |
| A7 | `artifacts/emergency-access-checklist.json` (optional) — last verified date | Founder | ☐ |

**Do not** commit secrets to git. Reference vault location in ops drive only.

### 4 — Hire & contractor plan

Per [`ultimate-audit-24may2026.md`](./ultimate-audit-24may2026.md) recommendation:

| Priority | Role | Bus factor impact | Timing |
|:--------:|------|-------------------|--------|
| **H1** | **Full-stack engineer #2** OR **CS/Solutions engineer** | On-call backup + pilot support | Q3 2026 target |
| H2 | Part-time DevOps / SRE contract | Vault, smokes, observability | Before second pilot |
| H3 | Fractional legal/finance | Not ops-critical | As needed |

**First hire onboarding (minimum 2 weeks):**

1. Read this doc + [`INCIDENT_RESPONSE_RUNBOOK.md`](./INCIDENT_RESPONSE_RUNBOOK.md)
2. Shadow staging deploy ([`migration-deployment-process.md`](./migration-deployment-process.md))
3. Run `npm run test:ci:governance-bundles` locally
4. Execute one webhook runbook drill on staging
5. Pair on Integration Health demo path

### 5 — Pilot & customer continuity

If founder unavailable during active pilot:

| Step | Action | Owner fallback |
|------|--------|----------------|
| 1 | Post status on agreed channel — “engineering response delayed” | CS advisor or founder async |
| 2 | No new LIVE claims or scope expansion | Any team member — read limitation sheet |
| 3 | Sev-1: revert deploy via Vercel rollback (documented) | Advisor with Vercel access |
| 4 | Sev-2/3: queue fixes; use runbooks for cron/webhook | Hire #2 when onboarded |

Reference: [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md)

---

## 30 / 60 / 90 day actions

### Days 1–30 (June 2026)

| Action | Outcome |
|--------|---------|
| Complete access continuity checklist (§3) | Second admin on GitHub + Vercel |
| Share staging checklist with trusted advisor | Someone can verify `/api/health` |
| Record 90s Today demo video (Task 63) | Sales continues without live founder demo |
| Publish this plan | Diligence-ready honesty |

### Days 31–60

| Action | Outcome |
|--------|---------|
| Contract part-time DevOps for smoke execution | P0 smokes PASS with shared creds |
| Start hire #2 pipeline | Recruiting in flight |
| Add 3 ADRs (marketplace, tenancy, integrations) | Knowledge not only in founder head |
| Quarterly bus-factor review #1 | Update this doc |

### Days 61–90

| Action | Outcome |
|--------|---------|
| Hire #2 starts OR contractor on-call rota | Bus factor → 1.5 minimum |
| Cross-train on migration deploy + rollback drill | Second person executed prod rollback on staging |
| Sentry + on-call routing configured | [`sentry-setup.md`](./sentry-setup.md) |
| Incident process formalized | Task 61 `incident-response-process.md` |

---

## Bus factor scorecard (track quarterly)

| Metric | Jun 2026 | Q3 target | Q4 target |
|--------|:--------:|:---------:|:---------:|
| Engineering FTE | 1 | 1–2 | 2 |
| People who can deploy staging | 1 | 2 | 2 |
| People who can deploy production | 1 | 1* | 2 |
| People with vault access | 1 | 2 | 2 |
| Documented runbooks | 37+ | 40+ | 45+ |
| ADRs | 0 | 3 | 8 |
| On-call rotation | None | Advisor backup | 2-person rota |

\*Production deploy may remain founder-only until hire #2 completes 30-day onboarding — document explicitly in investor updates.

---

## What we tell investors & design partners

**Approved wording:**

> “OS Kitchen is founder-led engineering today with extensive runbooks, CI gates, and honest maturity labels. Bus factor is **1** — we’re mitigating through documentation, access continuity, and hiring a second engineer in Q3 2026. We do not claim 24/7 engineering SLA until hire #2 is onboarded.”

**Do not claim:** “Team of experts,” “dedicated 24/7 ops,” “enterprise-grade staffing” (see [`sales-limitation-sheet.md`](./sales-limitation-sheet.md)).

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`INCIDENT_RESPONSE_RUNBOOK.md`](./INCIDENT_RESPONSE_RUNBOOK.md) | Sev-1/2/3 playbooks |
| [`staging-environment-checklist.md`](./staging-environment-checklist.md) | Infra handoff |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Pilot ops |
| [`migration-deployment-process.md`](./migration-deployment-process.md) | Schema deploy |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | Contributor onboarding (expand) |
| Task 61 | `incident-response-process.md` |
| Task 99 | `customer-success-playbook.md` |
| Task 114 | `support-tier-plan.md` |

---

## Review log

| Date | Reviewer | Change |
|------|----------|--------|
| 2026-06-02 | Founder | v1.0 initial plan — bus factor 1 acknowledged |

**Next review due:** 2026-09-02 (or within 14 days of first engineering hire).
