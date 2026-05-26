#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "docs/knowledge-base");
fs.mkdirSync(dir, { recursive: true });

/** @type {Record<string, string>} */
const articles = {
  "01-getting-started": `# Getting Started with KitchenOS

Welcome to KitchenOS — your kitchen operations platform.

## First login

1. Sign up at **https://os-kitchen.com/signup** (14-day free trial).
2. Complete the onboarding wizard — business name, timezone, primary vertical.
3. Open **Today** (\`/dashboard/today\`) — your command center.

## Recommended setup order

1. **Settings → Locations** — add your kitchen location(s).
2. **Menu / Products** — create categories and sellable items.
3. **Staff** — invite team members with appropriate roles.
4. **POS** — create a register and open a shift.
5. **Storefront** — publish your online preorder site (optional).

## Need help?

Use the in-app support widget or email support@os-kitchen.com.
`,
  "02-creating-your-first-menu": `# Creating Your First Menu

Menus organize what you sell and drive POS, storefront, and production.

## Steps

1. Go to **Dashboard → Menu** (or Products, depending on your workspace preset).
2. Click **New category** — e.g. "Weekly Meals", "Add-ons", "Drinks".
3. Add **menu items** with name, price, and optional SKU/barcode.
4. Set **availability** — days of week, cutoff times for preorders.
5. Link items to **recipes** (optional) for food costing.

## Tips

- Use clear naming operators will recognize on KDS tickets.
- Set preorder cutoff at least 24h before production day for meal prep.
- Archive seasonal items instead of deleting — preserves order history.
`,
  "03-adding-products": `# Adding Products

Products are sellable SKUs used in POS, storefront, and channel imports.

## Create a product

1. **Dashboard → Products → New**.
2. Enter title, price, tax category, and barcode (optional).
3. Assign to menu categories.
4. Upload image for storefront display.

## Variants and modifiers

- Add **variants** for size/flavor (e.g. Regular / Large).
- Use **modifier groups** for add-ons (extra protein, sauce choice).

## Channel mapping

If you use WooCommerce or Shopify, map external SKUs in **Integrations → Product mapping**.
`,
  "04-setting-up-pos": `# Setting Up POS

KitchenOS POS runs in any modern browser — tablet, laptop, or phone.

## Create a register

1. **Dashboard → POS → Registers → New register**.
2. Name it (e.g. "Front Counter", "Expo").
3. Assign to a location.

## Open a shift

1. Select register → **Open shift**.
2. Enter opening cash float (if using cash).
3. POS terminal is ready for sales.

## Payment modes

- **Cash** — records tender, calculates change.
- **Stripe** — card payments via Stripe Connect.
- **Placeholder card** — for training only; blocked offline.

See **Mobile POS** article for handheld workflow.
`,
  "05-accepting-orders": `# Accepting Orders

Orders arrive from POS, storefront, and integrations into one hub.

## Order sources

| Source | Path |
|--------|------|
| Walk-in POS | Dashboard → POS |
| Online preorder | Your storefront |
| WooCommerce / Shopify | Integrations (beta) |
| Manual | Dashboard → Orders → New |

## Order lifecycle

Pending → Confirmed → Preparing → Ready → Completed

Update status from order detail or let KDS/production drive transitions.

## Order detail actions

- Edit line items (before production starts)
- Add notes for kitchen
- Process refund (see Refunds article)
- Print receipt / packing slip
`,
  "06-production-board": `# Production Board

Plan and execute batch production from demand.

## Open production

1. **Dashboard → Production**.
2. Select production date and location.
3. Review **demand** from confirmed orders.

## Batch workflow

1. Create **batches** by recipe or menu item.
2. Assign to **stations** (grill, prep, bakery).
3. Mark batches in progress → complete.
4. Completed batches feed packing queue.

## Tips

- Run demand calculation before production day.
- Use yield rules for accurate batch sizes.
- KDS shows orders tied to active batches.
`,
  "07-packing-and-labels": `# Packing and Labels

Verify orders before handoff to pickup or delivery.

## Packing queue

1. **Dashboard → Packing**.
2. Orders appear when marked ready or per your workflow rules.
3. Use **item checklist** — scan or tap each line item.

## Labels

- Print packing labels with customer name, items, allergens.
- Configure label templates in **Settings → Printing**.

## Packing waves

For high volume, use **packing waves** to group orders by pickup window or route.
`,
  "08-managing-pickup-delivery": `# Managing Pickup and Delivery

## Pickup

1. Orders show pickup window on packing slip.
2. Mark **Ready for pickup** — customer notified (email).
3. At line → **Complete** when handed off.

## Delivery routes

1. **Dashboard → Routes** — build delivery routes.
2. Assign orders to drivers/stops.
3. Track completion per stop.

## Storefront pickup settings

Configure pickup windows and cutoff times in **Storefront → Settings → Fulfillment**.
`,
  "09-connecting-stripe": `# Connecting Stripe

KitchenOS uses **Stripe Connect** — you receive payments directly.

## Setup

1. **Dashboard → Billing → Connect Stripe**.
2. Complete Stripe onboarding (business info, bank account).
3. Test with Stripe test mode before going live.

## Storefront checkout

- Customers pay via Stripe Checkout on your storefront.
- KitchenOS never stores card numbers (PCI SAQ-A path).

## POS card payments

- Requires active Stripe Connect account.
- Card payments need **online** connectivity (not queued offline).

## Troubleshooting

- **Past due:** check Stripe Dashboard for verification holds.
- **Webhook errors:** verify Stripe webhook endpoint in Billing settings.
`,
  "10-adding-staff": `# Adding Staff

## Invite a team member

1. **Dashboard → Staff → Invite**.
2. Enter email and select **role** (Owner, Manager, Staff, etc.).
3. They receive an invite link to join your workspace.

## Permissions

Roles control access to POS, production, settings, and reports.
Customize in **Settings → Permissions**.

## Best practices

- Give front-of-house **POS-only** access when possible.
- Restrict billing/settings to owners.
- Remove access promptly when staff leave.
`,
  "11-handling-refunds": `# Handling Refunds

## From order detail

1. Open order → **Refund**.
2. Select full or partial refund.
3. Choose reason (required for reporting).
4. Confirm — Stripe refund processes automatically for card payments.

## Cash refunds

Record cash refund in POS; adjust shift cash count at close.

## Storefront refunds

Initiated from dashboard; customer receives Stripe refund email.

## Policy

Set refund policy text on storefront **Policies** pages.
`,
  "12-storefront-setup": `# Storefront Setup

Launch your branded online preorder site.

## Publish storefront

1. **Dashboard → Storefront**.
2. Choose theme or customize colors, fonts, logo.
3. Set slug (e.g. \`os-kitchen.com/s/yourbrand\`).
4. **Publish** when ready.

## Essential settings

- Menu visibility and preorder cutoff
- Pickup vs delivery options
- Stripe Connect (required for checkout)
- Privacy and terms pages

## Custom domain

Add custom domain in Storefront → Domains; follow DNS instructions.
`,
  "13-inventory-basics": `# Inventory Basics

Track ingredients and stock levels.

## Setup

1. **Dashboard → Inventory → Ingredients**.
2. Add ingredients with units (kg, lb, each).
3. Link ingredients to **recipes** for auto-depletion.

## Stock adjustments

- **Receive** — add stock from purchase orders.
- **Adjust** — correct counts after physical inventory.
- **Waste** — log spoilage (feeds costing reports).

## Low stock alerts

Configure reorder points in ingredient settings.
`,
  "14-food-cost-tracking": `# Food Cost Tracking

## Recipe costing

1. Link menu items to recipes with ingredient quantities.
2. **Dashboard → Costing** runs calculate plate cost.
3. Compare food cost % to target margin rules.

## Reports

- Costing runs by period
- Margin by menu item
- Variance vs theoretical usage

## Tips

- Update ingredient costs when supplier prices change.
- Review costing weekly for meal prep operators.
`,
  "15-weekly-preorder-flow": `# Weekly Preorder Flow

Ideal workflow for meal prep businesses.

## Weekly rhythm

| Day | Action |
|-----|--------|
| Mon | Open preorder window on storefront |
| Wed | Cutoff — orders lock |
| Thu | Run demand → production board |
| Fri | Produce batches → pack |
| Sat | Pickup / delivery |

## Configuration

- Set **cutoff day/time** on storefront menu.
- Use **meal plans** for subscription weekly orders.
- Production board groups by delivery day.

## Tips

- Send reminder email before cutoff (Notifications).
- Use packing waves by pickup slot.
`,
  "16-kds-basics": `# Kitchen Display System (KDS)

Real-time order queue for the line.

## Open KDS

1. **Dashboard → Kitchen** on a tablet mounted in kitchen.
2. Orders appear as they are confirmed.
3. Tap to bump → preparing → ready.

## Features

- Color coding by age / priority
- Station filters (grill, cold, expo)
- Realtime updates via Supabase

## Hardware

- Any tablet with browser; full-screen mode recommended.
- No proprietary KDS hardware required.
`,
  "17-reports-and-analytics": `# Reports and Analytics

## Built-in reports

- **Dashboard → Reports** — sales, production, inventory.
- **Analytics** — trends, saved views, alerts.

## Key metrics

- Revenue by channel (POS vs storefront)
- Orders by day / hour
- Food cost % and margin
- Staff productivity (POS transactions)

## Export

Use **Import/Export** center for CSV exports to accounting tools.
`,
  "18-mobile-pos": `# Mobile POS (Handheld)

Run counter sales from a phone or tablet.

## Access

**Dashboard → POS** — responsive layout adapts to screen size.

## Offline mode

- **Cash sales** can queue offline (IndexedDB).
- Sales sync automatically when back online.
- **Card / Stripe** require connectivity.

## Keyboard shortcuts

On desktop POS: \`/\` focus search, \`Enter\` checkout, \`Esc\` clear cart.

## Limitations

See in-app offline banner for current restrictions.
`,
  "19-troubleshooting": `# Troubleshooting

## Common issues

### Orders not appearing on KDS
- Confirm order status is Confirmed or Preparing.
- Check kitchen station filter.
- Verify Realtime connection (refresh page).

### Storefront checkout fails
- Stripe Connect must be complete.
- Check menu item availability and cutoff times.
- Review Stripe Dashboard for declined cards.

### POS shift won't open
- Ensure register exists for location.
- Previous shift may need closing.

### Sync issues after offline POS
- Wait for connectivity; queued sales sync on online event.
- Check queued count badge on POS terminal.

## Get support

In-app widget → **Support**, or email support@os-kitchen.com.
Include workspace name and order ID if applicable.
`,
  "20-faq": `# FAQ

## General

**Q: Do I need special hardware?**  
A: No. KitchenOS runs in a browser on tablets, laptops, or phones.

**Q: Is there a free trial?**  
A: Yes — 14 days on all plans.

**Q: What countries are supported?**  
A: US and Canada for Stripe Connect.

## POS and payments

**Q: Does POS work offline?**  
A: Cash sales can queue offline and sync later. Card payments require internet.

**Q: Do you support Stripe Terminal?**  
A: Not in 2026 scope — BYOD web POS only.

## Integrations

**Q: Uber Eats / DoorDash native sync?**  
A: Scaffold only. Use WooCommerce/Shopify import or manual order entry today.

**Q: QuickBooks / Xero?**  
A: Export available; live sync is on roadmap.

## Billing

**Q: Can I change plans?**  
A: Yes — upgrade/downgrade in Dashboard → Billing.

**Q: What happens after trial?**  
A: Stripe subscription starts; cancel anytime before trial ends to avoid charge.
`,
};

for (const [name, content] of Object.entries(articles)) {
  fs.writeFileSync(path.join(dir, `${name}.md`), content.trim() + "\n");
}
console.log(`Created ${Object.keys(articles).length} knowledge base articles in ${dir}`);
