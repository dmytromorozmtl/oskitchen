# KitchenOS — Optimization & Refactor Opportunities

**Date:** 2026-05-15

---

## 1. Duplicated logic / mapping

| Area | Paths | Issue | Recommendation | Risk | Effort | Priority |
|------|-------|-------|------------------|------|--------|----------|
| Order status labels | Many dashboard components | Same enum → string mapping repeated | `lib/orders/status-labels.ts` single exporter | Low | M | **P2** |
| Capability copy | Landing + integrations pages | Drift vs registry | Generate marketing bullets from `channel-registry` metadata (build-time script) | Med | L | **P3** |
| Permission checks | Actions + API routes | Repeated `requireSessionUser` + workspace | Thin `assertWorkspaceMember(userId, workspaceId)` helper | Med | M | **P2** |

---

## 2. Components

| Item | Issue | Recommendation | Risk | Effort | Priority |
|------|-------|----------------|------|--------|----------|
| Empty states | Multiple entry components | Unify on `EmptyState` props | Low | S | **P3** |
| Large dashboard clients | Hard to test | Split “view” vs “data hooks” | Med | L | **P3** |

---

## 3. Server actions

| Pattern | Risk | Recommendation |
|---------|------|----------------|
| Fat actions | Hard to audit permissions | Push pure validation to `lib/**` | **P2** |
| Unbounded list fetch | Performance | Cursor pagination helpers | **P2** |

---

## 4. Folder organization

- `services/` is large but domain-sorted — **OK**.
- `actions/` flat — **OK** for now; consider domain subfolders if file count grows > ~120 (**P3**).

---

## 5. Low-risk refactors applied this pass

- Removed unused imports / dead parameters patterns in settings + support + product-mapping pages.
- Simplified `maskCardLike` helper signature in `lib/audit/audit-redaction.ts` (no behavior change).

---

## 6. Larger refactors (not started)

- Extract storefront checkout validation for isolated testing.
- Introduce `@tanstack/react-virtual` for Order Hub table at scale.
