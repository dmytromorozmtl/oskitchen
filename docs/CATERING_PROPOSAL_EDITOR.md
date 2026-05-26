# Catering Proposal Editor

Route: `/dashboard/catering-quotes/[quoteId]`

The editor surfaces every quote concern on a single scrollable page,
organised into cards:

1. **Header** — quote number, customer/company, event date, guests,
   status badge.
2. **Overview KPIs** — total, per-person price (if guest count > 0),
   margin estimate, line count.
3. **Status & actions** — buttons render only for allowed transitions
   (validated by `canTransitionQuoteStatus`). "Save version" snapshots
   the current state to `CateringQuoteVersion`.
4. **Public proposal link** — copy/open the public link, rotate it
   (issues a new token), or revoke it (rotates to a `revoked-…` token
   the public route refuses).
5. **Lines & packages** — list of `CateringQuoteItem` rows with
   inline remove; add-line form supports title, line type, quantity,
   unit, unit price.
6. **Quote details** — full editable form for customer, event, service
   style, fees, dietary/allergy notes, internal/client notes, valid
   until.
7. **Convert to order** — runs `previewQuoteConversion` and renders any
   blocking errors / warnings; the button is disabled when the preview
   isn't ready.
8. **Operational handoff** — pre-computed flags from
   `workflowsForEvent()` (delivery, setup, staffing, packing,
   production).
9. **Follow-ups** — list + create form (datetime-local input).
10. **Activity & versions** — last 12 audit events and any saved
    versions.

## Security

- Cost estimates and margin estimates are visible **only** in the
  dashboard editor; they are stripped from the public proposal payload.
- All actions are protected by `requireSessionUser()`; ownership is
  enforced server-side via `quote.userId === user.id`.
