# Incidents

## Model

`GoLiveIncident` rows record operational issues raised against a
launch project. Fields: `severity` (INFO/WARNING/MAJOR/CRITICAL),
`category` (one of 11 canonical categories), `status`
(OPEN/ACKNOWLEDGED/IN_PROGRESS/RESOLVED/CLOSED), `title`,
`description`, optional `resolution`, `assignedToId`,
`reportedById`, plus `acknowledgedAt` / `resolvedAt`.

## Categories

- `INTEGRATIONS` — channel sync, webhook delivery, POS connection
- `KITCHEN` — production, prep, kitchen flow
- `PACKING` — labels, verification, packing checklists
- `ROUTES` — driver/dispatch, route quality
- `STAFFING` — short-staffed, training gap, no-shows
- `PAYMENTS` — Stripe, refunds, taxes
- `STOREFRONT` — store outage, checkout error
- `ANALYTICS` — tracking missing/wrong
- `IMPORTS` — failed catalog or customer import
- `PERMISSIONS` — access mistakes
- `OTHER` — unclassified

## Lifecycle

1. **Create** — anyone with `go-live.incident.create` (kitchen lead,
   dispatcher, support admin, etc.) opens an incident.
2. **Acknowledge** — manager assigns and sets `ACKNOWLEDGED`. A
   `acknowledgedAt` timestamp is written.
3. **Work** — `IN_PROGRESS`. Updates are logged in the project events
   feed.
4. **Resolve** — manager sets `RESOLVED` + provides a resolution
   string. `resolvedAt` written.
5. **Close** — optional administrative closure.

Each transition writes a `INCIDENT_UPDATED` row to `GoLiveProjectEvent`.

## Surfacing

- The Command Center KPI grid shows unresolved incident count.
- The project detail page lists every incident with severity / status
  badges and a row action form for state updates.

## Permission matrix

| Capability | Roles |
|-----------|-------|
| `go-live.incident.create` | admin, manager, operations_lead, kitchen_lead, support_admin, integration_manager, implementation_manager, dispatcher |
| `go-live.incident.resolve` | admin, manager, operations_lead, support_admin |
| Superadmin | `workspace.moroz@gmail.com` bypass |
