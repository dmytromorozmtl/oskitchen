# CRM QA checklist

## Smoke

- [ ] `/dashboard/customers` loads (empty + populated workspaces)
- [ ] All sub-tabs render: Overview / Customers / Segments / VIPs / At risk / Companies / Follow-ups / Allergies / Dedupe / Reports
- [ ] `/dashboard/customers/new` form submits and redirects to the detail page
- [ ] Customer detail page renders for an existing customer
- [ ] Customer detail page returns 404 for unknown id

## Data hooks

- [ ] Manual order create → customer upserted, timeline event written, metrics recomputed
- [ ] Storefront checkout → same path with `source = STOREFRONT`
- [ ] Enterprise API `POST /api/public/v1/orders` → same path
- [ ] CSV customer import (CUSTOMERS) → row exists with `source = IMPORT`
- [ ] Existing workspace with orders but zero customers → first visit to `/dashboard/customers` backfills

## Metrics

- [ ] Cancelled orders excluded
- [ ] `isChannelTestOrder` excluded
- [ ] `at_risk_score` populated after a customer with 1+ orders goes 60+ days quiet
- [ ] `status` flips to AT_RISK automatically; never overrides VIP / BLOCKED / ARCHIVED

## Allergies / dietary

- [ ] Add comma-separated allergies on detail page
- [ ] Allergies page lists the customer
- [ ] Allergy timeline event recorded
- [ ] Dislikes / favorites also save and reappear

## Notes

- [ ] Note posts with each visibility (INTERNAL / KITCHEN / DELIVERY / SALES)
- [ ] Timeline records `NOTE_ADDED`

## Follow-ups

- [ ] Create from detail page → appears on `/dashboard/customers/follow-ups`
- [ ] Mark done → timeline event `FOLLOW_UP_COMPLETED`
- [ ] Overdue badge appears when `due_at < now()`

## Consent

- [ ] Toggle email marketing → `customer_consent_events` row written
- [ ] Customer card shows `marketing_consent` accurately
- [ ] Audit list populates

## Segments

- [ ] Starter pack adds segments
- [ ] Rebuild button updates memberships
- [ ] Custom segment creates with 0 members

## Dedupe

- [ ] `/dashboard/customers/dedupe` groups duplicates by email/phone/name/externalId
- [ ] Merge confirms and writes `customer_merge_events`
- [ ] Legacy `/dashboard/customers/deduplication` still works

## Companies

- [ ] Add company succeeds
- [ ] Member count reflects attached `KitchenCustomer.company_account_id` rows

## Reports

- [ ] KPIs reflect data
- [ ] Source / type breakdowns sort by count desc

## Privacy

- [ ] Owner sees everything
- [ ] Manager / sales see CRM list and details
- [ ] Kitchen / driver / packer see only allergy / delivery notes via their existing screens
- [ ] No marketing emails sent (the integration is not wired)
- [ ] `workspace.moroz@gmail.com` retains full access

## Build / typecheck

- [ ] `npm run typecheck`
- [ ] `npm run build`
