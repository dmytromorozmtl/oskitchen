# Forbidden claims training — Sales & GTM

**Version:** 1.0 · **June 2026  
**Audience:** Sales, solutions engineering, customer success, founders on demo calls  
**Policy:** `era17-pilot-forbidden-claims-enforcement-v1`  
**Registry:** [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`config/marketing/claims-registry.json`](../config/marketing/claims-registry.json)  
**Marketing copy (short):** [`marketing/forbidden-claims-training.md`](../marketing/forbidden-claims-training.md)

---

## Learning objectives

After this training you can:

1. Classify claims as **YES**, **ONLY_WITH_CAVEAT**, **ILLUSTRATIVE**, or **NO**
2. Explain why **SKIPPED ≠ PASS** for integrations and P0 smokes
3. Demo Integration Health without hiding BETA / SKIPPED rows
4. Pass the quarterly certification quiz (≥8/10)

**Constitution:** PASS > SKIPPED > FAIL. Never describe a SKIPPED smoke or missing vault secret as production-ready.

---

## Module 1 — Why forbidden claims exist

OS Kitchen has **801 routes** and deep engineering surface. Buyers hear "unified platform" and assume Toast-class parity on hardware, LIVE DoorDash, and enterprise SSO. Our **honesty moat** is Integration Health UI — but only if reps **leave banners visible**.

| Risk | Example | Consequence |
|------|---------|-------------|
| Over-promise | "DoorDash orders flow live today" | Pilot failure, churn, legal |
| Blanket GA | "Production-ready for every module" | Contract dispute |
| SKIPPED as PASS | "WooCommerce is certified" while artifact SKIPPED | Trust loss at technical validation |
| Hype | "Untouchable AI moat" | CI failure + investor credibility |

---

## Module 2 — Verdict vocabulary

| Verdict | Say in deck? | Demo rule |
|---------|:------------:|-----------|
| **YES** | Headline OK | Show feature; no hide |
| **ONLY_WITH_CAVEAT** | With BETA/Preview badge | Open Integration Health or maturity label |
| **ILLUSTRATIVE** | Footnote only | "Internal estimate — not customer proof" |
| **NO** | Never | Redirect to roadmap / design partner program |

**Engineering shipped ≠ sales-safe.** Use `salesSafeFeatures` in competitor tracker, not raw feature flags.

---

## Module 3 — Forbidden claims (never sell)

From `PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_FORBIDDEN_SALES_CLAIMS`:

| Forbidden claim | Safe alternative |
|-----------------|------------------|
| Production SSO / enterprise SSO included | "SSO pilot foundation — staging proof required per workspace" |
| SOC 2 Type II certified / SCIM production | "Security posture doc available — compliance roadmap, not certified today" |
| Unified cross-channel inventory | "POS inventory depletion when recipes configured; storefront ledger separate" |
| Unified rewards / gift cards across channels | "Channel-specific ledgers until unified era ships" |
| Offline POS ready / production offline card | "Offline queue is engineering preview — not rush-hour certified" |
| Rush-hour KDS certified / production SLO | "KDS refreshes on interval; show connection bar honestly" |
| Live marketplace integrations (DoorDash/Uber/Grubhub LIVE) | "7 BETA + 1 PLACEHOLDER — screen-share Integration Health" |
| Public API SLA | "Partner API preview — scope per contract, no SLA until proof artifact" |

**Hype terms (CI-blocked):** `untouchable`, `unbreakable moat`, `100% accurate`, `always correct`, `perfect predictions`, `guaranteed loan approval`.

**Replace differentiation with:** "Seven proprietary AI modules in production — each at qualified maturity; pilot proof in progress."

---

## Module 4 — Safe demo talk track

**Open:**
> "OS Kitchen unifies storefront, POS, production, and B2B marketplace in one OS — with honest BETA labels and Integration Health. We're pre-scale on paid pilots and LIVE partner proof."

**Integrations question:**
> "Let me screen-share Integration Health — green is configured, PASS is smoke artifact, SKIPPED means we haven't run live proof with your credentials yet."

**Toast comparison:**
> "Toast wins install base and hardware. We win unified order-to-fulfillment depth and software-first POS — if pilot proof lands."

**Pre-demo checklist (5 min):**

1. Review `artifacts/pilot-gono-go-summary.json` — if `NO-GO`, say so upfront
2. Open `/dashboard/integration-health` — do not dismiss P0 / SKIPPED banners
3. Confirm `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` on release branch
4. Use only `verified` rows in `claims-registry.json`
5. Frame ROI as **estimates**, not case studies (0 signed LOI June 2026)

---

## Module 5 — CI gates (engineering backup)

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
npm run smoke:pilot-forbidden-claims-enforcement
npm run test:ci:forbidden-claims-enforcement
```

FAIL blocks release-branch GTM copy updates. Sales must not publish deck changes while `verify-claims` is red on `main`.

---

## Certification quiz (10 questions)

**Pass threshold:** 8/10 correct. Record score in sales ops tracker.

### Questions

1. **A prospect asks:** "Is DoorDash live?" The smoke artifact shows `SKIPPED`. What do you say?
   - A) "Yes, we integrate with DoorDash."
   - B) "DoorDash is BETA — engineering certification path; live ingest verified only after staging smoke PASS with your credentials."
   - C) "Same as Toast — fully live."

2. **Which verdict allows a headline without qualification?**
   - A) ONLY_WITH_CAVEAT
   - B) YES
   - C) ILLUSTRATIVE

3. **Integration Health shows SKIPPED for WooCommerce. You should:**
   - A) Refresh until green before sharing screen
   - B) Leave SKIPPED visible and explain what proof is missing
   - C) Skip integrations in the demo

4. **"Unified inventory across POS and storefront" is:**
   - A) YES — safe headline
   - B) FORBIDDEN — use POS-only depletion language
   - C) OK if you add "coming soon"

5. **Before updating outbound email sequences, you must:**
   - A) Get verbal founder approval only
   - B) Ensure `verify-claims` passes on the release branch
   - C) Copy competitor websites

6. **0 LIVE integrations (June 2026) means:**
   - A) Do not say "production-ready integrations"
   - B) OK to say "all channels live" in enterprise decks
   - C) Hide Integration Health page

7. **AI differentiation safe line:**
   - A) "Perfect predictions every shift"
   - B) "Seven AI modules in production — each at qualified maturity"
   - C) "Untouchable moat vs Toast"

8. **Offline POS claim:**
   - A) "Production-ready offline card payments"
   - B) "Offline queue preview — not rush-hour certified"
   - C) "Works exactly like Square offline"

9. **Pilot GO/NO-GO shows NO-GO. On a discovery call you:**
   - A) Say "production-ready platform"
   - B) Disclose pilot proof gaps and scope design partner program honestly
   - C) Promise SSO by end of quarter

10. **SOC 2 Type II in a proposal:**
    - A) Allowed if customer requires it
    - B) FORBIDDEN — not certified; offer security posture doc
    - C) OK in footer only

### Answer key

| # | Answer | Rationale |
|---|--------|-----------|
| 1 | **B** | SKIPPED ≠ PASS; BETA + proof path |
| 2 | **B** | YES only without caveat |
| 3 | **B** | Honesty moat — never hide SKIPPED |
| 4 | **B** | Locked dual-ledger policy |
| 5 | **B** | CI gate before GTM copy |
| 6 | **A** | 0 LIVE per integration registry |
| 7 | **B** | Qualified AI line from registry |
| 8 | **B** | Offline preview only |
| 9 | **B** | NO-GO honesty |
| 10 | **B** | Forbidden enterprise claim |

---

## Certification record

Complete after quiz ≥8/10.

| Field | Value |
|-------|-------|
| Name | |
| Role | Sales / Solutions / CS / Founder |
| Date | |
| Quiz score | /10 |
| Release branch verified | `main` / `release/*` |
| `verify-claims` run date | |
| Certifier (Founder or Sales lead) | |

**I certify that I will:**

- [ ] Not use forbidden claims in decks, email, or live calls
- [ ] Leave Integration Health SKIPPED/BETA rows visible in demos
- [ ] Escalate unclear claims to [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) + legal
- [ ] Re-certify quarterly or after any `verify-claims` failure on `main`

**Signature:** _________________________ **Date:** _____________

---

## Re-certification triggers

| Event | Action |
|-------|--------|
| First customer demo each quarter | Re-read Module 3 + retake quiz |
| `verify-claims` fails on `main` | Stop deck edits; retake after engineering fix |
| New integration promoted BETA→LIVE | Read updated registry section only |
| Before LOI / pilot contract | Founder sign-off + `smoke:pilot-forbidden-claims-enforcement` |

---

## Escalation

| Situation | Contact |
|-----------|---------|
| Claim not in registry | Engineering + update `claims-registry.json` |
| Legal / compliance wording | Legal — do not improvise |
| Prospect needs proof timeline | Ops ticket — no date on call |
| CI failure on your deck PR | Fix copy or add safe qualifier within 200 chars |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) | Full YES/NO matrix |
| [`ai-honesty-policy.md`](./ai-honesty-policy.md) | AI module wording |
| [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) | LIVE vs BETA |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | GO/NO-GO process |
| [`trust/page`](./trust/page) | BETA/PREVIEW/SKIPPED (when shipped) |

---

## Changelog

| Date | Cycle | Change |
|------|-------|--------|
| 2026-06-03 | 27 (MKT-01) | Canonical docs training + 10-question quiz + certification |
