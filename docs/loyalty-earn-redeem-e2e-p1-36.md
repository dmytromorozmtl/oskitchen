# Loyalty earn→redeem E2E (P1-36)

**Policy:** `loyalty-earn-redeem-e2e-p1-36-v1`

Gap closure for QA task P1-36: prove order → points → CRM → apply on next order.

## Chain

```
order → points → CRM → apply on next order
```

| Step | Implementation |
|------|----------------|
| `seed_customer` | Create KitchenCustomer + enable loyalty program |
| `place_order_earn` | POS cash sale with customer attached → points earned |
| `verify_crm_points` | Unified CRM profile shows `crm-loyalty-points-balance` |
| `redeem_next_order` | Second POS checkout redeems points |
| `verify_balance_updated` | Balance decreases after redeem |

## Files

- Policy: `lib/loyalty/loyalty-earn-redeem-e2e-p1-36-policy.ts`
- Audit: `lib/loyalty/loyalty-earn-redeem-e2e-p1-36-audit.ts`
- E2E spec: `e2e/loyalty-earn-redeem-e2e.spec.ts`
- CRM panel: `components/crm/unified-customer-profile-panel.tsx`

## CI

```bash
npm run check:loyalty-earn-redeem-e2e-p1-36
```

Live Playwright (requires DB + credentials + flag):

```bash
E2E_LOYALTY_EARN_REDEEM=true E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... \
  npm run test:e2e:loyalty-earn-redeem-e2e
```

## Artifact

`artifacts/loyalty-earn-redeem-e2e-p1-36.json`
