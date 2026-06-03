# Series A narrative hold — internal notice

**Classification:** INTERNAL ONLY — founders, board, core team  
**Task:** MKT-10  
**Effective:** 2026-06-03 until first paid pilot converts  
**Supersedes for external use:** any Series A deck, investor email, or press implying fundraise readiness  
**Related:** [`series-a-narrative.md`](./series-a-narrative.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md)

---

## Hold summary

**Do not start, tease, or schedule a Series A fundraise process** until the release gates in §Unlock criteria are met.

| Field | Current value (June 2026) |
|-------|---------------------------|
| Signed LOI / paid pilots | **0** |
| LIVE integrations (registry) | **0** |
| P0 staging proof | **FAILED / SKIPPED** |
| `pilot-gono-go-summary.json` | **NO-GO** |
| Investor narrative ready | **false** |

**Approved external posture:** design partner LOI outreach, qualified beta pilots, seed extension / angel conversations framed as **runway to first pilot proof** — not Series A scale-up.

---

## What is frozen

| Activity | Status | Owner |
|----------|--------|-------|
| Series A pitch deck distribution | **HOLD** | Founder |
| VC partner meetings labeled "Series A" | **HOLD** | Founder |
| Data room for growth round | **HOLD** | Founder + Finance |
| Press / LinkedIn "raising Series A" | **HOLD** | Marketing |
| Series A KPI slides (ARR, NRR, logos) | **HOLD** — no fabricated metrics | Marketing |
| `ops-series-a-*` workflow theater as proof | **Do not cite as investor evidence** | Engineering |

**Still allowed:**

- Design partner LOI pipeline ([`loi-outreach-email.md`](./loi-outreach-email.md))
- Paid pilot SOW after ICP qualification ([`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md))
- Seed / angel bridge explicitly tied to **first pilot milestone**
- Internal narrative prep ([`series-a-narrative.md`](./series-a-narrative.md)) — draft only, not distributed

---

## Why the hold exists

1. **No customer proof** — 0 signed LOI, 0 paid pilots, 0 case studies with permission.
2. **No LIVE integration proof** — honest registry shows BETA/SKIPPED; Integration Health moat is pre-scale.
3. **P0 commercial gate open** — staging smokes and GO/NO-GO remain NO-GO; fundraising before proof repeats May 2026 audit findings.
4. **Forbidden claims risk** — Series A decks historically pressure teams to inflate SKIPPED → PASS, unified inventory, and enterprise SSO narratives.
5. **ICP focus** — company priority is **first design partner in 90 days**, not growth-round optics.

---

## Unlock criteria (all required before lifting hold)

Founder + board sign-off required. Partial credit does not lift the hold.

| Gate | Evidence | Target |
|------|----------|--------|
| **G1 — First pilot customer** | Countersigned LOI or paid pilot SOW; `customerName` + `loiSignedDate` in GO/NO-GO evidence | ≥1 |
| **G2 — Pilot GO sustained** | `artifacts/pilot-gono-go-summary.json` → GO or CONDITIONAL GO with documented warnings only | 4 consecutive weekly runs |
| **G3 — LIVE integration** | ≥1 channel LIVE per [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md); Integration Health PASS artifact | ≥1 |
| **G4 — Pilot KPI baseline** | `npm run smoke:pilot-metrics-baseline` — Week 2 vs Week 8 orders/day, checkout success | Documented in pilot report |
| **G5 — Claims CI clean** | `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` on any investor-facing doc | PASS |
| **G6 — Board resolution** | Written note: hold lifted; approved raise band and use of funds | 1 meeting min |

**Earliest credible Series A narrative:** after **3 paying pilots** with repeatable conversion playbook — see Gate C in [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md).

---

## Approved messaging while on hold

### Say

- "We're in **design partner / paid pilot** phase for ghost kitchen, commissary, and meal-prep operators."
- "Engineering surface is broad; **market proof is the current milestone**."
- "Integration Health shows PASS/SKIPPED honestly — ask us to screen-share it."
- "We're **not** raising a Series A today; we're proving pilot economics first."

### Do not say

- "Series A open" / "raising $X M" / "term sheet conversations"
- "Thousands of restaurants" / named logos without signed case study
- "Production-certified for all tenants" / "LIVE on DoorDash/Uber"
- "SOC 2 Type II" / "enterprise-ready day one"
- "Untouchable AI moat" / "Toast killer"

Enforcement: [`verify-claims.yml`](../.github/workflows/verify-claims.yml) · [`forbidden-claims-training.md`](./forbidden-claims-training.md)

---

## Comms routing

| Incoming | Route to | Response template |
|----------|----------|-------------------|
| VC inbound "Series A" | Founder | "Pre-scale on customers — happy to share pilot roadmap; not in market for Series A until first paid pilots convert." |
| Angel / seed bridge | Founder | "Bridge to first pilot proof — see LOI-DP-001 / pilot SKU on `/pricing`." |
| Press "funding round" | Founder only | Decline or "bootstrapped / pilot-focused" — no round size |
| Partner "co-marketing at scale" | Marketing | Defer until G1 + G3 |

---

## Internal review cadence

| When | Action |
|------|--------|
| Weekly (founder sync) | Re-check GO/NO-GO + LOI pipeline — still on hold? |
| On first LOI signed | Re-run GO/NO-GO; update hold notice status to **conditional** (G1 met, G2–G6 pending) |
| On first paid pilot Week 8 | Schedule board review against unlock table |
| On hold lift | Archive this doc with lift date; publish updated [`series-a-narrative.md`](./series-a-narrative.md) excerpt for data room |

---

## Document control

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-03 | MKT-10 — Initial hold until first pilot |

**Distribution:** Founders, board observers, VP Sales (read-only), VP Marketing (read-only). **Not** for customer-facing sites, decks, or public repo marketing without redaction review.

---

## Quick reference

```
HOLD:     Series A process
ALLOWED:  Design partner LOI · paid pilot · seed bridge to proof
UNLOCK:   G1 LOI/pilot → G2 GO/NO-GO → G3 LIVE → G4 KPIs → G5 claims → G6 board
SOURCE:   artifacts/pilot-gono-go-summary.json · Integration Health · LOI on file
```
