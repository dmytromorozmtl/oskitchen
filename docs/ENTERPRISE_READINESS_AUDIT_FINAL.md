# KitchenOS — Enterprise Readiness Audit (Final Pass)

**Scope:** Post “Market Ready / Connected Flow” state — additive enterprise layer (reliability, multi-location, RBAC/approvals, automation, analytics, CRM lifecycle, go-live, developer contracts, trust, performance).  
**Rules:** No rebuild; no fake integrations; `workspace.moroz@gmail.com` / `lib/platform-owner.ts` founder path unchanged; `/platform` remains server-gated.

---

## 1. Multi-location / multi-brand

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Data model | `Workspace`, `Organization`, `Brand`, `Location` exist; many entities carry `brandId` / `locationId` | Consistent scoping + rollups | Filters not universal across all dashboards | Wrong decisions from mixed-scope data | Finish `lib/org`, `lib/brand`, `lib/location` adoption in report queries | **P1** |
| UX | Locations & brands admin exist | Global filter + badges everywhere | Single-workspace flows dominate | Ops confusion in multi-site | Location/brand chips on Orders, Production, Analytics | **P2** |

---

## 2. Platform admin

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Access | `requirePlatformAccess` + permission set | Strict separation from tenant users | Relies on DB roles + founder bootstrap | Privilege creep | Quarterly access review checklist (`access-review-service`) | **P1** |
| Health | `/platform/system-health`, `/platform/health` | Unified SLO + incident linkage | Partially stubbed historically | Blind spots during demos | Implemented rollup on `/platform/health` + `/platform/errors` | **P1** |

---

## 3. Integration observability

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Webhooks | `WebhookEvent` with `processingError`, `signatureValid` | Typed failure analytics | Pending count ≠ failure | Mis-prioritized triage | Label “queued” separately from “errors” (done in Error recovery copy) | **P2** |
| Cross-tenant | Platform snapshot counts | Drill-down by workspace | New `/platform/errors` lists recent failures | Noise for large fleets | Pagination + filters next | **P2** |

---

## 4. Webhook replay safety

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Replay | UI honest about missing server actions (`IntegrationActionButton`) | Idempotent replay + approval | No universal replay API | Double charges / duplicate orders | Wire replay to audited server action + `SensitiveAction.WEBHOOK_REPLAY` approval | **P0** |

---

## 5. Error recovery

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Workspace hub | `/dashboard/error-recovery` aggregates counts | Single pane + next action | No inline resolution | Slower MTTR | Link to observability events card on System health | **P2** |

---

## 6. Audit logs & timelines

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Audit | `AuditLog` rich model + retention policy table | Coverage map per module | Coverage uneven across mutations | Forensics gaps | `audit-retention-service` + module audit checklist in trust doc | **P2** |

---

## 7. RBAC

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Staff | `StaffRoleType`, custom roles, capability helpers in places | Server-side enforcement everywhere | Some routes UI-gated only | Privilege escalation | Map routes to `permission-matrix` capabilities | **P0** |

---

## 8. Approval workflows

| Item | Current state | Enterprise expectation | Gap | Risk | Required fix | Pri |
|------|---------------|------------------------|-----|------|--------------|-----|
| Policy | `GoLiveApproval`, purchasing approvals exist | General sensitive-action approvals | No unified `ApprovalRequest` table | Inconsistent governance | `approval-service` policy engine + future Prisma model | **P1** |

---

## 9–14. Operational workflows (order / POS / production / packing / routing)

| Area | Current state | Gap | Pri |
|------|---------------|-----|-----|
| Order lifecycle | `order-lifecycle-service`, command center | Stuck-state detector not centralized | **P2** |
| POS | `pos-service`, shifts | Enterprise cash controls + variance approvals partial | **P1** |
| Production / packing | Tasks + boards | SLA breach automation rules incomplete | **P2** |
| Routing | Routes module | Predictive route risk is stub (`route-risk-service`) | **P3** |

---

## 15–18. Inventory / costing / analytics / forecasting

| Item | Notes | Pri |
|------|-------|-----|
| Inventory | Shortage readiness service exists | **P2** |
| Costing / AvT | Actual vs theoretical path exists | **P2** |
| Analytics | Executive overview + filters mature | **P2** |
| Forecasting | Deterministic + optional AI; labor/route stubs documented | **P3** |

---

## 19–22. Support / implementation / marketing / demo

| Item | Notes | Pri |
|------|-------|-----|
| Support | Tickets + platform inbox | SLA automation partial | **P2** |
| Implementation | Readiness + go-live engines | Needs cross-module owners | **P2** |
| Marketing | Public pages — avoid overstated compliance | Trust doc | **P1** |
| Demo | Demo seed/reset audited | Must stay clearly labeled | **P1** |

---

## 23–26. Data integrity / performance / mobile / tablet

| Item | Notes | Pri |
|------|-------|-----|
| Integrity | `/dashboard/system-health/data-integrity` | Expand checks | **P2** |
| Performance | Large Prisma surfaces | Pagination + snapshot tables | **P1** |
| Mobile / tablet | Responsive dashboards | Field workflows vary | **P3** |

---

## Summary priority stack

- **P0:** Webhook replay idempotency + server-side RBAC parity on sensitive mutations.  
- **P1:** Platform health honesty + multi-scope reporting + approval persistence design.  
- **P2:** Automation noise reduction, performance hardening, operational SLAs.  
- **P3:** Advanced forecasting + mobile-first role UX.

---

## Code references (this pass)

- Observability: `services/observability/*`, `lib/observability/*`, `/platform/health`, `/platform/errors`, `/platform/jobs`, `/platform/incidents`, dashboard `system-health`.  
- Scopes: `lib/org/org-scope.ts`, `lib/location/location-scope.ts`, `lib/brand/brand-scope.ts`.  
- RBAC matrix: `lib/permissions/permission-matrix.ts` + `approval-service`.  
- Founder invariant: `lib/platform-owner.ts` (unchanged).
