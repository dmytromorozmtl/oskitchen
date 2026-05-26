# Commercial MVP Checklist

| # | Requirement | Status |
|---|-------------|--------|
| 1 | User can register + session | Existing |
| 2 | Adaptive onboarding | Existing (prior work) |
| 3 | Create manual order | Existing |
| 4 | Order detail operational view | **Added** `/dashboard/orders/[orderId]` |
| 5 | Production + packing surfaces | Existing |
| 6 | CRM customer profile | Existing + alias path |
| 7 | Sales channel connections w/o leaking secrets | **Added** connection detail |
| 8 | Support ticket | Existing |
| 9 | Billing safe w/o Stripe | Existing gates |
| 10 | Notifications safe w/o provider | Existing |
| 11 | Audit trail readable | Activity timeline + audit pages |
| 12 | Platform admin isolated | `requirePlatformAccess` |
| 13 | Founder email full access | `workspace.moroz@gmail.com` invariant |
| 14 | `npm run typecheck` + `npm run build` | Passing |

## Not claimed as MVP-complete

- Full FoodOps transition enforcement on every mutation path (planner shipped; wiring incremental)
- Realtime hub
- Automated alert entity
