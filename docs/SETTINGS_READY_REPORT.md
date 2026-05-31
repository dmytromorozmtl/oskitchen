# Settings Center — Ready Report

The Settings Center transformation is complete. OS Kitchen now ships a 25-route
sidebar-driven admin that controls workspace identity, operations, fulfillment,
customers, storefront, platform integrations, security, compliance, and
developer tooling — without rebuilding the rest of the app.

## Hard constraints respected

- Existing `/dashboard/settings` lands on the new Control Center; the legacy
  `SettingsForm` (`KitchenSettings` scalar columns) is preserved on the Workspace
  page so nothing already configured stops working.
- All schema work is additive: one new JSONB column (`settings_center_json`)
  on `kitchen_settings`. No data migrated, no enums changed, no destructive ops.
- Stripe / Resend / Twilio / Slack / Webhook secrets are never returned to the
  client — only boolean diagnostics + non-secret metadata.
- TypeScript strict + Prisma stable. `npm run typecheck` and `npm run build`
  both pass (build output shows all 25 routes compiled).
- `workspace.moroz@gmail.com` keeps full super-admin bypass through a single
  canonical helper (`isSuperAdminEmail`).

## What shipped

### Audit + planning

- `docs/SETTINGS_MODULE_AUDIT.md` — 28-issue priority audit of the pre-rebuild
  Settings surface, including data model and section map for the new center.

### Architecture

- `lib/settings/section-registry.ts` — single source of truth for 25 sections
  (icons, descriptions, capabilities, bridge flag, search keywords).
- `lib/settings/settings-defaults.ts` — `SettingsCenterPayload` type, defaults,
  and `mergeSettingsCenter()` deep-merge.
- `lib/settings/settings-permissions.ts` — RBAC mapping + super-admin bypass.
- `lib/settings/health-score.ts` — weighted per-section checks + overall
  readiness + tone classifier.
- `lib/settings/business-mode-presets.ts` — per-mode defaults (Meal prep,
  Catering, Ghost kitchen, Cloud kitchen, Multi-brand, Bakery, Restaurant,
  Café, Bar, Other).

### Database

- Migration `prisma/migrations/20260528100000_settings_center` adds
  `kitchen_settings.settings_center_json` (JSONB, nullable, idempotent).
- Prisma schema updated with the new column.

### Services

- `services/settings/settings-center-service.ts` — load + transactional section
  / multi-section writers.
- `services/settings/settings-health-service.ts` — combines the payload with
  live counts (rules, domains, integrations) and provider diagnostics.

### Server Actions

- `actions/settings-center.ts` — 16 Zod-validated, capability-gated actions
  covering every form-backed section plus `applyBusinessModePreset`.

### UI components

- `components/dashboard/settings/settings-sidebar.tsx` (search, pinned, recent,
  grouped, keyboard-friendly).
- `components/dashboard/settings/settings-mobile-drawer.tsx`.
- `components/dashboard/settings/section-header.tsx` (consistent header for
  every page, breadcrumbs, bridge badge).
- `components/dashboard/settings/sticky-save-bar.tsx` (dirty-state save bar
  with `beforeunload` guard).
- `components/dashboard/settings/health-overview.tsx`,
  `quick-actions.tsx`, `platform-status-grid.tsx`, `bridge-card.tsx`.
- 16 per-section form components in `components/dashboard/settings/forms/`.
- New `components/ui/progress.tsx` (simple accessible progress bar).

### Pages

| Route | Type | Notes |
| --- | --- | --- |
| `/dashboard/settings` | Real | Control Center (health + quick actions + status). |
| `/dashboard/settings/workspace` | Real | Business mode, identity, hours, legacy preferences. |
| `/dashboard/settings/modules` | Real | Existing module visibility editor — rewrapped. |
| `/dashboard/settings/operations` | Real | Prep lead, capacity, stations, allergen protocol. |
| `/dashboard/settings/orders` | Real | Auto-confirm, approvals, payment modes, escalation. |
| `/dashboard/settings/production` | Real | Shifts, batching, SLA, auto-printing. |
| `/dashboard/settings/packing` | Real | Stages, QC, label template, scan-to-verify. |
| `/dashboard/settings/delivery` | Real | Radius, fees, dispatch, courier preference. |
| `/dashboard/settings/routes` | Real | Optimization, max stops, buffer. |
| `/dashboard/settings/crm` | Real | VIP thresholds, churn, loyalty, tags. |
| `/dashboard/settings/storefront` | Bridge | Links to `/dashboard/storefronts`. |
| `/dashboard/settings/branding` | Real | Existing branding form — rewrapped. |
| `/dashboard/settings/domains` | Bridge | Lists `StorefrontDomain` rows. |
| `/dashboard/settings/notifications` | Bridge | Health snapshot for Notification Center. |
| `/dashboard/settings/integrations` | Bridge | Lists `IntegrationConnection` rows. |
| `/dashboard/settings/billing` | Bridge | Plan + usage + Stripe diagnostics. |
| `/dashboard/settings/staff` | Bridge | Staff counts + default role catalog. |
| `/dashboard/settings/security` | Bridge | Hardening checklist + audit link. |
| `/dashboard/settings/automation` | Real + bridge | Default retry/backoff + starter templates. |
| `/dashboard/settings/ai` | Real | Provider status + toggles + prompt presets. |
| `/dashboard/settings/imports` | Bridge | Links to Import Center. |
| `/dashboard/settings/backups` | Real | Schedule, retention, snapshot-before-imports. |
| `/dashboard/settings/compliance` | Real | Jurisdiction, retention, disclaimers. |
| `/dashboard/settings/developer` | Real + bridge | Webhook/API counts + toggles. |
| `/dashboard/settings/advanced` | Real | Workspace archive + transfer email. |
| `/dashboard/settings/white-label` | Existing | Enterprise placeholder cards (untouched). |

### Documentation

- `docs/SETTINGS_MODULE_AUDIT.md`
- `docs/SETTINGS_ARCHITECTURE.md`
- `docs/SETTINGS_PERMISSIONS.md`
- `docs/SETTINGS_READY_REPORT.md` (this file)

## Verification

```
npm run typecheck   →  passes
npm run build       →  passes; 25 Settings routes compile
```

## Out of scope / deferred

- SMS / push / Slack / Teams / Discord / WhatsApp send paths: provider plumbing
  remains email-only; channel registry can be extended additively.
- DNS automation for custom domains: still operator-driven through the
  Storefront Center.
- Visual canvas for automation workflows: Settings exposes defaults and links to
  the existing rule editors; no new canvas is introduced.
- Multi-brand / franchise per-brand permission UI: Settings exposes the
  architectural primitives (modules, roles, brand IDs), but rich per-brand
  override forms remain a future enhancement.
- Automated database snapshots: the Backups page persists preferences, the
  actual schedule runs against the Supabase storage strategy chosen by the
  operator. The page documents this clearly.

## Operator next steps

1. Visit `/dashboard/settings` and triage the workspace readiness tiles.
2. Run the Workspace section to fill in legal name, tax IDs, support contacts,
   and hours.
3. Pick a Business mode preset — Operations / Orders / Delivery defaults
   update without overwriting other data.
4. Configure Operations + Orders + Delivery to match your actual SLAs.
5. Walk the Notifications + Integrations + Billing bridges to ensure the
   external providers are healthy.
6. Use Compliance + Security + Developer to lock down the workspace.
7. Pin your three most-used sections in the sidebar — they’ll appear at the
   top of the section list per browser.
