# Quick Start guide

**Policy:** `kb-content-absolute-final-v1`  
**Dashboard route:** `/dashboard/quick-start`  
**KB article:** `/kb/getting-started/quick-start`  
**Updated:** 2026-06-06

Get from signup to your first completed order in about **15 minutes**. No integration credentials required — demo data seeds supplier, staff, and register automatically.

---

## 15-minute setup

| Step | Time | Outcome |
|------|------|---------|
| 1 — Account and location | ~5 min | Workspace named, timezone set, location added |
| 2 — First menu item | ~5 min | One sellable dish with price on an active menu |
| 3 — First order | ~5 min | POS checkout complete — order visible in Order Hub |

Open **Dashboard → Quick Start** for a live timer and progress checklist.

---

## Step 1 — Account and location

1. Sign up at **https://os-kitchen.com/signup** — 14-day trial, no card required.
2. Complete the onboarding wizard:
   - **Business name** and primary vertical (meal prep, ghost kitchen, commissary, café, etc.)
   - **Timezone** — drives Today briefing and cutoff times
3. Confirm your location under **Settings → Locations** (created by onboarding if skipped).
4. Open **Today** (`/dashboard/today`) — your daily command center.

**Tip:** Pilot operators should bookmark Today — Owner Daily Briefing surfaces alerts and jump links.

---

## Step 2 — First menu item

1. Go to **Dashboard → Menus** (or use the Quick Start wizard step).
2. Create or confirm an **active menu** for your service window.
3. Add **one menu item** with:
   - Display name and price
   - Category (optional but recommended)
   - Allergens if applicable
4. Save — item appears on POS and storefront when published.

For weekly preorder operators, set pickup/delivery deadlines on the menu so production knows cut-off times. See [`../knowledge-base/15-weekly-preorder-flow.md`](../knowledge-base/15-weekly-preorder-flow.md).

---

## Step 3 — First order

1. Open **Dashboard → POS Terminal** (Quick Start links here directly).
2. If prompted, **open a shift** on your register with opening float (cash optional).
3. Add your menu item to the cart and complete checkout:
   - **Cash** — works without Stripe
   - **Card** — requires Stripe Connect (see [Stripe Connect setup](./integrations/stripe-connect-setup.md))
4. On success, confetti confirms the tutorial order.

The order appears in **Order Hub** (`/dashboard/order-hub`) with status and fulfillment type.

---

## Verify your setup

| Check | Where | Expected |
|-------|-------|----------|
| Location active | Settings → Locations | At least one location |
| Menu item live | Menus | Item on active menu |
| Order captured | Order Hub | Tutorial order with line items |
| KDS optional | Kitchen Screen | Ticket after bump from Order Hub |
| Integration Health | Integrations → Health | SKIPPED/BETA labels visible — honest posture |

Run through **Launch Wizard** (`/dashboard/launch-wizard`) if you prefer a guided path with the same milestones.

---

## Next steps

| Goal | Guide |
|------|-------|
| Connect WooCommerce | [WooCommerce setup](./integrations/woocommerce-setup.md) · `/kb/integrations/woocommerce` |
| Connect Shopify | [Shopify setup](./integrations/shopify-setup.md) · `/kb/integrations/shopify` |
| Accept card payments | [Stripe Connect setup](./integrations/stripe-connect-setup.md) · `/kb/integrations/stripe-connect` |
| Delivery apps | [Delivery marketplaces setup](./integrations/delivery-marketplaces-setup.md) · `/kb/integrations/marketplaces` |
| Kitchen display | `/kb/operations/kds` |
| Pilot Week 1 timeline | [`../pilot-week1-roadmap.md`](../pilot-week1-roadmap.md) |

**Support:** in-app widget or support@os-kitchen.com
