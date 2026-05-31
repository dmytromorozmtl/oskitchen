# Beta launch package

## Offer (example)

- Free or discounted **Team** tier during beta in exchange for weekly feedback calls.
- White-glove onboarding: connect first channel + webhook checklist.

## Who to target

- Meal prep / catering / ghost kitchen / bakery operators already on WooCommerce or Shopify.
- Order volume 50–2,000 / week with multi-channel pain.

## Pricing for first customers

- Anchor on public **Starter / Pro / Team** monthly pricing.
- Consider **founder pricing** locked for 12 months — document in contract/email.

## Onboarding call script (15 min)

1. Confirm channels + volume
2. Create workspace + invite staff
3. Paste webhook URLs (`docs/PRODUCTION_WEBHOOKS.md`)
4. Set notification toggles + pickup windows
5. Schedule week-2 check-in

## Demo script

- See **`docs/FINAL_DEMO_SCRIPT.md`**.

## Feedback form questions

- What broke compared to old workflow?
- Where did staff get confused?
- Which integration matters most next?

## Bug report template

- Steps to reproduce
- Expected vs actual
- Workspace ID (internal) + timestamp
- Screenshots

## Weekly follow-up email

> Subject: OS Kitchen beta — quick pulse  
> Body: What was painful this week? Reply with 3 bullets. If blocked on integrations, say which channel.

## Success criteria

- ≥3 workspaces active weekly in Order Hub
- ≥1 successful live channel connection (non-demo)
- Zero mystery subscription states after Stripe events

## First 10 customers goal

- 10 onboarded with **documented** webhook URLs + owner trained on production board.

## In-app support hooks

- Dashboard account menu: **Book onboarding** (`/beta`), **Feedback** / **Bug** mailto when `NEXT_PUBLIC_SUPPORT_EMAIL` is set.
