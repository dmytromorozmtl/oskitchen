# EU Data Residency Roadmap

<!-- design-polish: absolute-final-design-polish-tokens-v1 task-117 feature-87 -->

> **design-polish-hero-banner** · Internal roadmap — **no EU-dedicated production region today**
>
> US-primary hosting · ~15% readiness · Do **not** claim EU residency or GDPR certification until Phase 5 exit criteria pass.
>
> **design-polish-dark-mode-note:** Plain markdown tables and blockquotes — readable in GitHub light and dark themes without custom HTML colors.

**Status:** Internal roadmap — **no EU-dedicated production region today**  
**Audience:** Founder, engineering, ops, enterprise sales (EU/UK prospects)  
**Policy:** `eu-data-residency-roadmap-absolute-final-v1` (`lib/compliance/eu-data-residency-roadmap-absolute-final-policy.ts`)  
**Related:** [`soc2-roadmap-with-timeline.md`](./soc2-roadmap-with-timeline.md) · [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md) · [`ENTERPRISE_TRUST_COMPLIANCE_READINESS.md`](./ENTERPRISE_TRUST_COMPLIANCE_READINESS.md) · [`/trust`](/trust)

---

## Purpose

Single **quarter-by-quarter roadmap** for EU/EEA data residency options — from current US-primary hosting through optional EU-region deployment for enterprise buyers. This is **not** a certification or legal opinion; legal review required before any sales claim.

**Honesty rule:** Do **not** claim EU data residency, GDPR certification, or "data stays in the EU" until Phase 5 exit criteria pass and `/trust` is updated. Today all production tenants run on **US-primary** infrastructure unless explicitly documented otherwise in a signed enterprise addendum.

---

## Current posture · design-polish-status-card

| Dimension | Status | Notes |
|-----------|--------|-------|
| EU-dedicated region | **Not available** | Single Supabase + Vercel stack; default US regions |
| GDPR applicability | **Operator-dependent** | EU operators processing EU customer data need lawful basis + DPA |
| Cross-border transfers | **Standard Contractual Clauses (SCCs) via subprocessors** | Supabase, Vercel, Stripe, Resend — verify DPA/SCC status per vendor |
| Data subject requests | **Operator-assisted** | See `services/privacy/data-deletion-request-service.ts` |
| Enterprise blocker | **Yes** for RFPs requiring EU-only storage | **No** for meal-prep / ≤5-location pilots without residency clause |
| Readiness (directional) | **~15%** | Inventory started; no EU project fork |

---

## Timeline · design-polish-phase-timeline

| Phase | Window | Goal | Exit criteria |
|-------|--------|------|---------------|
| **Phase 0 — Inventory** | Jun–Jul 2026 (now) | Map PII categories + subprocessor regions | Data flow diagram; subprocessor region column on `/trust` draft |
| **Phase 1 — Legal foundation** | Aug–Sep 2026 | DPAs + SCCs + records of processing | Customer DPA template; ROPA draft; legal sign-off on subprocessors |
| **Phase 2 — Technical assessment** | Oct–Nov 2026 | EU hosting feasibility | Supabase EU region PoC; Vercel latency benchmarks; cost model |
| **Phase 3 — EU pilot architecture** | Q1 2027 | Dedicated EU stack for 1–2 design partners | Separate Supabase project (EU); env isolation documented; pilot SOW |
| **Phase 4 — Operational readiness** | Q2 2027 | EU backup, DR, support runbooks | EU restore drill logged; on-call runbook; incident template updated |
| **Phase 5 — General availability** | H2 2027 (target) | EU region SKU for enterprise | `/trust` updated; sales enablement; **only after production EU deploy** |

**Budget (indicative):** $5–15k/year incremental (EU Supabase project + dual-region ops) before enterprise revenue justifies full split. Revisit at first EU residency RFP.

---

## Gap analysis

| Area | Today | Gap | Phase 1 action |
|------|-------|-----|----------------|
| **Primary database region** | US (Supabase default) | No EU-primary Postgres option | Phase 2 PoC on Supabase EU (Frankfurt or London) |
| **Application hosting region** | US (Vercel) | Edge only — origin US | Document which routes hit US origin; evaluate Vercel region config |
| **Object storage / media** | Same as app DB path | No EU bucket policy | Inventory S3/Supabase storage paths in media upload flows |
| **Subprocessor cross-border transfers** | SCCs via vendor DPAs | Not collected in data room | Request Supabase, Vercel, Stripe, Resend, Sentry DPA + SCC addenda |
| **DSR workflow (access / delete / export)** | Partial — export CSV; delete operator-assisted | No self-serve EU DSR portal | Wire `data-export-service` + deletion SOP; 30-day SLA doc |
| **Encryption & key management** | App-level `ENCRYPTION_KEY`; provider TLS | No EU-specific key residency | Document key location; BYOK deferred to post-SOC2 |

### Priority backlog (P0 → P2)

| Priority | Item | Owner | Target |
|----------|------|-------|--------|
| **P0** | Subprocessor list with **processing region** column | Ops/Legal | Q3 2026 |
| **P0** | Customer DPA template (GDPR Art. 28) | Legal | Q3 2026 |
| **P0** | Do not claim EU residency in marketing or `/trust` | GTM | Immediate |
| **P1** | Data flow diagram (order, PII, payment, logs) | Eng | Q3 2026 |
| **P1** | Supabase EU region technical spike | Eng | Q4 2026 |
| **P1** | ROPA (record of processing activities) draft | Ops | Q4 2026 |
| **P2** | EU pilot environment (isolated project) | Eng | Q1 2027 |
| **P2** | EU restore drill + RPO/RTO for EU stack | Ops | Q2 2027 |

---

## Subprocessor data flows (directional)

| Subprocessor | Data types | Default region (indicative) | Residency note |
|--------------|------------|----------------------------|----------------|
| **Supabase** | Postgres — all tenant PII | US (verify project) | EU region available — not configured |
| **Vercel** | App hosting, logs, edge cache | US origin | Edge PoPs global; origin US |
| **Stripe** | Payment tokens, customer email | US + EU entities | Stripe IE for EU merchants — operator configures |
| **Resend** | Transactional email | US | Verify DPA |
| **Sentry** | Error payloads (may contain PII) | US | Scrub PII; optional EU hosting TBD |
| **OpenAI** (invoice/OCR) | Invoice images if enabled | US | BETA module — disclose in DPA |

Full list must match live `/trust` subprocessors table before enterprise questionnaires.

---

## Human gate checklist

Before answering EU residency or GDPR hosting questionnaires:

- [ ] Confirm **no EU-dedicated production region** unless Phase 5 complete
- [ ] Attach customer DPA + subprocessor list — **not** a "GDPR certified" badge
- [ ] Disqualify RFP if **EU-only storage required in pilot term** without Phase 3 SOW
- [ ] Log questionnaire in CRM with readiness % and target phase from timeline above
- [ ] Run `npm run test:ci:eu-data-residency-roadmap:cert` after roadmap updates
- [ ] Escalate Schrems III / transfer impact assessments to legal — not engineering alone

---

## Sales guidance

| Buyer ask | Safe response |
|-----------|---------------|
| "Is data stored in the EU?" | **Not by default today.** US-primary hosting. EU region on roadmap — indicative H2 2027; not a commitment. |
| "Are you GDPR compliant?" | **We provide GDPR-oriented tooling and DPA support** — compliance is shared with the operator (controller). We are not GDPR certified. |
| "Can we get an EU-only tenant?" | **Enterprise pilot** possible from Phase 3 (Q1 2027) subject to SOW and engineering capacity — not standard SKU today. |
| "What about Stripe?" | Card data stays with **Stripe**; configure Stripe account region per your entity. |
| "Cross-border transfers?" | Standard subprocessors; SCCs via vendor DPAs — details in DPA package. |

---

## Engineering wiring

| Capability | Residency relevance | Cert / doc |
|------------|---------------------|------------|
| Tenant isolation | Per-tenant scope — not per-region yet | `PLATFORM_SECURITY_TENANT_ISOLATION.md` |
| Data export | GDPR portability | `docs/data-export-era126-setup.md` |
| Deletion requests | GDPR erasure (assisted) | `services/privacy/data-deletion-request-service.ts` |
| Audit trail | Demonstrate access controls | `/dashboard/audit` |
| Forbidden claims | No false residency claims | `tests/unit/forbidden-claims-enforcement.test.ts` |

---

## References

- [`soc2-roadmap-with-timeline.md`](./soc2-roadmap-with-timeline.md) — parallel GRC program (Absolute Final #66)
- [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md) — vendor risk + CC mapping
- [`ENTERPRISE_TRUST_COMPLIANCE_READINESS.md`](./ENTERPRISE_TRUST_COMPLIANCE_READINESS.md) — trust posture summary
- [`regional-tax-compliance.md`](./regional-tax-compliance.md) — tax presets vs operator responsibility (Absolute Final #88)
- [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) — questionnaire templates
- [`forbidden-claims-training.md`](./forbidden-claims-training.md) — sales-safe language

---

## Reconsideration trigger

Schedule a **30-min GO/NO-GO review** when:

1. First **signed enterprise LOI** explicitly requires EU residency, or  
2. **3+ EU prospects** in pipeline with residency as hard requirement.

```bash
npm run test:ci:eu-data-residency-roadmap:cert
```

If decision is **GO** for Phase 3 pilot — create isolated Supabase EU project and document in execution log. If **NO-GO** — extend Phase 1 legal work only.
