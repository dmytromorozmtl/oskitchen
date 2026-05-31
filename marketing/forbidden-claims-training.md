# Forbidden Claims Training — Sales & GTM

**Audience:** Sales, solutions, customer success, founders doing demos  
**Policy:** `era17-pilot-forbidden-claims-enforcement-v1`  
**Canonical engineering doc:** [`docs/sales-forbidden-claims-training-era20.md`](../docs/sales-forbidden-claims-training-era20.md)  
**Claims registry:** [`config/marketing/claims-registry.json`](../config/marketing/claims-registry.json)

---

## Why this matters

OS Kitchen has deep product surface area. It is easy to over-promise features that are **preview**, **SKIPPED**, or **awaiting pilot proof**. Forbidden-claims training protects buyers, legal, and engineering from demos that outrun evidence.

**Rule:** PASS > SKIPPED — never describe a SKIPPED smoke or missing vault secret as production-ready.

---

## Pre-demo checklist (5 minutes)

1. Run or review latest `artifacts/pilot-gono-go-summary.json` — if `decision: NO-GO`, say so.
2. Open `/dashboard/integration-health` — leave P0 / SKIPPED banners visible; do not refresh past them.
3. Confirm `npm run verify-claims` passes on the release branch you demo (strict mode when required).
4. Use only claims with `status: verified` in `config/marketing/claims-registry.json`.
5. Frame illustrative ROI as **estimates**, not customer proof.

---

## Never claim (forbidden)

| Claim | Why forbidden | Safe alternative |
|-------|---------------|------------------|
| Enterprise SSO live for all tenants | Pilot SSO only; tenant-scoped | "SSO pilot foundation for qualified workspace after staging proof" |
| SOC 2 certified / SCIM production | Not shipped | "Security review in progress — ask for current posture doc" |
| Unified inventory across POS + storefront | Locked policy — POS checkout only | "POS inventory impact path; storefront ledger separate" |
| Unified loyalty / gift cards across channels | Dual-ledger policy | "Channel-specific ledgers until unified era ships" |
| DoorDash / Uber Eats marketplace LIVE | Integrations preview / gated | "Channel roadmap — show Integration Health honesty rows" |
| POS hardware certified / proprietary terminals | Software-first POS | "Runs on tablets and browsers you already own" |
| Offline POS production-ready | Degraded mode only; no card offline | "Offline queue is engineering preview — not rush-hour certified" |
| Rush-hour KDS SLO / realtime certified | Polling fallback honest in UI | "KDS refreshes on interval; realtime not production SLO" |
| Public API SLA | No SLA until proof artifact | "Partner API preview — scope per contract" |
| "Production-ready platform" (blanket) | Requires matrix + pilot scope | "Pilot-ready modules per capability matrix and signed scope" |
| Paid customer references / case studies | Zero paid pilots at handoff | "Design partner conversations in progress" |
| Woo/Shopify live without smoke PASS | Needs vault + live smoke | "Engineering certification path — show SKIPPED reason if unset" |

**CI gate:** `npm run smoke:pilot-forbidden-claims-enforcement` and `npm run verify-claims`.

---

## Safe to demo (with honest UI)

- Owner Daily Briefing — shows NO-GO, vault blocked, SKIPPED child smokes when true
- Launch Wizard — setup narrative, not GO until artifacts say GO
- Integration Health Center — SKIPPED WITH REASON rows stay visible
- Order Hub, KDS, packing — pilot_ready surfaces with qualification language
- POS software terminal — not Stripe Terminal hardware certification
- Storefront preorder path — match capability matrix status

---

## Demo script rules

1. **Do not hide** Integration Health P0 banners or SKIPPED rows.
2. **Do not** toggle env vars or artifacts to green a demo.
3. If asked about a competitor feature we lack, use the gap matrix — do not invent parity.
4. Record prospect questions that need engineering proof; do not commit dates on the call.

---

## Contract & LOI language

Before signature:

- Set `PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT=1` only after legal review
- Pilot scope must reference [`docs/era20-first-paid-pilot-package-2026-05-28.md`](../docs/era20-first-paid-pilot-package-2026-05-28.md) or current package doc
- No blanket "all modules included" — list modules and maturity (preview / beta / ready)

---

## After P0 PASS only (still not blanket GA)

| Proof artifact | Allowed careful language |
|----------------|-------------------------|
| Channel live smoke PASS | "Engineering live ingest verified on staging for qualified channel" |
| SSO IdP staging PASS | "Pilot SSO foundation for one workspace / one IdP" |
| GO summary + signed LOI | "Paid pilot scope per contract exhibit — not GA for all tenants" |

---

## Escalation

- Unclear claim → check `config/marketing/claims-registry.json` and `docs/marketing/claims-governance.md`
- Legal review required → do not improvise on security, SLA, or compliance
- Engineering proof request → file ops ticket; do not promise timeline on the call

---

## Certification

Sales reps should re-read this doc:

- Before first customer demo each quarter
- After any `verify-claims` failure on `main`
- Before updating deck copy or outbound sequences
