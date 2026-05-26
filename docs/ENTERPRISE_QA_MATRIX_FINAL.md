# Enterprise QA Matrix (Final)

## Workspace archetypes

| Archetype | Must verify |
|-----------|-------------|
| Single-location café | Today triage, POS sale, pickup order |
| Meal prep | Preorder windows, production board, packing verify |
| Bakery | SKU modifiers (if any), costing read-only |
| Catering | Quotes + conversion, CRM consent |
| Ghost kitchen | Multi-channel imports + mapping |
| Multi-brand commissary | Brand + location filters on analytics |
| Platform internal | `/platform` never reachable without platform role |

## Roles

Owner, Manager, Cashier (map to POS operator), Kitchen lead, Packer, Driver, Customer service, Accountant, Platform founder, Support admin, Billing admin, Developer admin, Readonly auditor.

## Workflows (smoke)

1. Registration + onboarding by business mode.  
2. POS sale + shift close.  
3. Manual order.  
4. Imported order + mapping queue.  
5. Order lifecycle transitions.  
6. Production task completion.  
7. Packing verification.  
8. Delivery route assignment.  
9. Inventory demand signal.  
10. AvT report read path.  
11. Support ticket create/reply.  
12. Platform support reply (privileged).  
13. Impersonation with reason + audit.  
14. Webhook failure visible on System health / Error recovery / Platform errors.  
15. Automation failure visible on `/platform/automations`.  
16. Demo seed + reset with confirmation + audit.  
17. RBAC denial on staff for owner-only route.  
18. Approval policy evaluation (`approval-service`) for sensitive action (UI hook future).  
19. Data export placeholder surfaces honest status.  
20. Marketing pages contain no false certifications.  
21. Integration status panels remain honest when disconnected.  
22. No secret exposure in UI, network panel, or copied text from observability cards.  
23. `npm run typecheck` / `build` / `lint` / `test` green on CI.

## Pass / fail criteria

- **Fail** if any P0 item in `ENTERPRISE_READINESS_AUDIT_FINAL.md` regresses (checkout, payments, tenant isolation, founder access).  
- **Warn** if observability counts diverge >20% from raw SQL without explanation (documented backlog).
