# SOP library

SOPs (Standard Operating Procedures) live in the `SOPDocument` model and
flow through `DRAFT → ACTIVE → ARCHIVED`.

## Categories

`SOPCategory`:

`KITCHEN_PREP`, `FOOD_SAFETY`, `ALLERGEN_HANDLING`, `PACKING`, `DELIVERY`,
`CUSTOMER_SERVICE`, `OPENING`, `CLOSING`, `CLEANING`, `INVENTORY`,
`EMERGENCIES`, `CATERING`, `CASH_HANDLING`, `EQUIPMENT_MAINTENANCE`, `OTHER`.

## Features

- **Versioning.** `slug` + `version` are unique per workspace; bump version
  to publish a revision.
- **Languages.** `language` is one of `EN`, `FR`, `ES`, `DE`.
- **Acknowledgements.** `requiresAcknowledgement` (default `true`) gates
  staff against unread SOPs. `SOPAcknowledgement` records the staff member,
  timestamp, and optional notes.
- **Attachments.** `attachmentUrl` / `videoUrl` for PDF or video assets.
- **Brand / location scoping.** `brandId` and `locationId` filters for
  franchise or single-location SOPs.
- **Printable.** `renderSopAsText` in `lib/training/sop-engine.ts` emits a
  printable plain-text version.

## Lifecycle

| Action | Service | Event |
|--------|---------|-------|
| Create draft | `createSop` | `SOP_CREATED` |
| Publish | `publishSop` | `SOP_PUBLISHED` |
| Archive | `archiveSop` | `SOP_ARCHIVED` |
| Acknowledge | `acknowledgeSop` | `SOP_ACKNOWLEDGED` |

Only `ACTIVE` SOPs accept acknowledgements; the service rejects writes to
`DRAFT` or `ARCHIVED` SOPs.
