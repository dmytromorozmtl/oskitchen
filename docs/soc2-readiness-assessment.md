# SOC 2 readiness assessment — OS Kitchen

**Policy:** `soc2-readiness-assessment-v1`  
**Date:** 2026-06-02  
**Owner:** Founder + Engineering + Ops  
**Scope:** Readiness for **SOC 2 Type II** (Security + Availability TSC) — **not an audit report**  
**Status:** **Not certified** · **Not audit-ready** · internal gap analysis only

This assessment maps OS Kitchen controls against **AICPA Trust Services Criteria** commonly in scope for B2B SaaS. It supports enterprise questionnaires, Series A diligence, and roadmap planning — **never** substitute for a CPA attestation.

**Hard rule:** Do **not** claim "SOC 2 compliant," "SOC 2 certified," or "SOC 2 ready" in sales, marketing, or contracts until a Type II report is issued.

**Related:** [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) · [`PLATFORM_SECURITY_TENANT_ISOLATION.md`](./PLATFORM_SECURITY_TENANT_ISOLATION.md) · [`incident-response-process.md`](./incident-response-process.md) · [`series-a-narrative.md`](./series-a-narrative.md)

---

## Executive summary

| Dimension | Readiness | Notes |
|-----------|:---------:|-------|
| **Overall** | **~35%** (directional) | Strong engineering primitives; weak formal GRC program |
| **Security (CC)** | Partial | RBAC, encryption, tenant isolation — gaps in access reviews, pen test |
| **Availability (A)** | Partial | Health checks, Vercel — no documented SLA, DR drill |
| **Processing integrity (PI)** | Partial | CI gates, webhook verification — not formally mapped |
| **Confidentiality (C)** | Partial | `ENCRYPTION_KEY`, scoped queries — vendor DPA incomplete |
| **Privacy (P)** | Partial | Legal pages exist — retention automation immature |
| **Audit observation period** | **Not started** | Type II requires 3–12 month operating period |

**Bottom line (June 2026):** OS Kitchen has **credible technical controls** for a pre-revenue SaaS (RBAC CI, audit logs, staging checklist, incident process) but lacks **policy corpus, access governance, vendor risk program, penetration testing, and evidence collection** required for SOC 2 Type II. Target **readiness phase** Q4 2026 → **observation start** Q1 2027 → **report** H2 2027 (indicative, budget-dependent).

**Canonical timeline:** [`soc2-roadmap-with-timeline.md`](./soc2-roadmap-with-timeline.md) (`soc2-roadmap-absolute-final-v1`, Absolute Final Task 66).

---

## In-scope trust services criteria

| TSC | In scope? | Rationale |
|-----|:---------:|-----------|
| **Security** | **Yes** | Core enterprise ask — auth, RBAC, encryption, monitoring |
| **Availability** | **Yes** | SaaS uptime expectations for pilots |
| Processing Integrity | Optional Phase 2 | Order/payment integrity — map after Security PASS |
| Confidentiality | Partial overlap | Covered under Security CC for most buyers |
| Privacy | Optional Phase 2 | GDPR/CCPA requests — separate privacy program |

**Phase 1 audit scope recommendation:** Security + Availability only (reduces cost vs full five TSC).

---

## Current posture vs SOC 2

| Claim | Allowed? | Evidence |
|-------|:--------:|----------|
| SOC 2 Type II certified | **No** | No CPA report |
| SOC 2 in progress | **Internal only** | This doc — not customer-facing until auditor engaged |
| Security controls documented | **Yes (partial)** | Enterprise procurement pack, this assessment |
| SSO / SCIM production | **No** | Pilot foundation only — [`sso-idp-smoke-test-plan.md`](./sso-idp-smoke-test-plan.md) SKIPPED |
| 24/7 SOC | **No** | Business-hours on-call — [`incident-response-process.md`](./incident-response-process.md) |

---

## Control mapping — Common Criteria (CC)

Rating key: **Ready** · **Partial** · **Gap** · **N/A**

### CC1 — Control environment

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Security policies documented | **Gap** | Ad-hoc docs; no ISO-style policy set | Publish InfoSec + Acceptable Use policies (Q3 2026) |
| Roles & responsibilities | **Partial** | RACI in incident doc; bus factor 1 | [`bus-factor-mitigation.md`](./bus-factor-mitigation.md) |
| Board / management oversight | **Gap** | Founder-led | Document quarterly security review cadence |
| Code of conduct / background checks | **Gap** | Not formalized | Defer until hire #2+ |

### CC2 — Communication & information

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Security awareness training | **Gap** | No LMS / annual training | Founder + eng security checklist |
| Customer security communications | **Partial** | `/trust`, limitation sheet | Trust page — no SOC badge |
| Internal incident comms | **Partial** | [`incident-response-process.md`](./incident-response-process.md) | Test tabletop once |

### CC3 — Risk assessment

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Threat modeling | **Partial** | Webhook matrix (Task 30), tenant isolation doc | Formal annual risk register |
| Vendor risk assessment | **Gap** | Subprocessors listed informally in procurement pack | Vendor inventory + DPAs (Supabase, Vercel, Stripe, Sentry) |
| Change risk | **Partial** | CI, migration process doc | Link releases to change log |

### CC4 — Monitoring activities

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Error / security monitoring | **Partial** | Sentry (when DSN set), `/api/health` | Enable prod Sentry — [`sentry-setup.md`](./sentry-setup.md) |
| Log review | **Gap** | No scheduled log review | Weekly ops review template |
| Integration health monitoring | **Partial** | Integration Health dashboard | Extend to alerting |

### CC5 — Control activities

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Access provisioning / deprovisioning | **Partial** | Staff invites, workspace roles | Formal joiner/mover/leaver checklist |
| RBAC enforcement | **Ready** | `test:ci:rbac-wave4`, mutation registry | Maintain CI |
| Encryption at rest | **Partial** | `ENCRYPTION_KEY`, Supabase TLS | Document key rotation procedure |
| Encryption in transit | **Ready** | HTTPS via Vercel, `sslmode` on DB | Staging checklist §2 |
| Secure SDLC | **Partial** | CI, forbidden claims, pre-commit | Add dependency scanning (Dependabot ✓ if enabled) |
| Vulnerability management | **Gap** | No pen test scheduled | Schedule annual pen test (Q4 2026) |
| Backup & recovery | **Partial** | Supabase PITR mentioned in staging checklist | Document RPO/RTO; run restore drill |

### CC6 — Logical & physical access

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Authentication | **Partial** | Supabase email/password | SSO pilot only — not production |
| MFA for production access | **Partial** | Vercel/Supabase/GitHub MFA (operator discipline) | Enforce MFA policy doc |
| Least privilege (app) | **Ready** | Permission keys, platform bypass audited | Continue RBAC waves |
| Tenant isolation | **Ready** | Workspace-scoped queries, cross-tenant E2E | [`PLATFORM_SECURITY_TENANT_ISOLATION.md`](./PLATFORM_SECURITY_TENANT_ISOLATION.md) |
| Physical access | **N/A** | Cloud-hosted — provider SOC reports | Collect Supabase/Vercel SOC reports |

### CC7 — System operations

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Capacity / performance | **Partial** | Vercel auto-scale | No load SLO documented |
| Deployment process | **Partial** | Vercel deploy, migration process doc | Change approval for prod |
| Incident response | **Partial** | Incident process + runbooks | Tabletop + postmortem template in use |
| Business continuity / DR | **Gap** | No tested DR playbook | DR runbook + annual test |

### CC8 — Change management

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Change testing | **Ready** | CI unit/E2E, TypeScript gate | Maintain |
| Segregation of duties | **Gap** | Single engineer can deploy | Require review on main (branch protection) |
| Emergency changes | **Partial** | Vercel rollback documented in incident doc | Log emergency changes |

### CC9 — Risk mitigation (vendor & business)

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Vendor SOC reports | **Gap** | Not collected in data room | Request Supabase, Stripe, Vercel SOC 2 |
| Subprocessor list | **Partial** | Procurement pack mentions | Publish customer-facing subprocessor page |
| Insurance (cyber) | **Gap** | Unknown | Evaluate cyber liability at Series A |

---

## Availability criteria (selected)

| Control | Status | Evidence | Gap / action |
|---------|:------:|----------|--------------|
| Uptime monitoring | **Partial** | `/api/health`, Vercel analytics | External uptime monitor (e.g. Better Stack) |
| Incident classification | **Partial** | SEV-1–4 in incident doc | Customer-facing status page optional |
| Backup frequency | **Partial** | Supabase managed backups | Verify plan tier + document |
| Recovery testing | **Gap** | Not executed | Quarterly restore drill |
| SLA commitment | **Gap** | No contracted SLA | [`support-tier-plan.md`](./support-tier-plan.md) (Task 114) |

---

## Evidence inventory (existing)

| Artifact | SOC relevance | Location |
|----------|---------------|----------|
| RBAC CI certification | CC6, CC5 | `test:ci:rbac-wave4`, `lib/security/rbac-wave4-era9-policy.ts` |
| Audit log system | CC4, CC2 | `recordAuditLog`, `/dashboard/audit-logs` |
| Tenant isolation | CC6 | `docs/PLATFORM_SECURITY_TENANT_ISOLATION.md`, E2E cross-tenant |
| Staging / secrets checklist | CC5, CC7 | `docs/staging-environment-checklist.md` |
| Incident response | CC7 | `docs/incident-response-process.md` |
| Observability | CC4 | `docs/observability-setup.md`, `docs/sentry-setup.md` |
| Legal / DPA | CC9, Privacy | `/legal/privacy`, `/legal/dpa`, `/legal/security` |
| Forbidden claims CI | CC2 | `tests/unit/forbidden-claims-enforcement.test.ts` |
| Enterprise procurement pack | All | `docs/enterprise-procurement-pack.md` |
| Webhook signature matrix | CC5 | `artifacts/webhook-signature-matrix.md` (Task 30) |

---

## Gap summary — priority backlog

### P0 (before enterprise RFP response)

| # | Gap | Owner | Target |
|---|-----|-------|--------|
| 1 | Enable production Sentry + health green | Eng | Q3 2026 |
| 2 | Publish subprocessor list + link on `/trust` | Ops/Legal | Q3 2026 |
| 3 | Collect vendor SOC 2 reports (Supabase, Vercel, Stripe) | Ops | Q3 2026 |
| 4 | Document encryption key rotation + backup RPO/RTO | Eng | Q3 2026 |
| 5 | MFA enforced on GitHub, Vercel, Supabase (founder) | Founder | Immediate |

### P1 (readiness — pre-observation)

| # | Gap | Owner | Target |
|---|-----|-------|--------|
| 6 | InfoSec policy + Acceptable Use policy | Founder | Q4 2026 |
| 7 | Access review quarterly (GitHub, Vercel, DB) | Eng | Q4 2026 |
| 8 | Penetration test (external) | Eng | Q4 2026 |
| 9 | DR restore drill documented | Ops | Q4 2026 |
| 10 | SSO staging smoke PASS | Eng | Q4 2026 |
| 11 | Vanta/Drata or spreadsheet control tracker | Ops | Q4 2026 |

### P2 (observation period)

| # | Gap | Owner | Target |
|---|-----|-------|--------|
| 12 | Engage SOC 2 auditor (CPA firm) | Founder | Q1 2027 |
| 12 | 3–6 month observation window | All | Q1–Q2 2027 |
| 13 | Security awareness training (all personnel) | HR/Founder | Q1 2027 |
| 14 | Tabletop incident exercise (documented) | Founder | Q1 2027 |
| 15 | Type II report issuance | Auditor | H2 2027 |

---

## Readiness roadmap

```mermaid
flowchart LR
  A[Today: Not certified] --> B[Q3: P0 evidence]
  B --> C[Q4: Policies + pen test]
  C --> D[Q1 2027: Auditor + observation]
  D --> E[H2 2027: Type II report]
```

| Phase | Milestone | Unlocks |
|-------|-----------|---------|
| **0** | This assessment published | Honest enterprise questionnaire answers |
| **1** | P0 gaps closed | "SOC 2 readiness program in progress" (internal) |
| **2** | Policies + pen test + DR drill | Auditor readiness call |
| **3** | Observation period start | Customer "in audit" letter (optional) |
| **4** | Type II report | Contractual SOC 2 claim allowed |

---

## Questionnaire answer templates

**Do you have SOC 2 Type II?**

> No. OS Kitchen is not SOC 2 certified. We maintain an internal readiness program mapped to Security and Availability criteria, with RBAC enforcement, audit logging, encryption, and incident response documented. We can share our security overview and [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md). Target Type II observation start is Q1 2027 subject to budget and auditor engagement.

**Describe access controls.**

> Role-based access control with workspace-scoped permissions, certified in CI (`rbac-wave4`). Platform admin access is restricted and audited. Production database credentials are encrypted at rest using application-level encryption for sensitive integration secrets. SSO is in pilot foundation — production default is email/password via Supabase.

**Describe monitoring and incident response.**

> Application errors route to Sentry when configured. Health endpoint checks database and dependencies. Incidents are classified SEV-1 through SEV-4 with documented response targets in our incident response process. We do not contract 24/7 SLA for pilot tier customers.

**Subprocessors?**

> Managed Postgres (Supabase), hosting (Vercel), payments (Stripe), email (Resend), optional SMS (Twilio), error tracking (Sentry). We request SOC 2 reports from critical vendors and list subprocessors in our DPA.

---

## What not to claim

| Forbidden | Say instead |
|-----------|-------------|
| SOC 2 certified / compliant | Not certified; readiness program in progress |
| SOC 2 ready (to customers) | Internal readiness ~35% — auditor not engaged |
| Enterprise-ready day one | Pilot-ready with documented limitations |
| Pen tested | Not until external test complete |
| 99.9% uptime SLA | No contracted SLA — best effort |

Enforced by: `npm run verify-claims` · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

---

## Verification checklist (internal)

Before updating procurement materials:

- [ ] No "SOC 2 certified" in `app/`, `docs/`, `lib/marketing/`
- [ ] `/trust` and `/legal/security` align with this assessment
- [ ] Sentry enabled in production (`checks.sentryServer.ok`)
- [ ] Vendor SOC reports filed in data room folder
- [ ] Pen test scheduled or completed with remediation tracker
- [ ] Auditor engagement letter signed (observation phase)
- [ ] Board/founder sign-off on readiness % and timeline

---

## Related docs

| Doc | Use |
|-----|-----|
| [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) | RFP / security questionnaire |
| [`sso-idp-smoke-test-plan.md`](./sso-idp-smoke-test-plan.md) | Identity controls |
| [`incident-response-process.md`](./incident-response-process.md) | CC7 |
| [`staging-environment-checklist.md`](./staging-environment-checklist.md) | CC5/CC7 ops |
| [`toast-gap-analysis.md`](./toast-gap-analysis.md) | vs Toast enterprise maturity |
| [`enterprise-mvp-spec.md`](./enterprise-mvp-spec.md) | Enterprise product scope (Task 103) |

---

*Generated as Task 95 — P2 PM. Next: [`marketplace-pricing-strategy.md`](./marketplace-pricing-strategy.md) (Task 96).*
