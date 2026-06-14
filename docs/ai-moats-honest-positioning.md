# AI moats — honest positioning (7 modules)

**Policy:** `ai-moats-honest-positioning-v1`  
**Status:** sales + GTM safe wording for proprietary AI modules  
**Updated:** 2026-06-02  
**Tracker:** [`artifacts/ai-moats-tracker.json`](../artifacts/ai-moats-tracker.json) — **22/22 engineering tasks done**

**Headline (safe):** **7 proprietary AI modules in production** — each at qualified maturity; not all LIVE for every workflow or tenant.

Do not describe OS Kitchen as autonomous AGI, guaranteed margin improvement, or live computer vision without per-module evidence below.

---

## Summary table

| # | Module | UI (primary) | What it actually does | Maturity | Honest limit |
|---|--------|--------------|----------------------|----------|--------------|
| 1 | **AI Restaurant Brain** | `/dashboard/today` | Deterministic daily briefing from hub/KDS/inventory signals | pilot_ready | Not LLM magic — rules + structured data |
| 2 | **Digital Twin** | `/dashboard/analytics/digital-twin` | Station simulation from orders + config | BETA | Simulation model — not a physical digital twin |
| 3 | **Universal Menu Engine** | `/dashboard/menu/universal` | Cross-channel menu structure + sync hooks | BETA | Channel sync per integration maturity |
| 4 | **Food Cost AI** | `/dashboard/analytics/food-cost` | Recipe costing, margin alerts from ledger data | pilot_ready | Requires accurate recipes/yields |
| 5 | **AI Purchasing** | `/dashboard/inventory/purchasing-ai` | EOQ-style reorder suggestions + approval gate | BETA | Deterministic math — buyer approves POs |
| 6 | **Kitchen Camera AI** | `/dashboard/kitchen/cameras` | Camera-ready station view + detection module slots | BETA / preview | **Synthetic by default** — see kitchen camera doc |
| 7 | **Benchmark Network** | `/dashboard/analytics/benchmarks` | Anonymized cohort comparisons | BETA | Needs cohort N>1; illustrative until mass |

Engineering source of truth: [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)

---

## 1 — AI Restaurant Brain

**Modules (tracker):** `ai-briefing-engine`, `ai-briefing-ui`, `predictive-alerts`, `briefing-delivery`

| Safe claim | Detail |
|------------|--------|
| Owner Daily Briefing on Today Command Center | `services/ai/ai-restaurant-brain.ts` → `generateDailyBriefing` |
| Predictive alerts from operational signals | `services/ai/predictive-alerts.ts` — threshold-based |
| Optional email/SMS delivery | `services/ai/briefing-delivery.ts` — Resend/Twilio env-gated |

**Do not claim:** Autonomous manager replacing staff; guaranteed revenue lift; sent without operator review when delivery disabled.

**Demo:** Show briefing strip on `/dashboard/today`; note deterministic sections and NO-GO banners when pilot artifacts say so.

---

## 2 — Digital Twin

**Modules:** `digital-twin-engine`, `digital-twin-ui`, `real-time-twin`

| Safe claim | Detail |
|------------|--------|
| Station load simulation from live order flow | `services/ai/digital-twin.ts`, `real-time-twin.ts` |
| What-if style capacity view for ops planning | UI at `/dashboard/analytics/digital-twin` |

**Do not claim:** Real-time mirror of physical kitchen layout; IoT sensor fusion; certified capacity planning for rush hour.

---

## 3 — Universal Menu Engine

**Modules:** `universal-menu-core`, `menu-channel-sync`, `menu-management-ui`

| Safe claim | Detail |
|------------|--------|
| Single menu model mapped to channels | Universal menu services + management UI |
| Sync paths for qualified channels | Woo/Shopify/storefront — **BETA** per channel registry |

**Do not claim:** Bidirectional sync at scale for all marketplaces; unified inventory depletion across channels.

---

## 4 — Food Cost AI

**Modules:** `food-cost-engine`, `food-cost-alerts`, `food-cost-ui`

| Safe claim | Detail |
|------------|--------|
| Recipe-based food cost and margin views | `services/ai/food-cost-ai.ts` |
| Alerts when margins drift | `food-cost-alerts.ts` |

**Do not claim:** Automatic invoice OCR perfection; guaranteed waste reduction % without customer baseline.

---

## 5 — AI Purchasing

**Modules:** `ai-purchasing-engine`, `ai-purchasing-ui`, `purchasing-automation`

| Safe claim | Detail |
|------------|--------|
| Reorder recommendations from usage signals | `services/ai/ai-purchasing.ts` — EOQ-style |
| Approval gate before PO creation | `purchasing-automation.ts` — human in the loop |

**Do not claim:** Fully autonomous procurement; vendor negotiation; marketplace auto-buy without buyer sign-off.

---

## 6 — Kitchen Camera AI

**Modules:** `kitchen-camera-framework`, `camera-alerts-dashboard`, `camera-twin-integration`

Full positioning: [`kitchen-camera-honest-positioning.md`](./kitchen-camera-honest-positioning.md)

| Safe claim | Detail |
|------------|--------|
| Camera-ready platform with configurable detection modules | Registry + module framework shipped |
| Preview mode with honesty banner | `KITCHEN_CAMERA_SYNTHETIC`, `KitchenCameraPreviewBanner` |

**Do not claim:** Live AI vision on all stations; food safety compliance automation.

---

## 7 — Benchmark Network

**Modules:** `benchmark-engine`, `benchmark-ui`, `benchmark-network-effects`

| Safe claim | Detail |
|------------|--------|
| Anonymized benchmark comparisons when cohort exists | `services/ai/benchmark-network.ts` |
| Network effects improve as more operators opt in | Privacy-preserving aggregates — **early cohort** |

**Do not claim:** Industry-wide definitive rankings; investor-grade benchmark proof at N=1.

---

## Cross-cutting honesty rules

1. **Engineering done ≠ sales LIVE** — tracker 22/22 means code shipped; pilot GO/NO-GO still **NO-GO** until staging proof + LOI ([`pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json)).
2. **Deterministic first** — most modules use rules, structured DB signals, and math — not opaque LLM outputs for core ops.
3. **Optional OpenAI** — Copilot/chat may use models when configured; Restaurant Brain briefing is not dependent on GPT for core path.
4. **Show SKIPPED** — Integration Health and Today briefing surfaces SKIPPED staging proof honestly in demos.
5. **Qualified wording** — prefer "pilot_ready", "BETA", "preview", "deterministic", and **AI-assisted** over unqualified autonomy claims.

---

## Safe umbrella claims

| Claim | When OK |
|-------|---------|
| "7 proprietary AI modules in production" | Engineering tracker complete; qualify per module maturity |
| "AI-assisted operations hub" | Demo shows Today + at least one moat with honest labels |
| "Deterministic daily briefing" | Restaurant Brain on `/dashboard/today` |
| "Human-in-the-loop purchasing recommendations" | AI Purchasing with approval gate visible |

---

## Forbidden umbrella claims

| Forbidden | Use instead |
|-----------|-------------|
| "Untouchable" / unbeatable AI moat | 7 proprietary AI modules in production (qualified) |
| "Fully autonomous restaurant AI" | Module-specific deterministic assists |
| "Guaranteed margin / waste / labor savings" | Illustrative ROI — not customer proof until pilot metrics captured |
| "Live computer vision everywhere" | Kitchen camera preview mode doc |
| "Production-certified AI for all tenants" | Per-module matrix + signed pilot scope |

Run: `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before decks and landing updates.

**Public page:** [`/ai`](/ai) — MKT-17 honest positioning surface for sales and security reviewers.

---

## Module → service map (engineering)

| Moat | Key services |
|------|--------------|
| Restaurant Brain | `services/ai/ai-restaurant-brain.ts`, `briefing-delivery.ts`, `predictive-alerts.ts` |
| Digital Twin | `services/ai/digital-twin.ts`, `real-time-twin.ts` |
| Universal Menu | menu universal + channel sync services |
| Food Cost AI | `services/ai/food-cost-ai.ts`, `food-cost-alerts.ts` |
| AI Purchasing | `services/ai/ai-purchasing.ts`, `purchasing-automation.ts` |
| Kitchen Camera | `services/ai/kitchen-camera.ts` |
| Benchmark Network | `services/ai/benchmark-network.ts` |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`kitchen-camera-honest-positioning.md`](./kitchen-camera-honest-positioning.md) | Moat #6 deep dive |
| [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) | vs Toast/Square (Task 20) |
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Exhibit A module scope |
| [`marketing/forbidden-claims-training.md`](../marketing/forbidden-claims-training.md) | Pre-demo checklist |
