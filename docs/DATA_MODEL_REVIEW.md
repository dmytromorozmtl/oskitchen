# Data model review (Prisma)

Non-destructive assessment for **multi-tenant consistency**, **indexing**, and **ownership**. Apply schema changes only via migrations after review.

---

## Conventions (current)

- **IDs:** UUID primary keys for core entities.
- **Ownership:** Most business tables include `userId` → `UserProfile`.
- **Soft multi-location:** `Menu.locationId`, `Order.locationId` optional — queries should scope `userId` always; add `locationId` when switcher is enforced.
- **Decimals:** Money and costs use `Decimal` — good for rounding policies.
- **JSON:** Address/metadata blobs — validate at application layer.

---

## Indexes (present / recommended)

Already common patterns in schema:

- `@@index([userId])`, `@@index([userId, createdAt])`, `@@index([userId, status])` on high-traffic models.

**Recommended follow-ups** (evaluate per migration window):

| Model / area | Suggestion |
|--------------|------------|
| External orders | Composite on `(userId, provider, externalId)` if not unique — enforce uniqueness where provider guarantees it. |
| Webhook events | `(userId, processed, createdAt)` for queue dashboards. |
| Orders | `(userId, pickupDate)` for routes/calendar (verify existing). |
| Storefront | `storeSlug` unique — already; `publicToken` unique on storefront orders & quotes — verify. |

---

## Cascade behavior

- User deletion cascades to owned rows — expected for SMB SaaS.
- **Restrict** on `OrderItem.productId` prevents accidental product deletion with orders — correct tradeoff.

---

## Nullable fields

- `Order.pickupDate` nullable — flows must tolerate missing dates (dashboard already flags some cases).
- Integration tokens stored encrypted — never returned raw to client.

---

## Multi-tenant query discipline

Every mutation should:

1. Resolve user from **session** (`requireSessionUser`).
2. Filter by **`userId`** on reads/updates.
3. When location switcher ships, add optional `locationId` predicate consistently.

---

## Tokens & slugs

- `publicLookupToken`, storefront `publicToken`, catering `publicToken` — must remain **unique** and **unguessable** (entropy via crypto helpers).

---

## Action items

- [ ] Profile slow queries in staging with realistic seed volume.
- [ ] Add missing composites only with measured need (avoid index bloat).
- [ ] Document location scoping policy when enabling switcher UI globally.
