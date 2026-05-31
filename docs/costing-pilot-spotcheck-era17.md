# Costing pilot spot check — recipe → margin report (Era 17)

**Policy:** `era17-costing-pilot-spotcheck-v1`  
**Status:** `pilot_menu_margin_spotcheck_documented` — fixture math unit-tested; staging manual QA optional  
**Permission:** `reports.read.financial` for recalculate + margin report  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`COSTING_REPORTS.md`](./COSTING_REPORTS.md)

Use this checklist before claiming costing/margin in pilot demos or contracts. OS Kitchen costing is **beta** — operational estimates, not accountant-certified.

---

## Purpose and honest scope

Pilot costing proof covers:

- Active recipes on menu items with ingredient costs
- Full recipe costing run → profitability lines
- Margin report export/view at `/dashboard/reports/margin_report`

**Not in pilot scope:** invoice reconciliation, multi-location consolidated costing, Lightspeed/Toast parity, or accountant sign-off.

---

## Formula chain (test-backed)

Source: `lib/costing/costing-pilot-menu-spotcheck-math.ts` · `services/costing/costing-service.ts`

```
ingredientCostPerUnit = sum(recipe ingredient lines with waste)
primeCostPerUnit      = ingredient + labor + packaging
totalCost             = prime + overhead + delivery + platform + payment fees
foodCostPct           = ingredientCostPerUnit / salePrice × 100
marginPct             = (salePrice - totalCost) / salePrice × 100
```

**UI quirk:** Margin report column **"Food cost"** displays `totalCost` from profitability lines — while **"Food cost %"** is ingredient-based. Do not confuse the two when spot-checking.

---

## Pilot menu fixture (engineering reference)

Deterministic fixture used in CI (`PILOT_MENU_SPOTCHECK_FIXTURE`):

| Recipe | Sale price | Expected food cost % | Expected margin % |
|--------|------------|----------------------|-------------------|
| Pilot Chicken Bowl | $12.00 | 17.5% | 55.4% |
| Pilot Veg Wrap | $9.50 | 13.9% | 67.4% |

Operators on staging should pick **their own** menu items — use the formulas above, not necessarily these exact numbers.

---

## Staging operator spot check

1. Log in as owner or user with **`reports.read.financial`**.
2. Ensure 2–3 pilot menu items have **active recipes** and ingredient cards with unit costs.
3. From **`/dashboard/costing`**, run **Recalculate costing**.
4. Open **`/dashboard/reports/margin_report`** (date range covering today).
5. Pick one recipe row:
   - Confirm **food cost %** ≈ ingredient cost ÷ selling price.
   - Confirm **margin %** ≈ (selling price − total cost) ÷ selling price.
6. If rows are missing — verify recipes are active and costing run completed without error.

Optional attestation env vars:

- `COSTING_PILOT_SPOTCHECK_OPERATOR_EMAIL`
- `COSTING_PILOT_SPOTCHECK_STAGING_URL`

---

## Safe pilot claims

- "Recipe costing and margin report are available on a **qualified beta** path."
- "Modeled food cost % and margin % help operators spot low-margin items."
- "Costing requires ingredient costs and active recipes — garbage in, garbage out."

---

## Forbidden claims

- Accountant-certified or audit-ready food cost
- Real-time margin across POS + storefront + marketplace without channel-specific proof
- Lightspeed/Toast costing parity
- Automated supplier invoice reconciliation in pilot

Enforcement: `npm run smoke:pilot-forbidden-claims-enforcement`

---

## Validation

```bash
npm run test:ci:costing-pilot-spotcheck-era17:cert
npm run test:ci:rbac-wave3
npm run smoke:costing-pilot-spotcheck
```

Review **`artifacts/costing-pilot-spotcheck-summary.json`** — `costingProofStatus` should be `spotcheck_documented_awaiting_staging_execution` until operator email is set.

---

## Pre-contract checklist

- [ ] At least one pilot menu item has recipe + ingredient costs
- [ ] Recalculate costing succeeds on staging
- [ ] Margin report shows expected rows
- [ ] Sales deck uses **qualified beta** wording
- [ ] No forbidden costing parity claims in contract
