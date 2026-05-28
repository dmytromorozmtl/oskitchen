# POS Tablet UX — Software-Only Operator Runbook (Era 17)

**Policy:** `era17-pos-tablet-ux-v1`  
**Proof status:** `tablet_ux_polished` (code + cert; manual tablet sign-off optional)  
**Honest scope:** web-first POS on tablets/browsers you own — **not** proprietary hardware certification or offline POS.

---

## Before opening the terminal

1. Confirm workspace has **POS terminal** plan entitlement and your role includes **`pos.access`**.
2. Create at least one **register** and one **active staff** member (terminal blocks checkout without both).
3. Open **`/dashboard/pos/terminal`** in a modern browser on a tablet or counter display.
4. Prefer landscape orientation; pinch-zoom disabled in browser settings if operators mis-tap.

---

## Touch target checklist (counter service)

| Surface | Minimum target | Where to verify |
|---------|----------------|-----------------|
| Product tiles | 120px height | Catalog grid |
| Complete sale | 56px height | Cart footer |
| Cart +/- controls | 44px | Each line item |
| Customer search hits | 44px | CRM attach panel |
| Tab list rows | 44px | `/dashboard/pos/tabs` |
| Close tab | 48px | Tabs header |

Source tokens: `lib/pos/touch-targets.ts` (`POS_MIN_TOUCH_PX = 48`).

---

## Checkout status messages

The terminal shows a single status region (`data-testid="pos-checkout-status"`) with:

- **Success** — green border (sale complete, offline sync, card captured)
- **Error** — red border (validation, permission, reconnect required)
- **Info** — neutral (tap-to-pay ready)

If tap-to-pay fails, the error appears in the same region — check Stripe Terminal configuration under **POS → Settings → Hardware**.

---

## Permission denied

If you lack `pos.access`, the terminal shows **PosAccessCard** with a link back to the POS hub — contact workspace owner for role assignment. This is expected RBAC, not a bug.

Discount / comp modes require **`pos.discount.apply`** — enforced in `actions/pos.ts` via `pos-discount-guard`; dedicated manager discount UI on terminal remains deferred (`era17-pos-manager-discount-v1`).

---

## Offline behavior (software-only)

When offline, cash sales may queue locally. Card and Stripe placeholder modes require reconnect. Banner shows **Offline / degraded** with queued sale count. **Do not** claim offline POS certification in customer-facing materials.

---

## Pilot validation

```bash
npm run smoke:pos-tablet-ux
npm run test:ci:pos-money-path:cert
```

Optional manual: complete one cash sale on staging tablet; screenshot checkout success status for ops evidence store (not committed to git).

---

## Forbidden claims

- Hardware POS / Toast / Square terminal parity  
- Offline POS production readiness  
- Rush-hour throughput certification  
