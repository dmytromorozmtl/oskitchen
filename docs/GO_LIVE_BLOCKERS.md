# Launch blockers

## Severity

| Severity | Effect |
|----------|--------|
| `CRITICAL` | Forces project status to BLOCKED. Cannot move to APPROVED or LIVE without superadmin override. |
| `HIGH_RISK` | Counted in risk scoring; does not gate APPROVED but increases risk level. |
| `WARNING` | Shown in the UI but does not block. |
| `INFO` | Informational. |

## Detected blockers

| Key | Severity | Stage | When it fires |
|-----|----------|-------|---------------|
| `no_active_menu` | CRITICAL | CATALOG_SETUP | No menu or zero products |
| `no_billing` | CRITICAL | FINANCIAL_VALIDATION | Subscription is not configured |
| `broken_channel` | CRITICAL | CHANNEL_INTEGRATIONS | Any connection in `ERROR` / `NEEDS_AUTH` |
| `no_production_validation` | CRITICAL | PRODUCTION_VALIDATION | Zero `ProductionBatch` rows |
| `unmapped_products` | CRITICAL | CATALOG_SETUP | Unmapped + connected channel(s) |
| `no_staff_roles` | CRITICAL | STAFF_TRAINING | No active `StaffMember` |
| `packing_not_validated` | CRITICAL | PACKING_VALIDATION | Packing tasks exist but no verification session |
| `analytics_missing` | HIGH_RISK | FINANCIAL_VALIDATION | No `UsageEvent` events |
| `no_backup` | HIGH_RISK | FINANCIAL_VALIDATION | No backup export recorded |
| `no_routes` | HIGH_RISK | DELIVERY_VALIDATION | Channels connected but zero `DeliveryRoute` |
| `unmapped_no_channel` | WARNING | CATALOG_SETUP | Unmapped queue with no channels connected |
| `webhooks_unhealthy` | HIGH_RISK | CHANNEL_INTEGRATIONS | Connections OK but broken |
| `approvals_missing` | CRITICAL | FULL_GO_LIVE | Required approvals outstanding |

## Resolution contract

Every blocker has:

- `title` — short headline
- `impact` — operational impact statement
- `resolution` — concrete next step
- `actionRoute` — deep link to the responsible module
- `detail` (optional) — counts / IDs to help triage

The UI renders the resolution and a CTA to the action route. Operators
never need to leave the Command Center to understand what to fix.

## Override

A user with the `go-live.unlock` capability (currently only the
workspace admin or the platform superadmin
`workspace.moroz@gmail.com`) can pass `override=true` to
`transitionLaunchStatusAction`. This writes a `STATUS_TRANSITION` event
with `metadata.override = true` so the audit trail makes the
exception visible.
