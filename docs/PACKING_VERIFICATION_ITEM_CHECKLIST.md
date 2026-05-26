# Packing verification item checklist

## Data model

Each checklist row is a `PackingVerificationItem`:

- Links: `sessionId`, optional `orderItemId`, `packingTaskId`, `productId`.
- Counts: `expectedQuantity`, `verifiedQuantity`.
- Safety: `allergenCheckStatus`, `labelCheckStatus` (string fields for flexibility).
- Lifecycle: `status`, `notes`, `verifiedById`, `verifiedAt`.

## Server actions (representative)

Defined in `actions/packing-verification.ts`:

- `verifyItemFullQuantityAction` — set verified qty to expected, mark verified, default-pass allergen/label if still pending.
- `incrementVerifiedQuantityAction` — +1 with cap at expected.
- `setVerificationItemStatusAction` — missing / wrong / damaged / extra / substituted.
- `markAllergenCheckedAction` / `markLabelCheckedAction` — explicit safety confirmations.
- `completeVerificationSessionAction` — pass | partial | fail.

Each mutation writes a `PackingQcEvent` via `updateVerificationItem` or completion transaction.

## UI expectations

- Large tap targets per line: verify full, +1, issue shortcuts, allergen/label toggles.
- Color/status from `verification-status.ts` (`itemStatusTone`, `ITEM_STATUS_LABEL`).

## Business disclaimer

Allergen and nutrition data are copied from catalog configuration. **Final compliance is the operator’s responsibility** — see `PACKING_VERIFICATION_ALLERGEN_LABEL_CHECKS.md`.
