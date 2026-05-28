# Inventory, Costing, And Purchasing Roadmap

Status: operational-finance roadmap from foundational inventory into dependable restaurant economics
Primary evidence: `actions/inventory.ts`, `actions/costing.ts`, `actions/purchasing.ts`, `services/inventory/`, `services/costing/`, `services/purchasing/`, `services/pos/pos-inventory-impact-service.ts`, `docs/system-reality-model.md`

## Goal
Make KitchenOS stronger than standalone inventory or costing tools by tying sales, menu structure, purchasing, margin, and operational behavior into one model.

## Capability Roadmap
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ingredients, units of measure, conversions | schema and inventory services exist | conversion rigor and operator UX need deeper proof | normalize unit/conversion entities where thin | conversion-safe inventory math services | ingredient and UOM admin flows | `inventory.manage`, `recipes.manage` | ingredient/UOM edits | unit conversion tests | inventory math uses correct units consistently |
| recipes, prep recipes, menu item recipes, modifier recipes | costing and recipe services exist | not all menu/modifier depletion is production-grade | recipe linkage for products/modifiers/prep | recipe resolver and depletion services | recipe management UI | `recipes.manage`, `products.manage` | recipe create/update audit | recipe math tests | menu sales can consume ingredients correctly |
| ingredient depletion on sale | **POS-only** (`era4-pos-only-v1`): POS applies recipe depletion when product has active recipe; otherwise impact stays `PENDING_CONFIGURATION`; storefront/API/manual do not deplete | storefront hook (payment timing + idempotency), modifier/sub-recipe expansion; operator diagnostics UI | depletion event/state rows where needed | extend `pos-recipe-depletion` to other channels after scoped design | pending vs applied impact visibility | `production.manage` (inventory mutations) | `inventory.pos_depletion_applied`, count completion audit | unit tests for math + POS depletion + `inventory-depletion-policy` | **POS sales** deplete inventory when recipes configured; do not claim all channels |
| theoretical usage, actual usage, variance | count and waste foundations exist | theoretical-versus-actual reporting is not yet flagship quality | variance snapshots and reconciliation entities as needed | variance computation services | variance dashboards and explainers | `inventory.read`, `analytics.view` | variance recalculation audit | variance tests | owner sees usable variance analysis |
| stock counts, adjustments, waste | count completion and waste logging update `currentStock`; POS impacts dashboard | dedicated `inventory.count` keys; variance dashboards | count cycle and adjustment reason structures | variance reporting services | count cycle UX and waste quick-actions | `production.manage` (interim) | `inventory.count_completed`, `inventory.waste_logged` | count, waste, impact summary tests | operators can count, waste, and see POS depletion status |
| transfers, commissary transfers | commissary surface exists | transfer workflows are not yet a flagship | transfer entities and status lifecycle | inter-location transfer services | transfer request/receive UI | `inventory.manage`, `locations.manage` | transfer audit events | transfer tests | multi-location inventory can move safely |
| receiving, vendors, purchase orders | PO and approval flows exist | receiving depth and vendor intelligence need maturity | receiving line/receipt state enhancements | receiving service and supplier history improvements | PO receiving and vendor views | `purchasing.manage`, `vendors.manage` | PO submit/approve/receive logs | PO approval/receiving tests | purchaser can create, approve, receive, and review POs |
| reorder points, low-stock alerts | foundational demand and reorder surfaces exist | confidence and routing need work | reorder policy metadata | alerting and reorder queue services | reorder queue UX | `inventory.manage`, `purchasing.manage` | alert threshold changes | reorder tests | owner sees clear reorder needs |
| supplier price history | purchasing foundations exist | not yet packaged as a strong operator insight | vendor price history records | price history service and anomaly detection | price trend panels | `vendors.manage`, `analytics.view` | supplier price changes | supplier price tests | purchaser can compare historical supplier prices |
| food cost %, gross margin, menu engineering, item profitability | costing service is real | cross-module trust and packaging still maturing | profitability snapshot models if needed | costing and menu engineering services | margin, alert, and menu engineering views | `costing.manage`, `financials.view` | costing run audit | costing and profitability tests | owner sees reliable margin and menu insights |
| forecast purchasing | forecast and purchasing surfaces exist separately | direct bridge between forecast and PO suggestions is partial | forecast-to-PO linkage | purchasing suggestion service | suggested PO UI | `purchasing.manage`, `analytics.view` | suggested reorder generation | forecast purchasing tests | purchaser can generate a PO from forecast guidance |
| multi-location inventory | workspace/brand/location model exists | scope consistency still active | scope normalization, transfer linkage | location-aware inventory query/service changes | location filters and rollups | `locations.manage`, `inventory.read` | scoped report audit | multi-location scope tests | multi-site inventory is properly scoped |

## Implementation Order
1. canonical permissions for counts, adjustments, purchasing, and costing
2. depletion and recipe linkage closure across POS/storefront/orders
3. receiving, supplier history, and reorder queue trust
4. variance and menu-engineering reporting
5. multi-location transfer and commissary depth
6. forecast-driven purchasing

## Acceptance Bar
- sales deplete inventory
- recipe costs calculate correctly
- owner sees margin
- purchaser can generate PO
- inventory reports export

## Product Guardrails
- Do not market inventory as production-certified until depletion, variance, and receiving are proven end-to-end.
- Tie every inventory/economics claim back to actual order flows, not stand-alone spreadsheets.
