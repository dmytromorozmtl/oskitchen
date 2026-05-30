# Soft Delete Standard — KitchenOS Data Lifecycle

**Status:** Engineering standard (draft adopted)  
**Audience:** Backend, platform, compliance, DSR  
**Policy:** Aligns with `artifacts/prisma-performance-audit.json` soft-delete coverage (currently **0%** on business candidates)  
**Related:** [`domain-map.md`](./domain-map.md) · [`scim-provisioning-rfc.md`](./scim-provisioning-rfc.md) · [`pen-test-plan.md`](./pen-test-plan.md) · `services/user/user-deletion-service.ts`

---

## Summary

KitchenOS today implements **partial** soft delete: only `UserProfile.deletedAt` is wired end-to-end (auth gate, account deletion, DSR export trigger). Business entities (`Order`, `Product`, `KitchenCustomer`, …) use **hard delete or status flags** inconsistently.

This standard defines the **canonical `deletedAt` pattern**, query rules, migration audit checklist, and phased rollout so pilots retain audit trails without blocking GDPR/DSR erasure paths.

**Do not hard-delete** tenant-owned rows that appear in financial, order, or compliance audit chains without an explicit erasure runbook exception.

---

## Current state (2026-05-31)

| Model | Soft delete | Mechanism today | Gap |
|-------|-------------|-----------------|-----|
| `UserProfile` | ✅ `deletedAt` | `requestAccountDeletion()` | Reference implementation |
| `Order` | ❌ | Status `CANCELLED` only | No tombstone; FK history intact |
| `Product` / `MenuItem` | ❌ | Hard delete or `lifecycleStatus` | Mixed patterns |
| `KitchenCustomer` | ❌ | Hard delete | CRM history loss risk |
| `StaffMember` | ❌ | Status flags | Offboarding unclear |
| `IntegrationConnection` | ❌ | `DISABLED` status | Not query-filtered uniformly |
| `WorkspaceMember` | ❌ | Hard delete on remove | SCIM deprovision needs standard |

**Prisma audit:** 369 models, **1** with `deletedAt` · candidate coverage **0%** (`scripts/audit-prisma-performance.ts`).

---

## Canonical schema pattern

### Required columns (tenant-owned mutable entities)

```prisma
model ExampleEntity {
  id          String    @id @default(uuid()) @db.Uuid
  workspaceId String    @map("workspace_id") @db.Uuid
  // … business fields …

  deletedAt   DateTime? @map("deleted_at")
  deletedById String?   @map("deleted_by_id") @db.Uuid  // UserProfile.id or staff actor

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([workspaceId, deletedAt])
}
```

### Naming rules

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `deletedAt` | `DateTime?` | Yes | Tombstone timestamp; `null` = active |
| `deletedById` | `UUID?` | Recommended | Actor for audit / SOC2 access review |
| `deletionRequestedAt` | `DateTime?` | DSR only | User-initiated erasure queue (see `UserProfile`) |

**Do not use:** `isDeleted Boolean` as primary signal (prefer nullable timestamp for indexing and “when” audits).  
**Allowed adjunct:** `lifecycleStatus ARCHIVED` **plus** `deletedAt` for catalog entities where UI needs explicit archived state.

### Tables exempt from soft delete

| Category | Examples | Reason |
|----------|----------|--------|
| Immutable audit | `AuditLog`, `BillingEvent`, `WebhookEvent` | Append-only evidence |
| Idempotency / ingress | `billingEvent`, webhook dedupe keys | Must never disappear |
| Junction snapshots | POS receipt lines, order items (post-submit) | Financial record — cancel parent order instead |
| Platform config | `RateLimitPolicy` registry rows | Static config |

---

## Query standard

Every list/detail path for soft-deletable models **must** filter active rows by default.

### Service layer

```typescript
/** Default scope — active rows only. */
export function activeOnly<T extends { deletedAt?: Date | null }>(
  where: T,
): T & { deletedAt: null } {
  return { ...where, deletedAt: null };
}

// Usage
await prisma.product.findMany({
  where: activeOnly({ workspaceId, userId }),
  take: SERVICE_DEFAULT_TAKE,
});
```

### Prisma middleware (optional Phase 2)

Global middleware may inject `deletedAt: null` for opted-in models — **not enabled in pilot** (explicit `where` preferred for clarity).

### Auth integration

Existing pattern in `lib/auth.ts` / `lib/api/with-api-guard.ts`:

```typescript
if (profile?.deletedAt) {
  // fail closed — treat as unauthenticated or 403
}
```

New soft-deleted **users** must continue to block session access; business entity soft delete must not leak into cross-tenant queries (`scopedIdWhere` unchanged).

---

## Delete operations

### Soft delete (default)

```typescript
await prisma.product.update({
  where: { id, workspaceId },
  data: { deletedAt: new Date(), deletedById: actor.userId },
});
await auditLog({
  action: "product.soft_delete",
  entity: { type: "Product", id },
  actor: { userId: actor.userId },
  metadata: { workspaceId },
});
```

### Hard delete (restricted)

Allowed only when **all** conditions hold:

1. Row never participated in a completed financial transaction, **or** legal retention period elapsed.
2. DSR erasure ticket approved (`services/dsr/`).
3. `auditLog` records `entity.hard_delete` with reason code.
4. Two-person review for production workspace data (platform runbook).

### Restore

```typescript
await prisma.product.update({
  where: { id, workspaceId },
  data: { deletedAt: null, deletedById: null },
});
```

Restore window: **30 days** default for catalog entities; **no restore** for user profiles after DSR export completes.

---

## Migration audit checklist

Use this checklist for **every** migration that adds or touches `deletedAt`.

| # | Check | Owner |
|---|-------|-------|
| 1 | Migration is **additive** (`ALTER TABLE ADD COLUMN deleted_at TIMESTAMP NULL`) | Backend |
| 2 | Backfill **not required** — existing rows remain active (`NULL`) | Backend |
| 3 | Composite index `(workspace_id, deleted_at)` or `(user_id, deleted_at)` added | Backend |
| 4 | All `findMany` / `findFirst` in owning service updated with `deletedAt: null` | Backend |
| 5 | Unique constraints account for soft delete (partial unique index where supported, or include `deletedAt` in compound key strategy) | Backend |
| 6 | Dashboard UI hides deleted by default; admin “show archived” toggle documented | Product |
| 7 | `auditLog` event on delete and restore | Backend |
| 8 | Unit test: deleted row invisible to tenant scope | QA |
| 9 | Cross-tenant test: Tenant A cannot restore Tenant B tombstone | QA |
| 10 | Entry added to `CHANGELOG.md` under **Data** | Release |

### Migration SQL template

```sql
-- Example: products soft delete (Phase 1 pilot)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_by_id" UUID;

CREATE INDEX IF NOT EXISTS "products_workspace_id_deleted_at_idx"
  ON "products" ("workspace_id", "deleted_at");

-- No backfill; NULL = active
```

### Rollback

```sql
DROP INDEX IF EXISTS "products_workspace_id_deleted_at_idx";
ALTER TABLE "products" DROP COLUMN IF EXISTS "deleted_by_id";
ALTER TABLE "products" DROP COLUMN IF EXISTS "deleted_at";
```

Rollback is safe only **before** any tombstone rows exist in production.

---

## Phased rollout

| Phase | Models | Trigger | Exit criteria |
|-------|--------|---------|---------------|
| **0 (now)** | `UserProfile` | Shipped | Auth + DSR path proven |
| **1** | `Product`, `Menu`, `MenuItem` | Post-first-pilot | Catalog lists filter `deletedAt`; mapping conflicts doc updated |
| **2** | `KitchenCustomer`, `StaffMember`, `WorkspaceMember` | Enterprise CRM / SCIM pilot | SCIM `active=false` sets tombstone or membership remove per RFC |
| **3** | `IntegrationConnection` | Channel offboarding | Disabled connections query-filtered; credentials rotated |
| **4** | `Order` (header only) | Legal review | **No line-item delete** — order header `deletedAt` hides from ops UI; financial rows retained |

**Orders honesty:** Soft-deleting an order **does not** remove payment, tax, or packing audit obligations. Prefer `status = CANCELLED` for ops; `deletedAt` is UI/archive only.

---

## Integration points

| System | Behavior |
|--------|----------|
| **SCIM** | `PATCH active=false` → remove `WorkspaceMember` + optional `UserProfile.deletedAt`; never hard-delete profile with order history |
| **Public API** | List endpoints exclude `deletedAt != null`; GET by id returns 404 |
| **Webhooks** | Emit `entity.deleted` with `soft: true` in payload taxonomy (future) |
| **Search** | `global-search` excludes tombstones |
| **Product mapping** | Auto-archive mappings when internal product soft-deleted (`PRODUCT_MAPPING_CONFLICTS.md`) |
| **Prisma audit** | Re-run `tsx scripts/audit-prisma-performance.ts --write`; target **≥80%** candidate coverage by Phase 2 |

---

## Verification

```bash
# Soft-delete coverage in schema + heuristics
tsx scripts/audit-prisma-performance.ts --write

# Account deletion path (UserProfile reference)
npm run test -- tests/unit/user-deletion  # if present

# Cross-tenant isolation (deleted foreign rows stay hidden)
npm run test:e2e -- e2e/cross-tenant-isolation.spec.ts
```

---

## Anti-patterns (forbidden)

| Anti-pattern | Why |
|--------------|-----|
| Hard delete order with payment captured | PCI / tax audit break |
| `DELETE FROM` in cron without audit | Silent data loss |
| Soft delete without index on `(workspaceId, deletedAt)` | Full table scans |
| Filtering deleted in UI only (not service layer) | IDOR / API leak |
| Claim “GDPR compliant deletion” without DSR runbook | Procurement false claim |

---

## References

- `services/user/user-deletion-service.ts` — reference soft-delete flow
- `lib/auth.ts` — session block on `deletedAt`
- `scripts/lib/prisma-performance-audit.ts` — `SOFT_DELETE_CANDIDATE_MODELS`
- `docs/PRODUCT_MAPPING_CONFLICTS.md` — mapping archive on product delete
- RFC 7644 SCIM deactivation — [`scim-provisioning-rfc.md`](./scim-provisioning-rfc.md)
