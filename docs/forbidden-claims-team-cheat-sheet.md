# Forbidden claims — team cheat-sheet (SAFE · CAVEAT · не говорить)

**Headline:** Forbidden claims cheat-sheet — SAFE · CAVEAT · не говорить  
**Policy:** `forbidden-claims-cheat-sheet-p1-26-v1`  
**Updated:** 2026-06-13  
**Audience:** Sales, founders, CS, solutions — **print or pin before every demo**  
**Full training + quiz:** [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`/trust/forbidden-claims-training`](/trust/forbidden-claims-training) (≥8/10)

---

## One-line rule

**PASS > SKIPPED > FAIL** — SKIPPED ≠ PASS. Leave Integration Health BETA/SKIPPED rows visible. Never refresh past them.

---

## Verdict columns

| Column | Russian | When to use |
|--------|---------|-------------|
| **SAFE** | Можно говорить | Headline OK — still show honest UI |
| **CAVEAT** | Только с оговоркой | Say with BETA / SKIPPED / Preview badge + Integration Health |
| **NEVER** | **Не говорить** | FORBIDDEN — redirect to roadmap or design partner program |

Canonical machine-readable rows: `lib/marketing/forbidden-claims-cheat-sheet-content.ts` (20 entries).

---

## SAFE — можно говорить

| Topic | Say this |
|-------|----------|
| Integration Health Center | We show PASS, SKIPPED, or FAILED per channel — not fake green tiles. |
| KDS bump + expo | Native KDS — bump tickets from every configured channel into one kitchen screen. |
| Software-first POS | Browser and tablet POS — runs on hardware you already own. |
| AI modules (qualified) | Seven proprietary AI modules in production — each at qualified maturity. |
| Design partner program | Design partner program open — **0 signed founding customers today**; honest pilot scope. |

---

## CAVEAT — только с оговоркой

| Topic | Say this | Не говорить |
|-------|----------|-------------|
| DoorDash / Uber Eats | BETA or partner-gated — live ingest after staging smoke PASS with **your** credentials. | "DoorDash live today" / "same as Toast delivery" |
| Shopify / WooCommerce | Show smoke PASS or SKIPPED reason in Integration Health. | "Certified for everyone" / "LIVE without proof" |
| Webhook monitoring | Operational signals — not guaranteed uptime or SLA. | "99.9% integration SLA" |
| B2B marketplace | BETA — design-partner vendors on staging. | "Live national supplier network" |
| Public / partner API | Preview — scope per contract; no SLA until proof artifact. | "Enterprise API SLA" |
| Profit engine / P&L | Directional margin signals — not audited financials. | "GAAP-certified P&L" |
| 18 LIVE integrations | Verify PASS **per workspace** in Integration Health during trial. | "All 18 LIVE for every tenant" |

---

## NEVER — не говорить

| Topic | Safe redirect instead |
|-------|----------------------|
| Rush-hour KDS SLO | "KDS refreshes on interval — connection bar shows honest status." |
| Offline card payments | "Offline queue is engineering preview — not rush-hour certified." |
| Unified cross-channel inventory | "POS depletion when recipes configured; storefront ledger separate." |
| SOC 2 / SCIM / enterprise SSO | "Security posture doc — compliance roadmap, not certified today." |
| Perfect AI / 100% OCR | "Directional signals — confirm in your trial workspace." |
| Customer logos / case study KPIs | "Pilot conversations in progress — no KPI claims without signed LOI." |
| Blanket production-ready / GA | "Pilot-ready modules per capability matrix and signed scope." |
| Hype moat ("untouchable", "destroys Toast") | "Honest integration ops — prove in your pilot." |

**CI-blocked hype terms:** `untouchable`, `unbreakable moat`, `100% accurate`, `perfect predictions`, `guaranteed loan approval`.

---

## 60-second demo open (copy-paste)

> "OS Kitchen unifies storefront, POS, production, and marketplace in one OS — with honest BETA labels and Integration Health. We're recruiting design partners; **0 signed founding customers today**. Let me show Integration Health — green is configured, PASS is smoke proof, SKIPPED means we haven't run live proof with your credentials yet."

---

## Pre-demo checklist (30 sec)

1. Check `artifacts/pilot-gono-go-summary.json` — if NO-GO, say so upfront  
2. Open `/dashboard/integration-health` — **do not hide** SKIPPED rows  
3. `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` on release branch  
4. Pass quiz ≥8/10: [`/trust/forbidden-claims-training`](/trust/forbidden-claims-training)

---

## CI

```bash
npm run audit:forbidden-claims-training
npm run check:forbidden-claims-training
```

Policies: `forbidden-claims-cheat-sheet-p1-26-v1` + `forbidden-claims-training-p1-84-v1`
