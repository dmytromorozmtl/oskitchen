# Loyalty 2.0

Restaurant loyalty with **points per menu item**, **visit milestones**, **birthday rewards**, **referral bonuses**, and **Silver / Gold / Platinum** tiers.

## Owner setup

1. Open **Dashboard → Loyalty → Program builder** (`/dashboard/loyalty/program-builder`).
2. Configure item rules (e.g. Espresso +5 pts, Latte +10 pts).
3. Set visit free-item rule (e.g. 10th coffee free).
4. Enable birthday and referral bonuses.
5. **Preview earn** → **Save program**.

## Customer experience

- Points accrue on POS orders linked to a kitchen customer.
- Tiers upgrade lifetime earn multipliers automatically.
- Birthdays: set `tagsJson.birthday` to `MM-DD` on the customer profile.
- Referrals: call `grantLoyalty2ReferralBonus` when a referred friend completes first order.

## Competitor comparison

| Product | Per-item points | Visit free item | Birthday auto | Referral pts |
|---------|-----------------|-----------------|---------------|--------------|
| Toast Loyalty | Limited | Add-on | Email partners | Rare |
| Square | Per visit $ | Basic | Manual | Consumer only |
| **OS Kitchen** | **Built-in** | **10th visit rules** | **Cron-ready** | **Both earn** |

## Sales pitch

> "Espresso earns 5 points, lattes 10 — not just dollars. Every 10th coffee is free. Birthdays send dessert points automatically. Refer a friend, you both win."

## Implementation

- `services/loyalty/loyalty-2.0-service.ts`
- `services/loyalty/restaurant-loyalty-service.ts` (earn math)
- `app/dashboard/loyalty/program-builder/page.tsx`
