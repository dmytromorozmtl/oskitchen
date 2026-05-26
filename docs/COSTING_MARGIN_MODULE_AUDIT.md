# Costing & margin module audit

**Scope:** `/dashboard/costing` and related services, Prisma models, purchasing/demand touchpoints.  
**Date:** 2026-05-07 (KitchenOS)

## Executive summary

The module evolved from a **single-table `CostSnapshot` history** with a **hard-coded 60% margin badge** into a **profitability command center**: `CostingRun` + `ProfitabilityLine` (rich per-item rows), `CostComponent` audit lines, configurable **kitchen JSON settings** + optional **`MarginRule`**, **`ChannelFeeRule`**, packaging rules, labor rates, price scenarios, and a **shared costing service** used by recalculation. Legacy `CostSnapshot` rows are **still written** (now optionally linked to `costingRunId`) so existing exports and history are preserved.

---

## 1. `/dashboard/costing` route

| Issue | Current state | Why limiting | Affected modes | Recommended fix | Priority |
|-------|---------------|--------------|----------------|-----------------|----------|
| Single-page UX | Was one page + table | Operators could not drill into menus, fees, or settings | All | Layout + subnav + dedicated tabs | **P0** (done) |
| Hard-coded 60% | Was only threshold | Wrong for bars, catering, ghost kitchens | Bar, catering, delivery-heavy | `costingSettingsJson` + `MarginRule` | **P0** (done) |
| No scenario workspace | N/A | Could not answer “what if” questions | All | `/dashboard/costing/scenarios` + JSON store | **P1** (baseline done) |

---

## 2. Recipe costing logic

| Issue | Current state | Why limiting | Affected | Fix | Pri |
|-------|---------------|--------------|----------|-----|-----|
| Yield / waste | Recipe yield + line waste % | Bad yield breaks unit cost | Bakery, batch | Validate yield in UI + warnings (partial) | P1 |
| Unit conversion | `Ingredient.conversionJson` not applied in engine | Cross-unit errors | Multi-unit ops | Explicit conversion layer in engine | P1 |
| Labor single rate | First `LaborRate` or settings default | Multi-station labor invisible | Restaurant, catering | Role-based mapping per recipe | P2 |

---

## 3. Margin snapshot model

| Issue | Current state | Why limiting | Fix | Pri |
|-------|---------------|--------------|-----|-----|
| Narrow columns | `CostSnapshot` only ing/labor/pack | No channel/payment/overhead | `ProfitabilityLine` holds full stack | P0 (done) |
| History growth | Append-only snapshots | Storage / noise | Retention policy + “latest run” UI | P2 |

---

## 4. Ingredient cost source

| Issue | Current state | Why limiting | Fix | Pri |
|-------|---------------|--------------|-----|-----|
| Card vs supplier | Latest `SupplierPriceHistory` per ingredient when present | Stale cards | Purchasing discipline + recalc prompts | P1 (partial) |
| Multi-supplier | First history row wins in recalc order | Suboptimal buy | Tie to active `SupplierItem` | P2 |

---

## 5. Labor / packaging

| Issue | Current state | Fix | Pri |
|-------|---------------|-----|-----|
| Labor | `LaborRate` table + $/min fallback | Done | P1 |
| Packaging | Recipe field + `ProductPackagingRule` | Done | P1 |

---

## 6. Margin warning threshold

| Issue | Current state | Fix | Pri |
|-------|---------------|-----|-----|
| Fixed 60% | Removed | Kitchen defaults + `MarginRule` | P0 |

---

## 7. Relation to menu items / recipes

| Issue | Current state | Fix | Pri |
|-------|---------------|-----|-----|
| Items w/o recipe | Listed on **Recipes missing** | Link to catalog | P1 |

---

## 8. Purchasing price history

| Issue | Current state | Fix | Pri |
|-------|---------------|-----|-----|
| Signal use | Used when costing runs | Surface “price changed” alerts | P1 |

---

## 9. Ingredient demand / menus / channels / reports

| Issue | Current state | Fix | Pri |
|-------|---------------|-----|-----|
| Demand | Same ingredients; demand has its own engine | Cross-link “expected spend” widget | P2 |
| Menus | Rollup from `ProfitabilityLine.menuId` | Menu tab | P1 |
| Channels | User-configured `ChannelFeeRule` only | Docs + settings | P1 |
| Reports | Links to reports + executive | Dedicated profitability export | P2 |

---

## 10. Empty states & copy

| Issue | Current state | Fix | Pri |
|-------|---------------|-----|-----|
| Generic empty | Replaced with mode-aware titles | Done | P1 |
| Legal | Disclaimers on-page | Done | P0 |

---

## 11. Data model gaps (remaining)

- Sales **volume**-weighted margin and P&amp;L (not only per-unit).
- **Tax-in-price** modes and jurisdiction rules.
- **Multi-currency** supplier history vs menu currency.
- **Versioned** margin rules (audit who changed).

---

## 12. Pricing risks

- Treating **estimates** as accounting truth (**mitigated** with copy + docs).
- **Partner fees** guessed without configuration (**mitigated**: user rules only).
- **Suggested prices** without competitive or regulatory context (**documented**).

---

## Priority legend

- **P0:** Profitability / trust risk  
- **P1:** High operator value  
- **P2:** Polish / scale  
- **P3:** Future research  
