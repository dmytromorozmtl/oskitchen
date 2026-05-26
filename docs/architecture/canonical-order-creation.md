# Canonical Order Creation

KitchenOS must treat order creation as a protected architectural boundary.

Direct application-level writes such as `prisma.order.create(...)` or
`prisma.order.upsert(...)` are forbidden outside the approved canonical layer,
because an order write is not just a database insert. It is a business
transaction with security, tenancy, PII, CRM, lifecycle, and operational side
effects.

## Approved Write Path

The approved write path is:

1. entrypoint validates input and permissions
2. entrypoint resolves tenant actor / workspace
3. entrypoint calls `createOrderViaCenter(...)`
4. canonical service resolves normalized payload
5. canonical service persists via `persistResolvedOrder(...)`
6. side effects run from approved services
7. read models / notifications / revalidation happen after the canonical write

Primary implementation:

- `services/orders/order-creation-service.ts`

Known approved callers:

- `actions/order-creation.ts`
- `actions/orders.ts`
- `app/api/public/v1/orders/route.ts`
- `services/pos/pos-checkout-service.ts`
- `actions/storefront-order.ts`
- `services/catering/quote-conversion-service.ts`
- `services/meal-plans/meal-plan-order-generator.ts`
- `services/integrations/doordash/doordash-service.ts`

## Why Direct Order Writes Are Forbidden

Direct writes bypass one or more of the following invariants:

- tenant/workspace ownership resolution
- order PII encryption at rest
- canonical status initialization
- channel/source attribution
- CRM/customer upsert side effects
- audit and operational logging
- downstream production / POS / webhook consistency rules
- cache and route revalidation discipline

Even if a direct Prisma insert "works", it may silently create:

- plaintext customer data
- cross-tenant leakage risk
- incorrect lifecycle state
- missing customer record linking
- missing analytics or operational follow-up
- broken dashboard/storefront read expectations

## Correct Pattern

```ts
const created = await createOrderViaCenter(
  {
    userId,
    workspaceId,
    performedById: sessionUserId,
  },
  {
    orderType: "CUSTOM_ORDER",
    fulfillmentDetail: "PICKUP",
    customerName,
    customerEmail,
    customerPhone,
    lines,
  },
);
```

## Incorrect Pattern

```ts
await prisma.order.create({
  data: {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    // ...
  },
});
```

## PII Handling

Order entrypoints must never manually persist plaintext order PII unless they
are inside the approved canonical write layer.

Canonical behavior today:

- order PII is encrypted in `persistResolvedOrder(...)`
- storefront-specific order rows use storefront-safe encryption helpers
- integration tests assert encrypted-at-rest behavior across major entrypoints

Relevant files:

- `services/orders/order-creation-service.ts`
- `lib/orders/order-pii.ts`
- `actions/storefront-order.ts`
- `tests/integration/order-entrypoint-pii.integration.test.ts`

## Audit Logging and Side Effects

Order creation is allowed to trigger downstream behavior only after the
canonical write succeeds.

Common side-effect classes:

- CRM/customer synchronization
- loyalty adjustments
- POS transaction / receipt persistence
- production routing
- inventory impact creation
- analytics / audit events
- notification dispatch

These must remain attached to approved services, not duplicated in ad-hoc
route/action code.

## Lifecycle Rules

Order lifecycle defaults and transitions must remain consistent with:

- `lib/workflows/order-lifecycle-rules.ts`
- `services/workflows/order-lifecycle-service.ts`

New entrypoints must not invent custom initial statuses or transition logic
unless the canonical service is explicitly extended.

## Revalidation Rules

Route/action handlers may revalidate UI paths after canonical creation, but the
database write itself must still originate in the canonical service.

Typical revalidation surfaces:

- `/dashboard/orders`
- `/dashboard`
- `/dashboard/production`
- `/dashboard/customers`

## Remaining Exceptions

Current direct `order.create` exceptions are limited to non-application
bootstrap/demo paths and validator/tests. These should not be used as product
patterns:

- `prisma/seed.ts`
- `services/demo-data.ts`
- `services/demo/commercial-demo-seed.ts`

If a future path cannot be moved safely to the canonical service, add:

- a code TODO with exact reason
- the architectural risk
- a follow-up task
- an owner suggestion

Do not silently introduce a second order-write path.
