# FoodOps QA matrix (condensed)

## Personas × smoke

| Persona | Must-verify routes |
|---------|--------------------|
| Owner / Admin | Today, Order hub, Settings, Billing, Audit |
| Manager | Orders, Routes, Tasks, CRM |
| Kitchen lead | Production, Kitchen screen |
| Prep cook | Production (scoped) |
| Packer | Packing (no finance PII) |
| Driver | Driver mode, stops, navigation links |
| Customer service | Support inbox, customer profile |
| Accountant | Costing, invoices, exports |
| Platform founder | `/platform/*` + impersonation audit |
| Support / Billing / Dev admin | Matching platform permissions only |

## Business types

Restaurant, café, bakery, bar, catering, meal prep, ghost kitchen, multi-brand, manual-only — validate **business mode hints** + fulfillment defaults.

## Workflows

Onboarding → order → mapping → lifecycle → production → packing → route → CRM → ticket → billing → notification → analytics → platform admin → demo reset.

## Priority

Run `npm test` + targeted Playwright flows per release train.
