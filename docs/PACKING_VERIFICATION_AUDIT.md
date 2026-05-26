# Packing verification audit

Audit of `/dashboard/packing/verify` and related flows as of the QC console rollout. Focus: token lookup, labels, packing tasks, orders, audit trails, permissions, and gaps.

## Current implementation (summary)

| Area | Current state |
|------|----------------|
| Route | `/dashboard/packing/verify` (server page loads business type, recent scans, open sessions). |
| Token lookup | `lookupOrderByPackTokenAction` — `publicLookupToken` or order UUID, scoped by `userId` (tenant). Success/failure logged to `PackingScanEvent` via `recordPackingScan`. |
| Guest token | Same token as labels/order detail; no extra admin fields exposed on public guest flows (verify is staff dashboard). |
| Labels | Lookup aligns with printed `publicLookupToken`; QR region can parse URL query `t=`. |
| Packing tasks | QC completion can set packing tasks to `VERIFIED` when session passes; send-back sets tasks `QUEUED` and clears `packedAt` / `verifiedAt`. |
| Order / items | Order lines hydrate verification items on session start; item row actions update `PackingVerificationItem` + `PackingQcEvent`. |
| Legacy task audit | `packing_verification_events` (task verification tab) **unchanged** — still written from command center paths. |
| New QC audit | `packing_qc_events` + session/item models — additive. |
| QR | `html5-qrcode` in `PackingVerifyQrRegion` (dynamic import); manual paste and order/customer lookup remain. |
| Tablet UX | Fullscreen toggle, large buttons, tabs (Scan / Manual / Active / Waves / Routes / Issues / Audit). |
| Business terminology | `verification-terminology.ts` maps `BusinessType` → page title/subtitle. |

## Issues and recommendations

### 1. Wave / route / event verification mostly UI shell

| Field | Detail |
|-------|--------|
| **Current state** | Tabs and types include `WAVE_VERIFY`, `ROUTE_VERIFY`, `EVENT_LOADOUT_VERIFY`; primary data path is **order** sessions. |
| **Why limiting** | Operators cannot yet bulk-verify a wave or route from the same console with full manifests. |
| **Affected** | Catering, delivery-heavy, multi-drop operations. |
| **Recommended fix** | Service methods to open sessions from `packingWaveId` / `routeId` / `eventId`, list child orders, aggregate item checklist. |
| **Priority** | **P1** |

### 2. “Send back to production” not wired

| Field | Detail |
|-------|--------|
| **Current state** | `QC_EVENT.SENT_BACK_PRODUCTION` exists; no server action updates production tasks yet. |
| **Why limiting** | Issue workflow stops at packing for automated flows. |
| **Affected** | Full kitchen + production coordination. |
| **Recommended fix** | Action that requeues production work (per your production model) and writes `SENT_BACK_PRODUCTION`. |
| **Priority** | **P1** |

### 3. Supervisor override role matrix vs spec

| Field | Detail |
|-------|--------|
| **Current state** | `canSupervisorOverride` allows **OWNER** and platform superadmin email (`isSuperAdminEmail`). |
| **Why limiting** | Spec called for manager/owner/admin ladder; managers cannot override in code today. |
| **Affected** | Mid-size teams where only owners should not be the bottleneck. |
| **Recommended fix** | Extend allowlist to `MANAGER` (and optionally `ADMIN`) with policy flag per workspace. |
| **Priority** | **P1** |

### 4. Alerts to Packing & Labels / production

| Field | Detail |
|-------|--------|
| **Current state** | QC events append to DB; no automatic in-app notification or task reopen beyond packing send-back. |
| **Why limiting** | Leads discover issues only when they open verify or reports. |
| **Affected** | High-volume packing floors. |
| **Recommended fix** | Hook `ISSUE_OPENED` to notifications module or packing queue priority. |
| **Priority** | **P2** |

### 5. Reporting hooks (pass rate, time, staff)

| Field | Detail |
|-------|--------|
| **Current state** | Data model supports aggregates; scanner UI intentionally light. |
| **Why limiting** | Ops reviews need BI or scheduled reports. |
| **Affected** | Multi-site QA. |
| **Recommended fix** | Read-only SQL or report jobs on `packing_qc_events`, `packing_verification_sessions`. |
| **Priority** | **P2** |

### 6. Bag / item label token resolution

| Field | Detail |
|-------|--------|
| **Current state** | Scan resolves **order** public token or order id; dedicated bag/item barcode payloads not yet parsed. |
| **Why limiting** | Per-bag scan does not jump to a bag-level session. |
| **Affected** | Ghost kitchen, high-SKU bag accuracy programs. |
| **Recommended fix** | Encode bag id in QR, resolve to `PackingTask` or bag entity, start `BAG_VERIFY` session. |
| **Priority** | **P2** |

### 7. Customer name search privacy

| Field | Detail |
|-------|--------|
| **Current state** | `contains` search on `customerName` for authenticated tenant user only. |
| **Why limiting** | Common names return many rows; no phone last-4 filter. |
| **Affected** | Busy pickup counters. |
| **Recommended fix** | Add order number / date / fulfillment filters. |
| **Priority** | **P2** |

### 8. Offline PWA

| Field | Detail |
|-------|--------|
| **Current state** | Online-first Next server actions. |
| **Why limiting** | Warehouse wifi dead zones. |
| **Affected** | Industrial kitchens. |
| **Recommended fix** | Queue scans locally, sync when online (larger initiative). |
| **Priority** | **P3** |

### 9. Dual allergen confirm

| Field | Detail |
|-------|--------|
| **Current state** | Allergen check per line + warnings from product allergens. |
| **Why limiting** | High-risk SKUs may want two-person or barcode-gated confirm. |
| **Affected** | Regulated or brand-sensitive allergen programs. |
| **Recommended fix** | Config flag requiring second scan or supervisor co-sign. |
| **Priority** | **P3** |

## Security notes (verified design intent)

- Lookups use `requireSessionUser` / `userId` on orders and sessions — no cross-tenant reads in normal paths.
- Guest **public** order views remain separate; dashboard verify requires auth.
- QC audit rows are append-only from server actions; clients do not edit history.

## Related docs

- `PACKING_VERIFICATION_ARCHITECTURE.md`
- `PACKING_VERIFICATION_READY_REPORT.md`
