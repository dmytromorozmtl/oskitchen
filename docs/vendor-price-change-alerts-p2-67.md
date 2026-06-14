# Vendor price change alerts — MarginEdge parity (P2-67)

**Policy:** `vendor-price-change-alerts-p2-67-v1`  
**Route:** `/dashboard/inventory/vendor-price-alerts`  
**Gap:** P2-67 — auto-alert when supplier price changes

## Overview

OS Kitchen detects supplier unit cost changes from `SupplierPriceHistory` and surfaces **auto-alerts** when changes exceed a configurable threshold — comparable to MarginEdge price change notifications, without claiming certified parity.

## Flow

1. **Price history ingest** — invoice OCR, bulk price editor, receiving events write `oldUnitCost` / `newUnitCost`
2. **Change detection** — compare previous vs new unit cost per ingredient + supplier
3. **Threshold filter** — default 5% minimum change to trigger alert
4. **Alert digest** — summary of increases, decreases, severity, suppliers affected

## Alert capabilities

| Capability | Behavior |
|------------|----------|
| `detect_price_increase` | Flag when new price > previous |
| `detect_price_decrease` | Flag when new price < previous |
| `threshold_pct_alert` | Only alert when \|change\| ≥ threshold |
| `supplier_scoped_alert` | Filter alerts by supplier name |
| `ingredient_scoped_alert` | Filter alerts by ingredient ID |
| `effective_date_tracking` | Show date price took effect |
| `severity_classification` | low (&lt;10%), medium (10–20%), high (≥20%) |
| `alert_digest` | Aggregate counts and averages |

## Benchmark corpus

**12 scenarios** covering 100% of alert capabilities.

Run: `npm run check:vendor-price-change-alerts-p2-67`

## Honesty

- Alerts are **directional** from recorded price history — verify before re-costing menus
- Demo fixture shown when no live price history exists
- Does not push email/SMS notifications yet — dashboard alerts only

## Wiring

- `lib/inventory/vendor-price-change-alerts-p2-67-builder.ts`
- `services/inventory/vendor-price-change-alerts-p2-67-service.ts`
- `services/purchasing/supplier-price-history-service.ts`
- `services/purchasing/bulk-price-service.ts`
- `components/inventory/vendor-price-change-alerts-panel.tsx`
