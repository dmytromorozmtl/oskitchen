# Critical path audit (KitchenOS)

This audit ties the **five commercial pillars** to persistence, permissions, and operator UX. Prisma `OrderStatus` remains the **write model**; FoodOps stages in `lib/orders/*` are the **read/UX model**.

| Area | Current behavior | Operational risk | Persona | Fix shipped this pass | Priority |
|------|------------------|------------------|---------|-------------------------|----------|
| Order creation | `createOrder` + limits | Missing menu / limits blocks capture | Owner | Existing guards | P1 |
| Order statuses | Enum + `updateOrderStatus` guards + audit | Invalid hops confuse kitchen | Manager | Extended blockers + lifecycle view on detail | P1 |
| Order hub | Lists internal + external rows | Hard to triage at scale | Ops | **Tabs + filters** + deep links to order detail | P1 |
| Order detail | Rich tabs + blockers + pipeline | Raw DB feel | All ops roles | **Tabs**, lifecycle badges, blocker cards | P1 |
| Product mapping | Matching engine + services | Unmapped SKUs break imports | Channel admin | **Rules module** + hub banner | P1 |
| Production handoff | Work items + enum `PREPARING` | Not auto-synced to FoodOps stage | Kitchen | Stage derived from work item states | P2 |
| Packing handoff | Packing tasks | Same as production | Packer | Blockers + tab | P2 |
| Route handoff | Delivery stops | Missing stops blocks delivery UX | Driver | Blocker `ROUTE_NOT_ASSIGNED` | P2 |
| Today dashboard | KPIs + blockers | Signal noise | Manager | **Extra KPIs** + calmer empty state | P1 |
| Support inbox | Workspace + platform views | Split brain | CS + Platform | **Platform service APIs restored** | P0 |
| Platform workspace admin | Detail page | Incomplete narrative | Platform | `platformGetWorkspace` + copy cleanup | P1 |
| Permissions | `requirePlatformAccess` / workspace auth | Tenant bleed | Security | No change to guards; services stay server-only | P0 |
| Activity timelines | `listActivityForEntity` | Gaps on new entities | Compliance | Order detail still wired | P2 |
| Audit logs | Central `auditLog` | Platform tail missing | Security | **`listPlatformAuditTail`** | P0 |
| Notifications | Provider optional | Silent failures | Owner | Not expanded this pass | P2 |
| Data integrity | Integrity service + Today link | False positives | Ops | Count feeds Today KPI | P2 |

### Priority legend
- **P0** — blocks safe operations or compliance reads.
- **P1** — blocks credible commercial MVP demos.
- **P2** — polish / depth / automation.
- **P3** — post-MVP expansion.

Honest gap: full **intent-based** transitions (`HOLD`, granular packing→ready) still need dedicated mutations beyond Prisma enum hops — see `lib/orders/order-lifecycle-guards.ts` for current mapping.
