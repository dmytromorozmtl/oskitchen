# Packing verify integration

## Existing module

`/dashboard/packing/verify` — **token lookup unchanged** at the database query (`publicLookupToken` or order id for tenant user). Added: **QC sessions**, line checklist, scan log, QR camera, customer search, supervisor override, send-back to packing.

Legacy **`PackingEvent`** quick actions still post from the verify page where shown.

## Command center hooks

- Buttons to **Open packing verify** on task rows and verification tab.
- `updatePackingTaskStatusAction` with status `VERIFIED` inserts `PackingVerificationEvent` (`action: TASK_VERIFIED`, `metadataJson` source) — **still the task-tab audit**; do not confuse with `packing_qc_events`.

## Next

- Pass `publicLookupToken` into packing DTO for deep links (optional).
- Mirror verify failures back onto `PackingBatch.verificationStatus = FAILED`.
- Tighten RBAC on QC actions; wave/route session entrypoints.
