# Channel simulation mode

`/dashboard/sales-channels/simulator` creates **MANUAL** import batches with synthetic Woo-shaped payloads. Scenarios: `unmatched_product`, `duplicate_order`, `missing_fulfillment`.

## Safety
No outbound partner traffic; no credential use. Labels use `simulation@example.invalid` domains.
