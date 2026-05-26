# Product Excellence QA Matrix (1000)

## Personas

Owner, Manager, Cashier, Kitchen lead, Prep cook, Packer, Driver, Customer service, Accountant, Platform founder, Support admin, Billing admin, Developer admin, Demo viewer.

## Flows

| # | Flow | Pass criteria |
|---|------|----------------|
| 1 | First-run onboarding | Adaptive steps complete; skip safe; resume clear |
| 2 | Demo launch | `/demo` badges + `/dashboard/demo/scenarios` seed controls |
| 3 | Navigation | Core visible; staff cannot see owner-only internal links |
| 4 | POS sale | Sale completes; no console errors |
| 5 | Manual order | Creates row; appears in list |
| 6 | Imported order | Order hub surfaces channel row |
| 7 | Order detail | Opens; mobile actions usable |
| 8 | Product mapping | Empty state explains mapping |
| 9 | Production | Tasks visible post-order |
| 10 | Packing | Verify route reachable |
| 11 | Route | Assignment UI reachable |
| 12 | CRM | Customer list loads |
| 13 | Analytics | Executive filters work |
| 14 | Support | Ticket create |
| 15 | Settings | Workspace settings save |
| 16 | Platform admin | Non-platform user redirected from `/platform` |
| 17 | Public CTA | `/pricing` → `/demo` or book flow works |
| 18 | Error fallback | `normalizeUnknownError` never leaks secrets |
| 19 | Mobile/tablet | Today + POS usable at 390px width (smoke) |
| 20 | Changelog | `/changelog` renders static fallback offline-safe |

## Automation

- `npm run typecheck && npm run build && npm run lint && npm test` on CI.
