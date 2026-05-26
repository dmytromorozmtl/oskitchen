# Packing verification QA checklist

Run after changes to verify, packing, or Prisma schema.

## Automated

- `npm run typecheck`
- `npm run build`

## Manual — legacy token

- [ ] Paste valid `publicLookupToken` → order loads, items listed.
- [ ] Paste invalid token → error, failed scan row (if UI lists recent scans).
- [ ] Order UUID lookup still works for same tenant.

## Manual — QR

- [ ] Grant camera → scan QR containing token or `?t=` URL → same as paste.
- [ ] Deny camera → error message, manual path still works.

## Manual — session

- [ ] Start verification session from loaded order.
- [ ] Resume open session from Active tab.
- [ ] Verify single line full quantity.
- [ ] Increment +1 until expected.
- [ ] Mark missing / wrong / damaged / extra / substituted.
- [ ] Mark allergen checked / label checked.

## Manual — completion

- [ ] Complete as **passed** when all lines verified → session terminal, tasks updated per rules.
- [ ] Complete **partial** / **fail** → appropriate session status.

## Manual — supervisor

- [ ] Override with reason as OWNER (or superadmin test account).
- [ ] Non-owner receives error when attempting override (once guards are strict).

## Manual — send back

- [ ] Send back to packing → tasks `QUEUED`, QC event present.

## Manual — customer search

- [ ] Two+ characters, results scoped to workspace.
- [ ] Select hit → load order path works.

## Manual — UX

- [ ] Fullscreen toggle on tablet-sized viewport.
- [ ] Tabs navigable without horizontal scroll trap.

## Regression

- [ ] Packing command center task verify still writes `packing_verification_events`.
- [ ] Order Hub order detail unchanged for unrelated flows.
- [ ] Production handoff screens unaffected.
