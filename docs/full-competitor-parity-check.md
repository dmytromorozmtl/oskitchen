# Full competitor parity check — 21 competitors

**Policy:** `absolute-final-competitor-parity-21-v1`  
**Cert test:** `tests/unit/absolute-final-competitor-parity-check.test.ts`  
**Absolute Final Task 150** — consolidates battle cards (8), sales-safe claims (8/8), gap matrix, and honest comparison into one parity ledger.

---

## Parity status legend

| Status | Meaning |
|--------|---------|
| **PARITY** | Feature-equivalent for pilot scope — verified in staging or pilot |
| **PARTIAL** | Scaffold/BETA shipped — competitor still wins on depth or market proof |
| **DEFER** | Competitor wins — no near-term leapfrog claim |
| **LIVE** | Integration webhook or API proven in production smoke |

**Manual gate:** Parity matrix is sales-safe strategy — not certified feature equivalence. Verify **LIVE** status against integration smoke artifacts before customer claims.

---

## 21-competitor parity matrix

Source: full audit battle map (June 2026) reconciled with [`competitor-feature-gap-matrix.md`](./competitor-feature-gap-matrix.md) and [`competitive-battle-cards.md`](./competitive-battle-cards.md).

| Competitor | slug | OS Kitchen edge | Gap (competitor wins) | Status |
|------------|------|-----------------|----------------------|--------|
| Toast | `toast` | Integration health moat | Hardware ecosystem | PARTIAL |
| Square | `square` | Marketplace 3-sided | Brand recognition | PARTIAL |
| Lightspeed | `lightspeed` | Enterprise SSO/SCIM | Regional POS depth | PARTIAL |
| Poster | `poster` | 10/10 gaps closed | Poster EU presence | PARTIAL |
| Clover | `clover` | AI managers suite | Device fleet | PARTIAL |
| TouchBistro | `touchbistro` | Full-stack OS | iPad-native polish | PARTIAL |
| Revel | `revel` | Commissary OS | Legacy migrations | PARTIAL |
| Oracle MICROS | `oracle_micros` | Modern UX | Enterprise incumbency | PARTIAL |
| NCR Aloha | `ncr_aloha` | KDS multi-station | Installed base | PARTIAL |
| SpotOn | `spoton` | Quick Start | Local sales force | PARTIAL |
| Olo | `olo` | Digital ordering | Dispatch network | PARTIAL |
| ChowNow | `chownow` | Storefront | Marketplace | PARTIAL |
| 7shifts | `7shifts` | Native scheduling | Standalone HR brand | PARTIAL |
| Homebase | `homebase` | Integration LIVE | Labor-only focus | LIVE |
| QuickBooks | `quickbooks` | Accounting sync | GL depth | PARTIAL |
| DoorDash | `doordash` | LIVE webhook | Aggregator dependency | LIVE |
| Uber Eats | `uber_eats` | LIVE webhook | Commission economics | LIVE |
| Shopify | `shopify` | Channel sync | Non-F&B | PARTIAL |
| WooCommerce | `woocommerce` | Channel sync | Plugin fragility | PARTIAL |
| MarketMan | `marketman` | Inventory | Breadth | PARTIAL |
| MarginEdge | `marginedge` | Invoice AI | Platform breadth | PARTIAL |

**Totals:** 21 competitors · 3 LIVE · 18 PARTIAL · 0 unmapped

---

## Upstream competitor artifacts

| Artifact | Scope |
|----------|-------|
| [`competitive-battle-cards.md`](./competitive-battle-cards.md) | 8 core battle cards (Toast → Olo) |
| [`competitor-battle-cards-index.md`](./competitor-battle-cards-index.md) | 21 one-page battle cards (P1-85) |
| [`artifacts/competitor-feature-tracker.json`](../artifacts/competitor-feature-tracker.json) | 8/8 sales-safe claims + engineering ledger |
| [`competitor-feature-gap-matrix.md`](./competitor-feature-gap-matrix.md) | Era 17 evidence-aligned gap matrix |
| [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) | Head-to-head honesty profiles |
| [`COMPETITOR_POSITIONING.md`](./COMPETITOR_POSITIONING.md) | Category positioning narrative |

---

## Forbidden parity claims

Do **not** publish without new proof artifacts:

- Toast/Square **hardware parity** or terminal ecosystem equivalence
- **Full competitor parity** for any row marked **PARTIAL** without **BETA** label
- **LIVE** delivery dispatch parity with Olo/DoorDash native apps
- **Enterprise SOC2 Type II** or certified Oracle MICROS deployment
- **Replace [competitor]** or **Toast-class** language in sales decks

Validation: `npm run test:ci:competitor-parity-absolute-final:cert`
