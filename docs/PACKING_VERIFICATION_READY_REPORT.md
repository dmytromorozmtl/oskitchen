# Packing verification ready report

## What changed

- **Additive Prisma** models: `PackingVerificationSession`, `PackingVerificationItem`, `PackingQcEvent`, `PackingVerificationOverride`, `PackingScanEvent` (migration under `prisma/migrations/`).
- **Domain layer** in `lib/packing-verification/` and **service** `services/packing-verification/verification-service.ts`.
- **Server actions** `actions/packing-verification.ts` for QC lifecycle; legacy `actions/packing-verify.ts` extended with scan logging only.
- **UI** rebuilt as `PackingVerifyConsole` with tabs, QR (`html5-qrcode`), manual lookup, customer search, active session, issues/audit views, fullscreen.
- **Terminology** by `BusinessType` for page titles.

## Scan support

- Camera QR via dynamic-loaded `html5-qrcode` region.
- Embedded URL tokens parsed with `parseEmbeddedTokenFromQr`.
- Failed/success attempts in `packing_scan_events`.

## Manual lookup support

- Token / UUID field unchanged at the Prisma query level.
- Customer name search (`searchOrdersByCustomerAction`).

## Verification sessions

- Session + items created per order start; statuses and timeline in QC table.

## Item-level verification

- Quantities, statuses, allergen/label flags, notes; mapped QC events.

## Issue workflow

- Item-level issue statuses live.
- Send back to **packing** implemented; **production** hook reserved.

## Allergen / label checks

- Per-line actions + catalog-derived warnings; supervisor override with audit.

## Wave / route / event

- Schema and UI placeholders; bulk wave/route/event flows **next** (see audit P1).

## Audit trail

- `packing_qc_events` append-only narrative for QC.
- Legacy `PackingEvent` and `packing_verification_events` preserved.

## Permissions

- Session user required; supervisor override validation helper — **tighten role gates on actions** per permissions doc.

## Build status

- `npm run typecheck` — pass.
- `npm run build` — pass (existing unrelated ESLint warnings may still print).

## Remaining limitations

1. Manager role not in override allowlist yet.
2. No automated alerts to Packing & Labels on issue open.
3. Wave/route/event sessions not fully implemented.
4. Bag-specific token resolution not implemented.
5. Production send-back not implemented.

## Next recommendations

1. Add RBAC checks to every packing-verification action.
2. Implement wave/route session start + manifests.
3. Wire `SENT_BACK_PRODUCTION` to your production task queue.
4. Reporting dashboard (pass rate, override rate, mean verify time).
