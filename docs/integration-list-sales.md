# Integration list (sales)

**Audience:** Sales, solutions engineers, design partners  
**Policy:** `sales-assets-package-p1-82-v1`  
**Source of truth:** `lib/integrations/integration-registry.ts`  
**Public surface:** [`/integrations`](https://os-kitchen.com/integrations) · Integration Health dashboard

Registry status reflects **code readiness**. Merchant credentials + staging smoke PASS are required before claiming production LIVE ops for a specific tenant.

## How to read status

| Registry status | Safe sales language |
|-----------------|---------------------|
| **LIVE** | Connector shipped — operator must configure credentials and verify Integration Health PASS |
| **BETA** | Qualified beta — demo with honesty labels; not production-certified |
| **PLACEHOLDER** | Roadmap only — do not sell |

Always show `/dashboard/integration-health` in demo — never claim "all integrations connected."

## Delivery & marketplace (priority for pilots)

| Integration | Registry | Typical use |
|-------------|----------|-------------|
| WooCommerce | LIVE | Meal prep / preorder storefront ingest |
| Shopify | LIVE | Storefront + B2B when configured |
| DoorDash | LIVE | Delivery order ingest (merchant creds) |
| Uber Eats | LIVE | Delivery order ingest (merchant creds) |
| Grubhub | LIVE | Delivery order ingest (merchant creds) |
| Skip / Just Eat | LIVE | Canada delivery ingest |
| Uber Direct | BETA | Dispatch — verify before promise |

## Payments

| Integration | Registry | Notes |
|-------------|----------|-------|
| Stripe | LIVE | Storefront + Connect payouts |
| Square Payments | LIVE | Optional card-present path |
| Moneris | LIVE | Canada payments |

## Accounting & labor

| Integration | Registry | Notes |
|-------------|----------|-------|
| QuickBooks | LIVE | Export connector — accountant validates |
| Xero | LIVE | Export connector — accountant validates |
| 7shifts | LIVE | Staff sync BETA maturity — verify |
| Homebase | LIVE | Labor sync — not payroll replacement |

## Reservations & marketing

| Integration | Registry | Notes |
|-------------|----------|-------|
| OpenTable | LIVE | Reservation ingest |
| Resy | LIVE | Reservation ingest |
| Klaviyo | LIVE | Marketing sync |
| Mailchimp | LIVE | Marketing sync |

## POS platform connectors (BETA)

| Integration | Registry | Notes |
|-------------|----------|-------|
| Toast | BETA | Read-only / bridge — not Toast replacement |
| Square | BETA | Channel bridge — verify scope |
| Clover | BETA | Device fleet bridge — verify scope |
| Lightspeed | BETA | Bridge — verify scope |

## Sales checklist per integration

1. Confirm operator already uses the channel
2. Collect required env vars from registry `requiredEnv`
3. Run Integration Health — screenshot PASS / SKIPPED / FAILED
4. Never claim unified inventory depletion across all channels unless proven in tenant
5. Attach [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) Section 1

## Verify registry before deck edits

```bash
grep -A3 'status:' lib/integrations/integration-registry.ts | head
npm run audit:sales-assets-package
```

Typical 2026 positioning — **verify** vendor API tiers and merchant agreement before purchase decisions.
