# Competitor battle cards — 21 one-page index

**Policy:** `competitor-battle-cards-p1-85-v1`  
**Framework:** WIN-TRAP-REDIRECT  
**Parent:** [`competitive-battle-cards.md`](./competitive-battle-cards.md) (eight core + supplementary)  
**Training:** [`/trust/forbidden-claims-training`](/trust/forbidden-claims-training) — pass ≥8/10 before customer calls

Twenty-one one-page battle cards for sales discovery, demo prep, and competitive deals. **verify** Integration Health and smoke artifacts before LIVE claims. OS Kitchen is **not affiliated** with any competitor listed.

---

## Index (21 competitors)

| # | Competitor | Card | Path |
|---|------------|------|------|
| 1 | Toast | BC01 | [`docs/competitor-battle-cards/toast.md`](./competitor-battle-cards/toast.md) |
| 2 | Square | BC02 | [`docs/competitor-battle-cards/square.md`](./competitor-battle-cards/square.md) |
| 3 | Lightspeed | BC03 | [`docs/competitor-battle-cards/lightspeed.md`](./competitor-battle-cards/lightspeed.md) |
| 4 | Poster | BC04 | [`docs/competitor-battle-cards/poster.md`](./competitor-battle-cards/poster.md) |
| 5 | Clover | BC05 | [`docs/competitor-battle-cards/clover.md`](./competitor-battle-cards/clover.md) |
| 6 | TouchBistro | BC06 | [`docs/competitor-battle-cards/touchbistro.md`](./competitor-battle-cards/touchbistro.md) |
| 7 | Revel | BC07 | [`docs/competitor-battle-cards/revel.md`](./competitor-battle-cards/revel.md) |
| 8 | Oracle MICROS | BC08 | [`docs/competitor-battle-cards/oracle_micros.md`](./competitor-battle-cards/oracle_micros.md) |
| 9 | NCR Aloha | BC09 | [`docs/competitor-battle-cards/ncr_aloha.md`](./competitor-battle-cards/ncr_aloha.md) |
| 10 | SpotOn | BC10 | [`docs/competitor-battle-cards/spoton.md`](./competitor-battle-cards/spoton.md) |
| 11 | Olo | BC11 | [`docs/competitor-battle-cards/olo.md`](./competitor-battle-cards/olo.md) |
| 12 | ChowNow | BC12 | [`docs/competitor-battle-cards/chownow.md`](./competitor-battle-cards/chownow.md) |
| 13 | 7shifts | BC13 | [`docs/competitor-battle-cards/7shifts.md`](./competitor-battle-cards/7shifts.md) |
| 14 | Homebase | BC14 | [`docs/competitor-battle-cards/homebase.md`](./competitor-battle-cards/homebase.md) |
| 15 | QuickBooks | BC15 | [`docs/competitor-battle-cards/quickbooks.md`](./competitor-battle-cards/quickbooks.md) |
| 16 | DoorDash | BC16 | [`docs/competitor-battle-cards/doordash.md`](./competitor-battle-cards/doordash.md) |
| 17 | Uber Eats | BC17 | [`docs/competitor-battle-cards/uber_eats.md`](./competitor-battle-cards/uber_eats.md) |
| 18 | Shopify | BC18 | [`docs/competitor-battle-cards/shopify.md`](./competitor-battle-cards/shopify.md) |
| 19 | WooCommerce | BC19 | [`docs/competitor-battle-cards/woocommerce.md`](./competitor-battle-cards/woocommerce.md) |
| 20 | MarketMan | BC20 | [`docs/competitor-battle-cards/marketman.md`](./competitor-battle-cards/marketman.md) |
| 21 | MarginEdge | BC21 | [`docs/competitor-battle-cards/marginedge.md`](./competitor-battle-cards/marginedge.md) |

---

## When to use

| Moment | Action |
|--------|--------|
| Prospect names incumbent | Open matching one-pager + `/compare` route |
| RFP shortlist | Attach honest comparison — acknowledge where competitor **wins** |
| Aggregator / ecommerce | BC16–BC19 + Integration Health screen-share |
| Inventory / invoice objection | BC20 MarketMan · BC21 MarginEdge |

---

## Claims gate

```bash
npm run audit:competitor-battle-cards-p1-85
npm run test:ci:competitor-battle-cards-p1-85
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

Never claim market parity where smoke artifacts show SKIPPED. **BETA** labels stay visible — **typical** pilot requires staging proof.
