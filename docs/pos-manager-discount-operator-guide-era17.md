# POS manager discount — operator guide (Era 17)

**Policy:** `era17-pos-manager-discount-v1` + `era18-pos-manager-discount-ui-v1`  
**Status:** `terminal_discount_ui_wired` — terminal UI + backend RBAC; **no manager PIN**; software-only POS

## Who can apply discounts or comps

| Action | Required permission |
|--------|---------------------|
| Standard checkout (cash/card, no discount) | `pos.checkout` |
| Explicit discount amount on checkout | `pos.discount.apply` |
| COMPED payment mode | `pos.discount.apply` |
| Gift card redemption at checkout | `pos.checkout` (service stacks discount) |
| Loyalty points redemption | `pos.checkout` (service stacks discount) |

Workspace roles map `pos.discount.apply` via the POS comp capability (`pos_comp` legacy alias → `pos.manager.override` for broader overrides).

## Terminal UI (Era 18)

On **POS Terminal → Cart**:

1. Managers with `pos.discount.apply` see **Manager discount** — fixed amount, percent presets (5/10/15/20%), or **Comp sale** (COMPED mode).
2. Cashiers without the permission do **not** see COMPED in payment modes; server still enforces RBAC if bypassed.
3. **Subtotal / Discount / Amount due** summary updates before **Complete sale**.

## Edge cases (test-backed)

1. Cashier with only `pos.checkout` **cannot** submit checkout with `discountAmount > 0`.
2. Cashier **cannot** use COMPED payment mode without `pos.discount.apply`.
3. Zero discount on a normal payment mode does **not** require a second permission check.
4. Negative discount amounts are rejected at the server action schema.
5. Invalid gift card or loyalty redeem fails before an order is created.

## Pilot limitations

- Manager discount UI on terminal — **wired** (`era18-pos-manager-discount-ui-v1`); no separate manager PIN flow.
- Software-only POS — no hardware certification or offline claim.
- Refunds and voids use separate permissions (`pos.refund`, `pos.void`).

## Validation

```bash
npm run test:ci:pos-manager-discount-era17:cert
npm run test:ci:pos-manager-discount-era17
npm run test:ci:pos-money-path:cert
```
