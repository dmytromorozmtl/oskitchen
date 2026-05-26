# Catering Quote — Versioning & Revisions

## Why

Catering proposals change frequently between draft and acceptance —
sometimes after the client has already seen the original. Disputes can
hinge on "what was sent". A version snapshot answers that question.

## How

- Server action `snapshotCateringQuoteVersionAction` (called from
  the "Save version" button on the detail page) snapshots:
  - the canonical `CateringQuote` row
  - all `CateringQuoteItem` lines
  - all `CateringQuotePackage` rows
- The snapshot is stored as JSON in
  `CateringQuoteVersion.snapshotJson` with a monotonically-increasing
  `versionNumber` per quote.
- An audit event `QUOTE_VERSION_SAVED` is written.

## When to snapshot

- Manually, before any risky edit (price change, line change, event
  date change).
- The UI surfaces the last 20 versions on the detail page.

## Revisions

`NEEDS_REVISION` is a real status (extended in this project). It can
transition to `DRAFT/READY_TO_SEND/SENT` etc. via the status buttons.
No automatic restore is implemented — the snapshots are evidence, not
a CRUD interface.
