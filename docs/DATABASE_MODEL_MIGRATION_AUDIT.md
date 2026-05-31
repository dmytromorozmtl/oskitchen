# OS Kitchen — Database Model & Migration Audit

**Date:** 2026-05-15

---

## 1. Scale snapshot

| Artifact | Count |
|----------|-------|
| Prisma `model` blocks | **288** |
| Prisma `enum` blocks | **252** |
| SQL migrations (`prisma/migrations/*/migration.sql`) | **72** |

**Interpretation:** The ORM layer is **large** — schema changes require migration discipline, additive-first changes, and careful review of cascade behavior.

---

## 2. Migration posture

- **Production:** Use `npm run db:deploy` / `prisma migrate deploy` (see README).
- **Repair SQL:** `prisma/sql/*.sql` for optional column repair (`db:repair-onboarding`, `db:repair-storefront`).
- **Client drift:** `postinstall` + `build` run `prisma generate` — keep CI aligned.

**Rule (user):** Do not auto-apply production migrations in this audit — **no new migration files** were added in this pass.

---

## 3. Multi-tenant fields

Expect `workspaceId` (and often `organizationId`) on tenant-owned entities. **P1 review:** any model lacking workspace scoping but containing business data should be flagged in schema review sessions.

---

## 4. Risk themes

| Theme | Recommendation |
|-------|------------------|
| `onDelete: Cascade` | Verify orphan semantics for channel imports, webhook jobs, and demo resets — prefer `Restrict` on financially sensitive links where possible (**design review**). |
| JSON columns | Settings / theme / integrations — validate with Zod at write time; avoid storing secrets (**P0** if found). |
| Broad enums | `NormalizedOrderStatus` vs legacy `OrderStatus` — document mapping (`CORE_OPERATIONAL_FLOW_AUDIT.md`). |
| Audit tables | Retention job exists (`services/audit/audit-retention-service.ts`) — ensure scheduled in prod (**ops**). |

---

## 5. Index strategy (additive candidates)

Validate in staging with real volumes before migrations:

- Orders: `(workspaceId, createdAt DESC)`, `(workspaceId, status, createdAt DESC)`.
- Webhook jobs: `(status, createdAt)`, `(workspaceId, status)`.
- Audit logs: `(workspaceId, createdAt DESC)`.
- Support tickets: `(workspaceId, status, updatedAt DESC)`.

---

## 6. Demo / test markers

Demo flows use dedicated services (`services/demo/*`). Ensure demo-created rows are identifiable for safe pruning (**P2** data hygiene).

---

## 7. Recommended next migrations (safe / additive only — planning)

1. Partial indexes for terminal states (`FAILED` webhook jobs older than N days) if table bloat appears.
2. Covering index for Order Hub default sort only after confirming query plans.

**None implemented** in this audit pass.
