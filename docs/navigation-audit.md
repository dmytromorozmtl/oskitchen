# Navigation audit — OS Kitchen

**Generated:** 2026-06-02 · **Method:** filesystem scan of `app/**/page.tsx`
**Canonical sidebar IA:** `lib/navigation/final-navigation-groups.ts`

---

## Executive summary

| Metric | Count |
|--------|------:|
| Total App Router page routes | **770** |
| Dashboard routes (/dashboard/*) | **566** |
| Non-dashboard routes | **204** |
| Navigation categories (this audit) | **26** |
| Sidebar groups (production IA) | **12** |

The **566 dashboard routes** referenced in GTM and competitor materials match this scan. Total surface area is higher (770) because of storefront slugs, platform admin, vendor portal, marketing ICP pages, and internal visual-test routes.

---

## Category matrix

| Category | Routes | In sidebar? | Sales-safe? | Notes |
|----------|-------:|:-----------:|:-----------:|-------|
| Dashboard — Other modules | 239 | Orphan / deep link | Review | Largest sprawl bucket — consolidate or hide in pilot profile |
| Dashboard — Settings & locations | 65 | Partial | Qualified |  |
| Dashboard — Storefront & customers | 57 | Partial | Qualified |  |
| Platform admin | 57 | N/A | Yes | Super-admin only — not in tenant sidebar |
| Other public & utility | 41 | N/A | Yes |  |
| Dashboard — Integrations & channels | 41 | Partial | Qualified |  |
| Dashboard — Analytics & reports | 35 | Partial | Qualified |  |
| Dashboard — Menu, inventory & purchasing | 26 | Partial | Qualified |  |
| Public marketing & ICP | 24 | N/A | Yes |  |
| Storefront (guest) | 22 | N/A | Yes |  |
| Trust, legal & resources | 21 | N/A | Yes |  |
| Dashboard — Platform & developer | 19 | Orphan / deep link | Review |  |
| Dashboard — Staff & labor | 18 | Partial | Qualified |  |
| Developers & help | 17 | N/A | Yes |  |
| Dashboard — Demo, training & preview | 15 | Orphan / deep link | Review |  |
| Dashboard — Kitchen & production | 13 | Partial | Qualified |  |
| Dashboard — Marketplace | 11 | Partial | Qualified |  |
| Dashboard — POS & KDS | 11 | Partial | Qualified |  |
| Vendor portal | 11 | N/A | Yes |  |
| Dashboard — Food safety & compliance | 8 | Partial | Qualified |  |
| Dashboard — Orders & receivables | 6 | Partial | Qualified |  |
| Visual test (internal) | 4 | N/A | Yes | Exclude from GTM / sitemap |
| Auth | 3 | N/A | Yes |  |
| Dashboard — Today & command center | 2 | Partial | Qualified |  |
| Standalone operator surfaces | 2 | N/A | Yes |  |
| B2B pay flows | 2 | N/A | Yes |  |

---

## Dashboard route breakdown (566)

Grouped for pilot navigation review. Full route lists follow in [Appendix A](#appendix-a-full-route-inventory).

### Dashboard — Other modules (239)

- `/dashboard/accounting/bank-reconciliation`
- `/dashboard/accounting/cash-counts`
- `/dashboard/accounting/invoices`
- `/dashboard/accounting/vendor-payments`
- `/dashboard/audit-logs`
- `/dashboard/audit-logs/retention`
- `/dashboard/beta-applications`
- `/dashboard/brands`
- … +231 more (see appendix)

### Dashboard — Settings & locations (65)

- `/dashboard/billing`
- `/dashboard/billing/cancel`
- `/dashboard/billing/cancelled`
- `/dashboard/billing/entitlements`
- `/dashboard/billing/history`
- `/dashboard/billing/invoices`
- `/dashboard/billing/payment-method`
- `/dashboard/billing/plans`
- … +57 more (see appendix)

### Dashboard — Storefront & customers (57)

- `/dashboard/customers`
- `/dashboard/customers/[customerId]`
- `/dashboard/customers/allergies`
- `/dashboard/customers/at-risk`
- `/dashboard/customers/churn-risk`
- `/dashboard/customers/companies`
- `/dashboard/customers/dedupe`
- `/dashboard/customers/deduplication`
- … +49 more (see appendix)

### Dashboard — Integrations & channels (41)

- `/dashboard/integrations`
- `/dashboard/integrations/7shifts`
- `/dashboard/integrations/doordash`
- `/dashboard/integrations/extensions`
- `/dashboard/integrations/grubhub`
- `/dashboard/integrations/health`
- `/dashboard/integrations/homebase`
- `/dashboard/integrations/inventory-sync`
- … +33 more (see appendix)

### Dashboard — Analytics & reports (35)

- `/dashboard/analytics`
- `/dashboard/analytics/advanced`
- `/dashboard/analytics/benchmarks`
- `/dashboard/analytics/capital`
- `/dashboard/analytics/catering`
- `/dashboard/analytics/channels`
- `/dashboard/analytics/customers`
- `/dashboard/analytics/delivery`
- … +27 more (see appendix)

### Dashboard — Menu, inventory & purchasing (26)

- `/dashboard/inventory/counts`
- `/dashboard/inventory/counts/[countId]`
- `/dashboard/inventory/cross-channel`
- `/dashboard/inventory/demand`
- `/dashboard/inventory/demand/settings`
- `/dashboard/inventory/pos-impacts`
- `/dashboard/inventory/purchasing-ai`
- `/dashboard/inventory/receiving`
- … +18 more (see appendix)

### Dashboard — Platform & developer (19)

- `/dashboard/developer`
- `/dashboard/developer/api-keys`
- `/dashboard/developer/docs`
- `/dashboard/developer/flags`
- `/dashboard/developer/health`
- `/dashboard/developer/incidents`
- `/dashboard/developer/integrations`
- `/dashboard/developer/jobs`
- … +11 more (see appendix)

### Dashboard — Staff & labor (18)

- `/dashboard/playbooks/schedule`
- `/dashboard/staff`
- `/dashboard/staff/[staffId]`
- `/dashboard/staff/ai-scheduling`
- `/dashboard/staff/availability`
- `/dashboard/staff/certifications`
- `/dashboard/staff/drivers`
- `/dashboard/staff/labor-realtime`
- … +10 more (see appendix)

### Dashboard — Demo, training & preview (15)

- `/dashboard/demo/scenarios`
- `/dashboard/developer/email-preview`
- `/dashboard/training`
- `/dashboard/training/analytics`
- `/dashboard/training/assignments`
- `/dashboard/training/certifications`
- `/dashboard/training/kitchen`
- `/dashboard/training/manager`
- … +7 more (see appendix)

### Dashboard — Kitchen & production (13)

- `/dashboard/kitchen`
- `/dashboard/kitchen/cameras`
- `/dashboard/kitchen/fullscreen`
- `/dashboard/kitchen/tablet`
- `/dashboard/packing`
- `/dashboard/packing/reports`
- `/dashboard/packing/scanner`
- `/dashboard/packing/verify`
- … +5 more (see appendix)

### Dashboard — Marketplace (11)

- `/dashboard/marketplace`
- `/dashboard/marketplace/analytics`
- `/dashboard/marketplace/catalog`
- `/dashboard/marketplace/checkout`
- `/dashboard/marketplace/compare`
- `/dashboard/marketplace/orders`
- `/dashboard/marketplace/orders/[id]`
- `/dashboard/marketplace/products/[slug]`
- … +3 more (see appendix)

### Dashboard — POS & KDS (11)

- `/dashboard/pos`
- `/dashboard/pos/handheld`
- `/dashboard/pos/receipts`
- `/dashboard/pos/registers`
- `/dashboard/pos/reports`
- `/dashboard/pos/settings`
- `/dashboard/pos/settings/hardware`
- `/dashboard/pos/shifts`
- … +3 more (see appendix)

### Dashboard — Food safety & compliance (8)

- `/dashboard/compliance/experiment-audit`
- `/dashboard/food-safety`
- `/dashboard/food-safety/allergens`
- `/dashboard/food-safety/audits`
- `/dashboard/food-safety/audits/[auditId]`
- `/dashboard/food-safety/checklists`
- `/dashboard/food-safety/iot-devices`
- `/dashboard/food-safety/temperature`

### Dashboard — Orders & receivables (6)

- `/dashboard/orders`
- `/dashboard/orders/[orderId]`
- `/dashboard/orders/hub`
- `/dashboard/orders/new`
- `/dashboard/orders/quick`
- `/dashboard/receivables`

### Dashboard — Today & command center (2)

- `/dashboard`
- `/dashboard/today`

---

## Non-dashboard surfaces (204)

| Category | Routes | Primary audience |
|----------|-------:|------------------|
| Platform admin | 57 | — |
| Other public & utility | 41 | — |
| Public marketing & ICP | 24 | — |
| Storefront (guest) | 22 | — |
| Trust, legal & resources | 21 | — |
| Developers & help | 17 | — |
| Vendor portal | 11 | — |
| Visual test (internal) | 4 | — |
| Auth | 3 | — |
| Standalone operator surfaces | 2 | — |
| B2B pay flows | 2 | — |

---

## Sidebar IA alignment

Production sidebar groups (`FINAL_NAVIGATION_GROUPS`):

- **Core**
- **Operations**
- **Commerce**
- **Menus**
- **Customers**
- **Inventory & finance**
- **Food safety**
- **Marketing**
- **Insights**
- **Setup**
- **Admin**
- **Internal**

| Gap | Risk | Recommendation |
|-----|------|----------------|
| 239 routes in **Dashboard — Other modules** | Nav sprawl, demo confusion | Apply `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` to hide deep modules; see Task 71 nav-sprawl audit |
| Marketplace (11) now in sidebar | New — verify role matrix | Keep behind marketplace feature flag until migration deployed |
| Platform admin (57) outside tenant shell | Correct isolation | Document in enterprise procurement pack only |
| Visual test routes (4) | Accidental indexing | Add `robots` noindex or move under `/dashboard/demo` |

---

## Maturity & visibility

- **Module readiness badges:** `getModuleReadinessForPath()` in `dashboard-nav.tsx` — LIVE / BETA / PLACEHOLDER when `showNavStatusBadges()` enabled.
- **Role filtering:** `isDashboardPathAllowedForRole()` + `lib/nav-role-filter.ts` — STAFF vs OWNER strips.
- **Pilot profile:** `NavReleaseProfile` hides deep modules from sidebar without deleting routes.
- **Command palette:** `getCommandPaletteRoutesFromRegistry()` supplements sidebar for power users.

---

## Regenerate inventory

```bash
node scripts/generate-navigation-audit.mjs
```

---

## Related docs

- [`NAVIGATION_AND_MODULE_UX_AUDIT.md`](./NAVIGATION_AND_MODULE_UX_AUDIT.md) — UX patterns
- [`NAVIGATION_TAXONOMY_CLEANUP.md`](./NAVIGATION_TAXONOMY_CLEANUP.md) — consolidation plan
- [`bundle-analysis.md`](./bundle-analysis.md) — First Load JS by route class
- Task 71: `docs/nav-sprawl-audit.md` (deeper sprawl analysis)

---

## Appendix A — Full route inventory

### Dashboard — Other modules

- `/dashboard/accounting/bank-reconciliation`
- `/dashboard/accounting/cash-counts`
- `/dashboard/accounting/invoices`
- `/dashboard/accounting/vendor-payments`
- `/dashboard/audit-logs`
- `/dashboard/audit-logs/retention`
- `/dashboard/beta-applications`
- `/dashboard/brands`
- `/dashboard/brands/[brandId]`
- `/dashboard/brands/[brandId]/reports`
- `/dashboard/brands/assignment`
- `/dashboard/brands/command-center`
- `/dashboard/brands/multi-brand-setup`
- `/dashboard/brands/new`
- `/dashboard/brands/templates`
- `/dashboard/calendar`
- `/dashboard/catering`
- `/dashboard/catering-quotes`
- `/dashboard/catering-quotes/[quoteId]`
- `/dashboard/catering-quotes/accepted`
- `/dashboard/catering-quotes/follow-ups`
- `/dashboard/catering-quotes/new`
- `/dashboard/catering-quotes/pipeline`
- `/dashboard/catering-quotes/public-proposals`
- `/dashboard/catering-quotes/quotes`
- `/dashboard/catering-quotes/reports`
- `/dashboard/catering-quotes/settings`
- `/dashboard/catering-quotes/templates`
- `/dashboard/commissary/transfers`
- `/dashboard/copilot`
- `/dashboard/copilot/audit`
- `/dashboard/copilot/chat`
- `/dashboard/copilot/drafts`
- `/dashboard/copilot/insights`
- `/dashboard/copilot/settings`
- `/dashboard/copilot/sources`
- `/dashboard/copilot/summaries`
- `/dashboard/costing`
- `/dashboard/costing/alerts`
- `/dashboard/costing/avt`
- `/dashboard/costing/channel-fees`
- `/dashboard/costing/components`
- `/dashboard/costing/items`
- `/dashboard/costing/menus`
- `/dashboard/costing/recipes-missing`
- `/dashboard/costing/reports`
- `/dashboard/costing/scenarios`
- `/dashboard/costing/settings`
- `/dashboard/costing/theft`
- `/dashboard/crm/customers/[customerId]`
- `/dashboard/error-recovery`
- `/dashboard/executive`
- `/dashboard/executive/brands-locations`
- `/dashboard/executive/customers`
- `/dashboard/executive/operations`
- `/dashboard/executive/profitability`
- `/dashboard/executive/report`
- `/dashboard/executive/revenue`
- `/dashboard/executive/risks`
- `/dashboard/floor-plans`
- `/dashboard/forecast`
- `/dashboard/forecast/[runId]`
- `/dashboard/forecast/ai`
- `/dashboard/forecast/history`
- `/dashboard/forecast/new`
- `/dashboard/forecast/settings`
- `/dashboard/founder`
- `/dashboard/franchise/royalties`
- `/dashboard/gift-cards`
- `/dashboard/go-live`
- `/dashboard/go-live/projects/[projectId]`
- `/dashboard/go-live/test-run`
- `/dashboard/growth`
- `/dashboard/growth/accounts`
- `/dashboard/growth/advisory-board`
- `/dashboard/growth/content-library`
- `/dashboard/growth/customer-success`
- `/dashboard/growth/demo-requests`
- `/dashboard/growth/feedback`
- `/dashboard/growth/launch-analytics`
- `/dashboard/growth/leads`
- `/dashboard/growth/leads/[id]`
- `/dashboard/growth/onboarding-calls`
- `/dashboard/growth/outreach`
- `/dashboard/growth/partner-leads`
- `/dashboard/growth/referrals`
- `/dashboard/growth/roadmap`
- `/dashboard/growth/sales-inquiries`
- `/dashboard/growth/usage`
- `/dashboard/implementation`
- `/dashboard/implementation/[projectId]`
- `/dashboard/implementation/[projectId]/activity`
- `/dashboard/implementation/[projectId]/checklist`
- `/dashboard/implementation/[projectId]/go-live`
- `/dashboard/implementation/[projectId]/integrations`
- `/dashboard/implementation/[projectId]/migration`
- `/dashboard/implementation/[projectId]/risks`
- `/dashboard/implementation/[projectId]/timeline`
- `/dashboard/implementation/[projectId]/training`
- `/dashboard/implementation/[projectId]/uat`
- `/dashboard/implementation/activity`
- `/dashboard/implementation/checklist`
- `/dashboard/implementation/enterprise`
- `/dashboard/implementation/go-live`
- `/dashboard/implementation/handoff`
- `/dashboard/implementation/integrations`
- `/dashboard/implementation/migration`
- `/dashboard/implementation/new`
- `/dashboard/implementation/projects`
- `/dashboard/implementation/reports`
- `/dashboard/implementation/risks`
- `/dashboard/implementation/training`
- `/dashboard/implementation/uat`
- `/dashboard/import-center`
- `/dashboard/import-center/errors`
- `/dashboard/import-center/history`
- `/dashboard/import-center/jobs/[jobId]`
- `/dashboard/import-center/migrate`
- `/dashboard/import-center/settings`
- `/dashboard/import-center/templates`
- `/dashboard/import-center/upload`
- `/dashboard/import-export`
- `/dashboard/import-export/export`
- `/dashboard/import-export/exports`
- `/dashboard/import-export/import`
- `/dashboard/import-export/imports`
- `/dashboard/import-export/imports/[jobId]`
- `/dashboard/import-export/settings`
- `/dashboard/import-export/templates`
- `/dashboard/import-export/validation-errors`
- `/dashboard/integration-health`
- `/dashboard/launch-wizard`
- `/dashboard/marketing/email-campaigns`
- `/dashboard/marketing/holiday-packages`
- `/dashboard/meal-plans`
- `/dashboard/meal-plans/[planId]`
- `/dashboard/meal-plans/active`
- `/dashboard/meal-plans/customers`
- `/dashboard/meal-plans/cycles`
- `/dashboard/meal-plans/generated`
- `/dashboard/meal-plans/needs-review`
- `/dashboard/meal-plans/new`
- `/dashboard/meal-plans/paused`
- `/dashboard/meal-plans/reports`
- `/dashboard/meal-plans/settings`
- `/dashboard/meal-plans/templates`
- `/dashboard/meal-subscriptions`
- `/dashboard/notifications`
- `/dashboard/notifications/alerts`
- `/dashboard/notifications/log`
- `/dashboard/notifications/preferences`
- `/dashboard/notifications/provider`
- `/dashboard/notifications/retry`
- `/dashboard/notifications/rules`
- `/dashboard/notifications/settings`
- `/dashboard/notifications/templates`
- `/dashboard/nutrition-labels`
- `/dashboard/nutrition-labels/import`
- `/dashboard/nutrition-labels/items/[productId]`
- `/dashboard/nutrition-labels/print-queue`
- `/dashboard/nutrition-labels/reports`
- `/dashboard/operations/audits`
- `/dashboard/operations/audits/[auditId]`
- `/dashboard/operations/checklists`
- `/dashboard/operations/compliance`
- `/dashboard/partner`
- `/dashboard/playbooks`
- `/dashboard/playbooks/[playbookId]`
- `/dashboard/playbooks/active`
- `/dashboard/playbooks/all`
- `/dashboard/playbooks/custom`
- `/dashboard/playbooks/new`
- `/dashboard/playbooks/reports`
- `/dashboard/playbooks/runs/[runId]`
- `/dashboard/playbooks/settings`
- `/dashboard/playbooks/templates`
- `/dashboard/product-mapping`
- `/dashboard/product-mapping/activity`
- `/dashboard/product-mapping/aliases`
- `/dashboard/product-mapping/approved`
- `/dashboard/product-mapping/batches`
- `/dashboard/product-mapping/bulk`
- `/dashboard/product-mapping/conflicts`
- `/dashboard/product-mapping/health`
- `/dashboard/product-mapping/modifiers`
- `/dashboard/product-mapping/settings`
- `/dashboard/product-mapping/suggestions`
- `/dashboard/product-mapping/unmapped`
- `/dashboard/products`
- `/dashboard/products/[productId]`
- `/dashboard/products/import`
- `/dashboard/products/new`
- `/dashboard/recipes/yield`
- `/dashboard/referrals`
- `/dashboard/reservations`
- `/dashboard/routes`
- `/dashboard/routes/[routeId]`
- `/dashboard/routes/[routeId]/driver`
- `/dashboard/routes/[routeId]/manifest`
- `/dashboard/routes/driver`
- `/dashboard/routes/drivers`
- `/dashboard/routes/fleet`
- `/dashboard/routes/optimize`
- `/dashboard/routes/planner`
- `/dashboard/routes/reports`
- `/dashboard/routes/settings`
- `/dashboard/routes/uber-direct`
- `/dashboard/routes/zones`
- `/dashboard/scan`
- `/dashboard/security/audit-logs`
- `/dashboard/support`
- `/dashboard/support/[ticketId]`
- `/dashboard/support/inbox`
- `/dashboard/support/kb`
- `/dashboard/support/kb/[slug]`
- `/dashboard/support/reports`
- `/dashboard/tables`
- `/dashboard/tasks`
- `/dashboard/tasks/[taskId]`
- `/dashboard/tasks/calendar`
- `/dashboard/tasks/kanban`
- `/dashboard/tasks/list`
- `/dashboard/tasks/my`
- `/dashboard/tasks/new`
- `/dashboard/tasks/recurring`
- `/dashboard/tasks/reports`
- `/dashboard/tasks/settings`
- `/dashboard/tasks/templates`
- `/dashboard/templates`
- `/dashboard/templates/[templateKey]`
- `/dashboard/templates/[templateKey]/apply`
- `/dashboard/templates/all`
- `/dashboard/templates/history`
- `/dashboard/templates/imports`
- `/dashboard/templates/module-packs`
- `/dashboard/templates/playbooks`
- `/dashboard/templates/starters`
- `/dashboard/templates/storefront`
- `/dashboard/workspace/experiments`

### Dashboard — Settings & locations

- `/dashboard/billing`
- `/dashboard/billing/cancel`
- `/dashboard/billing/cancelled`
- `/dashboard/billing/entitlements`
- `/dashboard/billing/history`
- `/dashboard/billing/invoices`
- `/dashboard/billing/payment-method`
- `/dashboard/billing/plans`
- `/dashboard/billing/settings`
- `/dashboard/billing/success`
- `/dashboard/billing/usage`
- `/dashboard/locations`
- `/dashboard/locations/[locationId]`
- `/dashboard/locations/[locationId]/brands`
- `/dashboard/locations/[locationId]/fulfillment`
- `/dashboard/locations/[locationId]/hours`
- `/dashboard/locations/[locationId]/inventory`
- `/dashboard/locations/[locationId]/menus`
- `/dashboard/locations/[locationId]/orders`
- `/dashboard/locations/[locationId]/production`
- `/dashboard/locations/[locationId]/profile`
- `/dashboard/locations/[locationId]/reports`
- `/dashboard/locations/[locationId]/routes`
- `/dashboard/locations/[locationId]/settings`
- `/dashboard/locations/active`
- `/dashboard/locations/assignment`
- `/dashboard/locations/dashboard`
- `/dashboard/locations/new`
- `/dashboard/locations/reports`
- `/dashboard/locations/settings`
- `/dashboard/locations/setup`
- `/dashboard/locations/templates`
- `/dashboard/settings`
- `/dashboard/settings/advanced`
- `/dashboard/settings/ai`
- `/dashboard/settings/automation`
- `/dashboard/settings/backups`
- `/dashboard/settings/billing`
- `/dashboard/settings/branding`
- `/dashboard/settings/compliance`
- `/dashboard/settings/crm`
- `/dashboard/settings/delivery`
- `/dashboard/settings/delivery-zones`
- `/dashboard/settings/developer`
- `/dashboard/settings/domains`
- `/dashboard/settings/imports`
- `/dashboard/settings/integrations`
- `/dashboard/settings/modules`
- `/dashboard/settings/notifications`
- `/dashboard/settings/notifications/push`
- `/dashboard/settings/notifications/sms`
- `/dashboard/settings/notifications/whatsapp`
- `/dashboard/settings/operations`
- `/dashboard/settings/orders`
- `/dashboard/settings/packing`
- `/dashboard/settings/pos`
- `/dashboard/settings/production`
- `/dashboard/settings/profile`
- `/dashboard/settings/routes`
- `/dashboard/settings/security`
- `/dashboard/settings/security/sso`
- `/dashboard/settings/staff`
- `/dashboard/settings/storefront`
- `/dashboard/settings/white-label`
- `/dashboard/settings/workspace`

### Dashboard — Storefront & customers

- `/dashboard/customers`
- `/dashboard/customers/[customerId]`
- `/dashboard/customers/allergies`
- `/dashboard/customers/at-risk`
- `/dashboard/customers/churn-risk`
- `/dashboard/customers/companies`
- `/dashboard/customers/dedupe`
- `/dashboard/customers/deduplication`
- `/dashboard/customers/feedback`
- `/dashboard/customers/follow-ups`
- `/dashboard/customers/list`
- `/dashboard/customers/loyalty`
- `/dashboard/customers/new`
- `/dashboard/customers/reports`
- `/dashboard/customers/segments`
- `/dashboard/customers/vip`
- `/dashboard/order-hub`
- `/dashboard/storefront`
- `/dashboard/storefront/advanced`
- `/dashboard/storefront/analytics`
- `/dashboard/storefront/builder`
- `/dashboard/storefront/cart-recovery`
- `/dashboard/storefront/catalog`
- `/dashboard/storefront/discounts`
- `/dashboard/storefront/domains`
- `/dashboard/storefront/forms`
- `/dashboard/storefront/forms/[formId]`
- `/dashboard/storefront/forms/[formId]/submissions`
- `/dashboard/storefront/forms/new`
- `/dashboard/storefront/fulfillment`
- `/dashboard/storefront/gift-cards`
- `/dashboard/storefront/inventory`
- `/dashboard/storefront/launch`
- `/dashboard/storefront/loyalty`
- `/dashboard/storefront/marketing`
- `/dashboard/storefront/markets`
- `/dashboard/storefront/media`
- `/dashboard/storefront/menu`
- `/dashboard/storefront/notifications`
- `/dashboard/storefront/ordering`
- `/dashboard/storefront/pages`
- `/dashboard/storefront/pages/[pageId]`
- `/dashboard/storefront/pickup-windows`
- `/dashboard/storefront/preview`
- `/dashboard/storefront/products`
- `/dashboard/storefront/redirects`
- `/dashboard/storefront/referrals`
- `/dashboard/storefront/reservations`
- `/dashboard/storefront/reviews`
- `/dashboard/storefront/seo`
- `/dashboard/storefront/settings`
- `/dashboard/storefront/settings/experiments`
- `/dashboard/storefront/team`
- `/dashboard/storefront/team/audit`
- `/dashboard/storefront/theme`
- `/dashboard/storefront/website`
- `/dashboard/storefront/workspace`

### Platform admin

- `/platform`
- `/platform/accounts`
- `/platform/audit`
- `/platform/automations`
- `/platform/beta-applications`
- `/platform/billing`
- `/platform/capital-partners`
- `/platform/customer-success`
- `/platform/dashboard`
- `/platform/demo`
- `/platform/entitlements`
- `/platform/error-recovery`
- `/platform/errors`
- `/platform/feature-flags`
- `/platform/go-live`
- `/platform/growth-crm`
- `/platform/health`
- `/platform/implementations`
- `/platform/incidents`
- `/platform/integrations`
- `/platform/jobs`
- `/platform/marketplace/analytics`
- `/platform/marketplace/disputes`
- `/platform/marketplace/products`
- `/platform/marketplace/vendor-verification`
- `/platform/marketplace/vendors`
- `/platform/marketplace/vendors/[id]`
- `/platform/notifications`
- `/platform/organizations`
- `/platform/partner`
- `/platform/partner-apps`
- `/platform/partner-billing`
- `/platform/plans`
- `/platform/platform-users`
- `/platform/pos`
- `/platform/preview/[userId]`
- `/platform/revenue`
- `/platform/roles`
- `/platform/runbooks`
- `/platform/search`
- `/platform/settings`
- `/platform/support`
- `/platform/support/[ticketId]`
- `/platform/support/escalations`
- `/platform/support/knowledge-base`
- `/platform/support/queue`
- `/platform/system-health`
- `/platform/tasks/remediation/[taskId]`
- `/platform/tools`
- `/platform/tools/db-health`
- `/platform/training`
- `/platform/trials`
- `/platform/users`
- `/platform/webhooks`
- `/platform/workspaces`
- `/platform/workspaces/[workspaceId]`
- `/platform/workspaces/[workspaceId]/integration-health`

### Other public & utility

- `/advisory-board`
- `/api/docs`
- `/b/[brandSlug]`
- `/beta`
- `/capabilities`
- `/case-studies/[slug]`
- `/changelog`
- `/contact-sales`
- `/customers`
- `/customers/[id]`
- `/get-started`
- `/implementation-service`
- `/integrations`
- `/integrations/manual-orders`
- `/integrations/public-storefront`
- `/integrations/shopify`
- `/integrations/shopify/app`
- `/integrations/uber-direct`
- `/integrations/uber-eats`
- `/integrations/woocommerce`
- `/integrations/woocommerce/extension`
- `/invite/[token]`
- `/locations/[city]`
- `/lp/[slug]`
- `/lp/[slug]/[metro]`
- `/markets/canada`
- `/markets/europe`
- `/markets/united-kingdom`
- `/markets/united-states`
- `/onboarding`
- `/order/[token]`
- `/page.tsx`
- `/partner`
- `/partner/clients`
- `/partner/clients/[id]`
- `/partner/implementation`
- `/partner/revenue`
- `/partners`
- `/quote/[token]`
- `/service-areas`
- `/status`

### Dashboard — Integrations & channels

- `/dashboard/integrations`
- `/dashboard/integrations/7shifts`
- `/dashboard/integrations/doordash`
- `/dashboard/integrations/extensions`
- `/dashboard/integrations/grubhub`
- `/dashboard/integrations/health`
- `/dashboard/integrations/homebase`
- `/dashboard/integrations/inventory-sync`
- `/dashboard/integrations/oauth-apps`
- `/dashboard/integrations/oauth-apps/[clientId]/embed`
- `/dashboard/integrations/oauth-apps/consent`
- `/dashboard/integrations/outbound-webhooks`
- `/dashboard/integrations/quickbooks`
- `/dashboard/integrations/shopify`
- `/dashboard/integrations/uber-direct`
- `/dashboard/integrations/uber-eats`
- `/dashboard/integrations/webhooks`
- `/dashboard/integrations/woocommerce`
- `/dashboard/integrations/woocommerce-subscriptions`
- `/dashboard/integrations/xero`
- `/dashboard/sales-channels`
- `/dashboard/sales-channels/[providerKey]/setup`
- `/dashboard/sales-channels/analytics`
- `/dashboard/sales-channels/assistant`
- `/dashboard/sales-channels/attention`
- `/dashboard/sales-channels/available`
- `/dashboard/sales-channels/conflicts`
- `/dashboard/sales-channels/connected`
- `/dashboard/sales-channels/connections/[connectionId]`
- `/dashboard/sales-channels/handoff`
- `/dashboard/sales-channels/health`
- `/dashboard/sales-channels/imports/[batchId]`
- `/dashboard/sales-channels/mapping`
- `/dashboard/sales-channels/reliability`
- `/dashboard/sales-channels/rules`
- `/dashboard/sales-channels/settings`
- `/dashboard/sales-channels/simulator`
- `/dashboard/sales-channels/staging`
- `/dashboard/sales-channels/sync-jobs`
- `/dashboard/sales-channels/webhook-lab`
- `/dashboard/sales-channels/webhooks`

### Dashboard — Analytics & reports

- `/dashboard/analytics`
- `/dashboard/analytics/advanced`
- `/dashboard/analytics/benchmarks`
- `/dashboard/analytics/capital`
- `/dashboard/analytics/catering`
- `/dashboard/analytics/channels`
- `/dashboard/analytics/customers`
- `/dashboard/analytics/delivery`
- `/dashboard/analytics/delivery-channels`
- `/dashboard/analytics/digital-twin`
- `/dashboard/analytics/food-cost`
- `/dashboard/analytics/forecasting`
- `/dashboard/analytics/inventory`
- `/dashboard/analytics/meal-plans`
- `/dashboard/analytics/orders`
- `/dashboard/analytics/production`
- `/dashboard/analytics/reports`
- `/dashboard/analytics/revenue`
- `/dashboard/analytics/saved-views`
- `/dashboard/reports`
- `/dashboard/reports/[reportKey]`
- `/dashboard/reports/catalog`
- `/dashboard/reports/catalog/builder`
- `/dashboard/reports/enterprise`
- `/dashboard/reports/executive`
- `/dashboard/reports/financial`
- `/dashboard/reports/financial/pnl`
- `/dashboard/reports/history`
- `/dashboard/reports/labor`
- `/dashboard/reports/library`
- `/dashboard/reports/menu-engineering`
- `/dashboard/reports/operations`
- `/dashboard/reports/saved`
- `/dashboard/reports/settings`
- `/dashboard/reports/tax`

### Dashboard — Menu, inventory & purchasing

- `/dashboard/inventory/counts`
- `/dashboard/inventory/counts/[countId]`
- `/dashboard/inventory/cross-channel`
- `/dashboard/inventory/demand`
- `/dashboard/inventory/demand/settings`
- `/dashboard/inventory/pos-impacts`
- `/dashboard/inventory/purchasing-ai`
- `/dashboard/inventory/receiving`
- `/dashboard/inventory/waste`
- `/dashboard/menu-planner`
- `/dashboard/menu/universal`
- `/dashboard/menus`
- `/dashboard/menus/[menuId]`
- `/dashboard/menus/[menuId]/reports`
- `/dashboard/menus/new`
- `/dashboard/menus/templates`
- `/dashboard/purchasing`
- `/dashboard/purchasing/bulk-pricing`
- `/dashboard/purchasing/direct-ordering`
- `/dashboard/purchasing/exports`
- `/dashboard/purchasing/price-history`
- `/dashboard/purchasing/purchase-orders`
- `/dashboard/purchasing/purchase-orders/[poId]`
- `/dashboard/purchasing/receiving`
- `/dashboard/purchasing/reorder-queue`
- `/dashboard/purchasing/suppliers`

### Public marketing & ICP

- `/blog`
- `/blog/ghost-kitchen-setup-complete-guide`
- `/blog/how-to-choose-restaurant-pos-2026`
- `/blog/how-to-start-meal-prep-business`
- `/blog/meal-prep-order-queue-cut-packing-errors`
- `/blog/reduce-food-waste-with-production-planning`
- `/blog/restaurant-pos-comparison-2026`
- `/book-demo`
- `/compare`
- `/compare/[slug]`
- `/deck`
- `/demo`
- `/demo/[slug]`
- `/landing/ghost-kitchen`
- `/landing/meal-prep`
- `/landing/weekly-preorder`
- `/pricing`
- `/product`
- `/product/[slug]`
- `/product/pos-terminal`
- `/roi-calculator`
- `/shopify`
- `/solutions`
- `/solutions/[slug]`

### Storefront (guest)

- `/s/[storeSlug]`
- `/s/[storeSlug]/about`
- `/s/[storeSlug]/account`
- `/s/[storeSlug]/cart`
- `/s/[storeSlug]/catering`
- `/s/[storeSlug]/checkout`
- `/s/[storeSlug]/collections/[collectionSlug]`
- `/s/[storeSlug]/contact`
- `/s/[storeSlug]/daily-menu`
- `/s/[storeSlug]/faq`
- `/s/[storeSlug]/gift-cards`
- `/s/[storeSlug]/menu`
- `/s/[storeSlug]/order-confirmation/[token]`
- `/s/[storeSlug]/order/[token]`
- `/s/[storeSlug]/orders/[orderId]/track`
- `/s/[storeSlug]/p/[pageSlug]`
- `/s/[storeSlug]/policies/privacy`
- `/s/[storeSlug]/policies/terms`
- `/s/[storeSlug]/products/[productRef]`
- `/s/[storeSlug]/reservations`
- `/s/[storeSlug]/track/[orderId]`
- `/s/[storeSlug]/waitlist`

### Trust, legal & resources

- `/legal/acceptable-use`
- `/legal/cookie-policy`
- `/legal/data-rights`
- `/legal/dpa`
- `/legal/privacy`
- `/legal/security`
- `/legal/terms`
- `/resources`
- `/resources/catering-production-workflow`
- `/resources/kitchen-production-planning`
- `/resources/meal-prep-operations`
- `/resources/packing-labels-for-meal-prep`
- `/resources/restaurant-financing`
- `/resources/shopify-meal-prep-store`
- `/resources/woocommerce-food-orders`
- `/support`
- `/support/contact`
- `/support/feature-request`
- `/support/status`
- `/trust`
- `/trust/status`

### Dashboard — Platform & developer

- `/dashboard/developer`
- `/dashboard/developer/api-keys`
- `/dashboard/developer/docs`
- `/dashboard/developer/flags`
- `/dashboard/developer/health`
- `/dashboard/developer/incidents`
- `/dashboard/developer/integrations`
- `/dashboard/developer/jobs`
- `/dashboard/developer/logs`
- `/dashboard/developer/performance`
- `/dashboard/developer/releases`
- `/dashboard/developer/tools`
- `/dashboard/developer/webhooks`
- `/dashboard/platform/mutation-registry`
- `/dashboard/system-health`
- `/dashboard/system-health/cron-execution`
- `/dashboard/system-health/cron-execution/[slug]`
- `/dashboard/system-health/data-integrity`
- `/dashboard/system-health/incidents`

### Dashboard — Staff & labor

- `/dashboard/playbooks/schedule`
- `/dashboard/staff`
- `/dashboard/staff/[staffId]`
- `/dashboard/staff/ai-scheduling`
- `/dashboard/staff/availability`
- `/dashboard/staff/certifications`
- `/dashboard/staff/drivers`
- `/dashboard/staff/labor-realtime`
- `/dashboard/staff/payroll`
- `/dashboard/staff/reports`
- `/dashboard/staff/roles`
- `/dashboard/staff/roster`
- `/dashboard/staff/schedule`
- `/dashboard/staff/shifts`
- `/dashboard/staff/team`
- `/dashboard/staff/time-clock`
- `/dashboard/staff/tip-pooling`
- `/dashboard/storefront/schedule`

### Developers & help

- `/developers`
- `/developers/apps/register`
- `/developers/docs`
- `/developers/embed-demo`
- `/developers/webhooks`
- `/help`
- `/help/billing`
- `/help/data-export`
- `/help/faq`
- `/help/getting-started`
- `/help/import-export`
- `/help/integrations`
- `/help/order-hub`
- `/help/packing`
- `/help/production`
- `/help/products-skus`
- `/help/uber-eats`

### Dashboard — Demo, training & preview

- `/dashboard/demo/scenarios`
- `/dashboard/developer/email-preview`
- `/dashboard/training`
- `/dashboard/training/analytics`
- `/dashboard/training/assignments`
- `/dashboard/training/certifications`
- `/dashboard/training/kitchen`
- `/dashboard/training/manager`
- `/dashboard/training/packing`
- `/dashboard/training/practice`
- `/dashboard/training/programs`
- `/dashboard/training/programs/[programId]`
- `/dashboard/training/simulations`
- `/dashboard/training/sops`
- `/dashboard/training/tablet`

### Dashboard — Kitchen & production

- `/dashboard/kitchen`
- `/dashboard/kitchen/cameras`
- `/dashboard/kitchen/fullscreen`
- `/dashboard/kitchen/tablet`
- `/dashboard/packing`
- `/dashboard/packing/reports`
- `/dashboard/packing/scanner`
- `/dashboard/packing/verify`
- `/dashboard/production`
- `/dashboard/production/batches/[batchId]`
- `/dashboard/production/calendar`
- `/dashboard/production/reports`
- `/dashboard/production/templates`

### Dashboard — Marketplace

- `/dashboard/marketplace`
- `/dashboard/marketplace/analytics`
- `/dashboard/marketplace/catalog`
- `/dashboard/marketplace/checkout`
- `/dashboard/marketplace/compare`
- `/dashboard/marketplace/orders`
- `/dashboard/marketplace/orders/[id]`
- `/dashboard/marketplace/products/[slug]`
- `/dashboard/marketplace/vendors`
- `/dashboard/marketplace/vendors/[id]`
- `/dashboard/marketplace/wishlist`

### Dashboard — POS & KDS

- `/dashboard/pos`
- `/dashboard/pos/handheld`
- `/dashboard/pos/receipts`
- `/dashboard/pos/registers`
- `/dashboard/pos/reports`
- `/dashboard/pos/settings`
- `/dashboard/pos/settings/hardware`
- `/dashboard/pos/shifts`
- `/dashboard/pos/tabs`
- `/dashboard/pos/terminal`
- `/dashboard/pos/transactions`

### Vendor portal

- `/vendor/analytics`
- `/vendor/dashboard`
- `/vendor/finance`
- `/vendor/orders`
- `/vendor/orders/[id]`
- `/vendor/products`
- `/vendor/products/[id]/edit`
- `/vendor/products/new`
- `/vendor/register`
- `/vendor/register/status`
- `/vendor/settings`

### Dashboard — Food safety & compliance

- `/dashboard/compliance/experiment-audit`
- `/dashboard/food-safety`
- `/dashboard/food-safety/allergens`
- `/dashboard/food-safety/audits`
- `/dashboard/food-safety/audits/[auditId]`
- `/dashboard/food-safety/checklists`
- `/dashboard/food-safety/iot-devices`
- `/dashboard/food-safety/temperature`

### Dashboard — Orders & receivables

- `/dashboard/orders`
- `/dashboard/orders/[orderId]`
- `/dashboard/orders/hub`
- `/dashboard/orders/new`
- `/dashboard/orders/quick`
- `/dashboard/receivables`

### Visual test (internal)

- `/visual-test/checkout-shell`
- `/visual-test/collection-preview`
- `/visual-test/nav-tokens`
- `/visual-test/theme-presets`

### Auth

- `/forgot-password`
- `/login`
- `/signup`

### Dashboard — Today & command center

- `/dashboard`
- `/dashboard/today`

### Standalone operator surfaces

- `/driver`
- `/kds`

### B2B pay flows

- `/pay/b2b/[token]`
- `/pay/b2b/batch/[token]`

