# Bulk mapping actions

The Bulk tab (`/dashboard/product-mapping/bulk`) is the only place
the workbench offers multi-row actions. Three actions are supported:

- **Bulk approve** — `bulkApproveSafeAction` →
  `services/product-mapping/product-mapping-service.ts::bulkApproveSafe`.
- **Bulk ignore** — sets status `IGNORED`.
- **Bulk archive** — sets status `ARCHIVED`.

## Bulk approve safety

`bulkApproveSafe` consults `isBulkApprovable(confidenceLabel)` for
each row. Approval is allowed only when:

1. `confidenceLabel ∈ { EXACT_SKU, EXACT_TITLE, HIGH }`, **and**
2. `internalProductId` is not null, **and**
3. The row is not already APPROVED / CONFIRMED.

Rows that fail any of those tests are skipped and reported back in
`outcome.notes`. The UI shows a single summary line; the service
returns counts for `approved` and `skipped` plus per-row notes.

## Bulk preview

The Bulk page presents a preview table:

| Column | Source |
|--------|--------|
| Checkbox | Enabled only when `bulkEligible === true`. |
| External title | `ProductMapping.externalTitle`. |
| Candidate | `internalProduct.title` (or "—"). |
| Confidence | `confidenceLabel`. |
| Bulk-eligible | `isBulkApprovable && hasCandidate`. |

The "Select bulk-eligible" button selects every row in the table that
is eligible. There is no path to mass-approve `MEDIUM` rows, even
when an internal product is attached.

## Audit

Each bulk operation writes one `ProductMappingEvent` per row with
`eventType = "BULK_APPLIED"` and metadata
`{ action: "approve" | "ignore" | "archive", confidence }`.
