# Order creation QA

## Smoke

- `/dashboard/orders/new` renders without an active weekly menu.
- The weekly-preorder card is disabled when there is no active menu;
  the rest are enabled.
- A manual order can be created in 6 steps with at least one line.
- A weekly preorder can be created when an active menu exists.
- A custom-line bakery order can be created with no `productId`.
- A catering order defaults to `Requested` + `Manual invoice`.
- Existing customer dropdown links `customerId` on the order.
- Walk-in (no name, no email) still saves under "Walk-in customer".
- Delivery selection without an address shows a warning.
- Switching status to Draft saves status `DRAFT` (DB enum `PENDING`).

## Safety

- Payment never auto-completes for any mode.
- Production / packing / route side-effects do not run on creation.
- `actions/orders.ts → createOrder` still works for the legacy
  weekly-preorder form (if reused anywhere).
- Lines without `productId` are skipped by:
  - `lib/ingredient-demand/demand-calculation.ts`
  - `services/packing/generate-packing-queue.ts`
  - `services/production/generate-production.ts`
- The `superadmin` user (`workspace.moroz@gmail.com`) bypasses the role
  gate.

## Commands

```
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run build
```

All four must complete with no errors.
