# Permissions and security

## Roles

- **owner / admin** — full access to every tab and KPI, including financial details.
- **manager** — full operational + financial analytics; can manage saved views and alerts.
- **sales** — customer analytics, catering, meal plan analytics; no production/delivery.
- **kitchen_lead / kitchen / production** — production analytics; basic overview.
- **driver / dispatcher** — delivery analytics; basic overview.
- **accountant** — revenue / channel / inventory / forecast / cost-margin.
- **viewer** — basic executive overview, no exports.
- **superadmin (`workspace.moroz@gmail.com`)** — global access to every tab regardless of workspace role.

## Implementation

`lib/analytics/analytics-permissions.ts` exports `canDoAnalytics(scope, permission)`.
Superadmin bypass uses `isSuperAdminEmail` (shared with CRM, Catering, Meal Plans).
Workspace owners always have full access.

## PII

- The Customers tab masks emails (`re***@domain`).
- Phone numbers are never surfaced inside analytics.
- For customer drilldowns, operators are routed to the CRM module where masking rules already apply.

## No fake integrations

We never call GA4, Stripe, QuickBooks, or any external system. Every
number on every page comes from rows already in the OS Kitchen database.
