# SOC 2 Roadmap with Timeline

**Status:** Internal GRC roadmap — **not certified**, **not audit-ready**  
**Audience:** Founder, engineering, ops, enterprise sales (internal only until auditor engaged)  
**Policy:** `soc2-roadmap-absolute-final-v1` (`lib/compliance/soc2-roadmap-absolute-final-policy.ts`)  
**Related:** [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md) · [`SOC2_ROADMAP_Q4.md`](./SOC2_ROADMAP_Q4.md) · [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md)

---

## Purpose

Single **quarter-by-quarter timeline** from gap closure through Type II observation. Detailed control mapping lives in [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md) (~35% readiness as of June 2026).

**Honesty rule:** Do **not** claim SOC 2 Type I/II certified, compliant, or audit-ready in sales or marketing. Use `/trust` and procurement pack language only.

---

## Current posture

| Dimension | Status | Notes |
|-----------|--------|-------|
| Certification | **Not certified** | No CPA attestation |
| Readiness (directional) | **~35%** | Strong RBAC + tenant isolation; weak formal GRC |
| In-scope TSC (Phase 1) | **Security + Availability** | Processing Integrity / Privacy deferred |
| Observation period | **Not started** | Type II requires 3–12 months operating evidence |
| Enterprise blocker | **Yes** for RFPs requiring attestation | **No** for meal-prep / ≤5-location pilots |

---

## Timeline

| Phase | Window | Goal | Exit criteria |
|-------|--------|------|---------------|
| **Phase 0 — Baseline** | Jun 2026 (now) | Inventory controls + close P0 gaps | Sentry prod active; subprocessor list published; vendor SOC reports requested |
| **Phase 1 — Gap analysis** | Jul–Aug 2026 | Formal gap register + policy corpus draft | InfoSec + IR policies written; access review template; pen test scheduled |
| **Phase 2 — Readiness** | Sep–Oct 2026 | Control operating procedures live | Quarterly access review #1; DR restore drill logged; SSO staging smoke PASS |
| **Phase 3 — Type I prep** | Nov–Dec 2026 | Auditor selected; evidence binder started | Vanta/Drata or boutique engaged; Type I point-in-time scope signed |
| **Phase 4 — Observation** | Q1–Q2 2027 | Type II operating period (6 mo indicative) | Continuous control evidence; zero critical open gaps |
| **Phase 5 — Type II report** | H2 2027 (target) | CPA attestation issued | Customer-facing trust update — **only after report received** |

**Budget (indicative):** $15–40k first year (GRC tooling + audit fees). Revisit at Series A.

---

## Gap analysis

Summary by trust criteria area. Full CC1–CC9 tables: [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md).

| Area | Today | Gap | Phase 1 action |
|------|-------|-----|----------------|
| **CC1 Control environment** | Founder-led; ad-hoc policies | No formal policy set | Publish InfoSec + Acceptable Use (Q3 2026) |
| **CC2 Communication** | Trust page; incident doc | No security awareness program | Tabletop exercise + internal checklist |
| **CC3 Risk assessment** | Tenant isolation doc; webhook matrix | No vendor risk register | Subprocessor inventory + DPA status |
| **CC4 Monitoring** | `/api/health`; Sentry optional | No 24/7 alerting runbook | Enable prod Sentry; weekly log review |
| **CC5 Control activities** | RBAC CI; encryption key | No pen test; key rotation doc | Schedule pen test Q4 2026 |
| **CC6 Logical access** | RBAC ready; tenant isolation ready | SSO not production; no access reviews | SSO staging PASS; quarterly access review |
| **CC7 System operations** | Incident process partial | No tested DR playbook | DR runbook + restore drill |
| **CC8 Change management** | CI gates ready | Single-operator deploy | Branch protection + change log |
| **CC9 Vendor risk** | Procurement pack partial | Vendor SOC reports not collected | Request Supabase, Vercel, Stripe SOC 2 |
| **Availability (A)** | Health checks partial | No SLA / external uptime monitor | Better Stack or equivalent; document RPO/RTO |

### Priority backlog (P0 → P2)

| Priority | Item | Owner | Target |
|----------|------|-------|--------|
| **P0** | Production Sentry + health green | Eng | Q3 2026 |
| **P0** | Subprocessor list on `/trust` | Ops/Legal | Q3 2026 |
| **P0** | Vendor SOC 2 reports collected | Ops | Q3 2026 |
| **P0** | Encryption key rotation + backup RPO/RTO documented | Eng | Q3 2026 |
| **P0** | MFA on GitHub, Vercel, Supabase | Founder | Immediate |
| **P1** | InfoSec + Acceptable Use policies | Founder | Q4 2026 |
| **P1** | Quarterly access review | Eng | Q4 2026 |
| **P1** | External penetration test | Eng | Q4 2026 |
| **P1** | DR restore drill | Ops | Q4 2026 |
| **P1** | GRC tracker (Vanta/Drata or spreadsheet) | Ops | Q4 2026 |
| **P2** | Type II observation evidence collection | Ops | Q1 2027 |
| **P2** | Customer-facing status page (optional) | Ops | Q1 2027 |

---

## Evidence wiring (engineering)

| Capability | SOC relevance | Cert / doc |
|------------|---------------|------------|
| RBAC waves | CC6 | `test:ci:rbac-wave4` |
| Audit trail | CC4 | `/dashboard/audit`, era140 panel |
| Forbidden claims | CC2 | `tests/unit/forbidden-claims-enforcement.test.ts` |
| Tenant isolation | CC6 | `PLATFORM_SECURITY_TENANT_ISOLATION.md` |
| Incident response | CC7 | `incident-response-process.md` |
| SOC2 experiment evidence | CC4 | `npm run ops:soc2-experiment-evidence` |

Dashboard: `/dashboard/enterprise/audit-compliance` — SOC2-ready trail scorecard (readiness only, **not certification**).

---

## Human gate checklist

Before answering enterprise security questionnaires:

- [ ] Confirm **not certified** — use questionnaire templates in [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md)
- [ ] Attach procurement pack — no SOC badge on `/trust`
- [ ] Disqualify RFP if Type II report required in pilot term
- [ ] Log questionnaire in CRM with readiness % and target phase from timeline above
- [ ] Run `npm run test:ci:soc2-roadmap:cert` after roadmap updates

---

## Sales guidance

| Buyer ask | Safe response |
|-----------|---------------|
| "Are you SOC 2 certified?" | **No.** Roadmap targets Type I prep Q4 2026, Type II H2 2027 — subject to budget and auditor. |
| "SOC 2 in progress?" | **Internal roadmap only** — not a customer attestation until CPA report issued. |
| "What controls do you have today?" | RBAC, audit logs, tenant isolation, incident process — see procurement pack. |
| "When will you be certified?" | Indicative H2 2027 Type II — **not a commitment** until observation period starts. |

---

## References

- [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md) — CC mapping, questionnaire templates
- [`SOC2_ROADMAP_Q4.md`](./SOC2_ROADMAP_Q4.md) — legacy Q4 2026 Type I notes (superseded by this timeline for Absolute Final)
- [`lib/compliance/soc2-control-mapping.ts`](../lib/compliance/soc2-control-mapping.ts) — CC6/CC7 code mapping
- [`docs/audit-compliance-era140-setup.md`](./audit-compliance-era140-setup.md) — audit trail wiring
