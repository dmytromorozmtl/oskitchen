# Era 20 Cycle 10 — Permission-denied pilot hubs

**Policy:** `era20-permission-denied-pilot-hubs-cycle10-v1` (`KOS-E20-010`)

## Surfaces wired

| Surface | Guard location |
|---------|----------------|
| `implementation_hub` | `app/dashboard/implementation/layout.tsx` |
| `staff_hub` | `app/dashboard/staff/layout.tsx` |
| `go_live_hub` | `app/dashboard/go-live/page.tsx` |
| `crm_customers` | `app/dashboard/customers/page.tsx` |
| `billing_hub` | `lib/billing/billing-page-access.tsx` |

Denied users route to **Today** (or safe secondary) — never back into sensitive data queries.

## P0

`awaiting_ops_credentials` — unchanged.
