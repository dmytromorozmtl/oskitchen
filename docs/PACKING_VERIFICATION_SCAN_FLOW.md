# Packing verification scan flow

## Happy path (order)

1. **Scan or paste** token (QR component decodes camera; manual field sends `source=MANUAL` or `CAMERA`).
2. **Resolve** — `lookupOrderByPackTokenAction` matches `publicLookupToken` or order `id` for current workspace user.
3. **Log scan** — `recordPackingScan` writes success/failure (token type `ORDER_PUBLIC_TOKEN` / `ORDER_ID` / `UNKNOWN`).
4. **Load UI** — Order summary, allergens, legacy `PackingEvent` quick buttons (optional), staff QR for re-open.
5. **Start session** — `startVerificationSessionAction` creates `PackingVerificationSession` + `PackingVerificationItem` rows from order lines (and packing context when present).
6. **Verify lines** — Increment qty, full verify, allergen/label check actions → `PackingQcEvent`.
7. **Complete** — Pass / partial / fail → session terminal status + packing task / order updates as implemented in service.

## Fallbacks

- **Invalid token** — User message + failed `PackingScanEvent`.
- **Camera denied** — UI error string from fullscreen/QR region; manual tab always available.
- **Scanner unavailable** — Library load failure → manual lookup only.

## URL deep link

Staff QR and shared links may use `/dashboard/packing/verify?t=<publicLookupToken>`. Client should read `searchParams` where implemented on the page (token prefill).

## Token types (scan log)

`VerificationTokenType` in `verification-types.ts` includes placeholders for `WAVE_ID` / `ROUTE_ID` for future resolvers; lookup today resolves **order** tokens.
