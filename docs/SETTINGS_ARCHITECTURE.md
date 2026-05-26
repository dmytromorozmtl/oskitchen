# Settings Center Architecture

This document explains how the KitchenOS Settings Center is wired together — the
section registry, permissions, JSON payload, services, actions, and UI surfaces.

## Goals

- **Sidebar-driven admin.** 25 top-level Settings routes, persistent sidebar on desktop and bottom-drawer on mobile.
- **Operationally meaningful.** Every section either persists real configuration (Workspace, Operations, Orders, Production, Packing, Delivery, Routes, CRM, Compliance, AI, Automation, Backups, Developer, Advanced) or bridges into an existing center (Storefront, Branding, Domains, Notifications, Integrations, Billing, Staff, Security, Imports).
- **Health-aware.** A weighted check engine produces per-section scores and a single workspace readiness number.
- **Safe.** Additive Prisma migration only. Legacy `KitchenSettings` columns remain authoritative for already-deployed flows.

## Directory layout

```
lib/settings/
  section-registry.ts          # 25 sections, groups, icons, capabilities
  settings-defaults.ts         # SettingsCenterPayload type + defaults + deep merge
  settings-permissions.ts      # role grants, super-admin bypass
  business-mode-presets.ts     # per-mode defaults applied when switching mode
  health-score.ts              # weighted checks + overallReadiness + tone

services/settings/
  settings-center-service.ts   # load + transactional section/payload writers
  settings-health-service.ts   # external context + sections health snapshot

actions/
  settings-center.ts           # All Server Actions (Zod-validated, permission-gated)

components/dashboard/settings/
  settings-sidebar.tsx         # search + pinned + recent + grouped sections
  settings-mobile-drawer.tsx   # bottom drawer on lg- viewports
  section-header.tsx           # consistent header for every section
  sticky-save-bar.tsx          # dirty-state save bar with beforeunload guard
  health-overview.tsx          # health card with per-section tiles
  platform-status-grid.tsx     # status grid for Stripe/Resend/queues/etc.
  quick-actions.tsx            # 10 quick actions for the Control Center
  bridge-card.tsx              # reusable card that links to an existing center
  forms/                        # per-section client forms (toast + sticky save)
    workspace-identity-form.tsx
    business-hours-form.tsx
    business-mode-form.tsx
    operations-form.tsx
    orders-form.tsx
    production-form.tsx
    packing-form.tsx
    delivery-form.tsx
    routes-form.tsx
    crm-form.tsx
    ai-form.tsx
    automation-form.tsx
    backups-form.tsx
    compliance-form.tsx
    developer-form.tsx
    advanced-form.tsx

app/dashboard/settings/
  layout.tsx                   # session guard + sidebar shell
  page.tsx                     # Control Center overview
  workspace/page.tsx           # business mode + identity + hours + legacy form
  operations/page.tsx          # prep lead times, stations, allergen protocol
  orders/page.tsx              # auto-confirm, approvals, payment modes, escalation
  production/page.tsx          # shifts, batching, SLA, auto-printing
  packing/page.tsx             # stages, QC, label template, scan-to-verify
  delivery/page.tsx            # radius, fees, dispatch, courier preference
  routes/page.tsx              # optimization, max stops, buffer
  crm/page.tsx                 # VIP thresholds, churn, loyalty, tags
  ai/page.tsx                  # provider + token cap + prompt presets
  automation/page.tsx          # defaults + starter templates
  backups/page.tsx             # backup preferences + operator note
  compliance/page.tsx          # jurisdiction, retention, disclaimers
  developer/page.tsx           # API keys / webhooks summary + toggles
  advanced/page.tsx            # workspace archive, ownership transfer
  modules/page.tsx             # existing module visibility editor (rewrapped)
  branding/page.tsx            # existing branding form (rewrapped)
  storefront/page.tsx          # bridge → Storefront Center
  domains/page.tsx             # bridge → Storefront Domains
  notifications/page.tsx       # bridge → Notification Center
  integrations/page.tsx        # bridge → Integrations Center
  billing/page.tsx             # bridge → Billing Center
  staff/page.tsx               # bridge → Workforce Center + role catalog
  security/page.tsx            # bridge → Security + hardening checklist
  imports/page.tsx             # bridge → Import Center
  white-label/page.tsx         # existing enterprise placeholder cards
```

## Section registry

`lib/settings/section-registry.ts` is the single source of truth. Every section
has a stable `key`, a sidebar `label`, a description, an `href`, a lucide icon
name, the required `capability`, and an optional `bridge` flag (true = links to
an existing center rather than a new form).

Sidebar, breadcrumbs, search, and Control Center health surfacing all derive
from this list. Adding a section is: append an entry + create the page + (if
form-backed) extend `SettingsCenterPayload`.

## Permissions

`lib/settings/settings-permissions.ts` defines:

- `SettingsCapability` — one capability per section plus `view_settings`.
- `ROLE_GRANTS` — `owner` (all), `admin` (no advanced danger zone),
  `manager` (operational sections only), `staff` (`view_settings`).
- `isSuperAdminSettings(actor)` — `workspace.moroz@gmail.com` bypasses all checks.
- `settingsCapabilitiesFor(actor)` — used by the sidebar to filter sections per role.

Every Server Action and every page invokes `canUseSettings(actor, capability)`
before reading or writing. Pages that fail the check call `notFound()`.

## Data model

Single additive Prisma change:

```prisma
model KitchenSettings {
  // … existing scalar columns unchanged …
  settingsCenterJson  Json? @map("settings_center_json")
}
```

Migration `20260528100000_settings_center` adds the column with `IF NOT EXISTS`.

`lib/settings/settings-defaults.ts` defines `SettingsCenterPayload` (versioned)
and `mergeSettingsCenter(raw)` deep-merges user JSON into the defaults. Every
read of `settingsCenterJson` runs through this merge, so removing or changing a
key in the payload type can never crash a UI render.

Top-level keys:

| Key | Owner | Notes |
| --- | --- | --- |
| `workspaceIdentity` | Workspace | Legal name, DBA, tax IDs, social, invoice footer, language. |
| `businessHours` | Workspace | Seven-day open/close/closed entries. |
| `operations` | Operations | Prep lead, cutoff, capacity, stations, QC, allergen protocol. |
| `orders` | Orders | Auto-confirm, approvals, payment modes, refund window, fraud, escalation. |
| `production` | Production | Shifts, batching, SLA, auto-printing, station colors. |
| `packing` | Packing | Stages, QC, label template, scan-to-verify, printer profile. |
| `delivery` | Delivery | Radius, fees, dispatch, courier preference, SMS toggle. |
| `routes` | Routes | Optimization mode, max stops, driver start, buffer. |
| `crm` | CRM | VIP thresholds, churn, loyalty mode, tags, follow-ups. |
| `automation` | Automation | Master switch, retries, backoff, pause-on-failure. |
| `ai` | AI | Provider toggles, daily token cap, cost alert, prompt presets. |
| `backups` | Backups | Schedule, retention, attachments, snapshot-before-imports. |
| `compliance` | Compliance | Jurisdiction, retention, URLs, disclaimers, cookie consent. |
| `developer` | Developer | Debug logging, feature flag previews, audit traces. |
| `advanced` | Advanced | Workspace archive flag, transfer contact email. |

## Services

`services/settings/settings-center-service.ts` exposes:

- `loadSettingsCenter(userId)` — `{ kitchenSettings, payload }`.
- `updateSettingsCenterSection(userId, section, next)` — read-merge-write so
  concurrent saves never clobber unrelated keys.
- `updateSettingsCenterSections(userId, patch)` — multi-key update (used by the
  business mode preset).

`services/settings/settings-health-service.ts` builds the readiness snapshot:

- Counts notification rules, storefront domains, integration connections.
- Probes Stripe + Resend env diagnostics.
- Returns `{ sections, external }` for the Control Center and Audit doc.

## Server Actions

All actions live in `actions/settings-center.ts`. Each action:

1. Resolves the actor profile (role + email).
2. Calls `canUseSettings(actor, capability)`; returns `{ ok: false, error: "forbidden" }`
   if the actor lacks the capability.
3. Validates input with a Zod schema.
4. Calls `updateSettingsCenterSection(...)` (or `updateSettingsCenterSections(...)`).
5. Mirrors selected fields back to legacy `KitchenSettings` columns where
   downstream flows still read them (currency, timezone, country, locale,
   business name, delivery toggles/radius/fee).
6. Revalidates all settings paths.

Exports include `saveWorkspaceIdentity`, `saveBusinessHours`,
`saveOperationsSettings`, `saveOrderSettings`, `saveProductionSettings`,
`savePackingSettings`, `saveDeliverySettings`, `saveRouteSettings`,
`saveCrmSettings`, `saveAiSettings`, `saveAutomationSettings`,
`saveBackupsSettings`, `saveComplianceSettings`, `saveDeveloperSettings`,
`saveAdvancedSettings`, `applyBusinessModePreset`.

## UI surfaces

- **Layout.** `app/dashboard/settings/layout.tsx` enforces `view_settings`,
  builds the actor scope, and renders the sidebar (`SettingsSidebar`) on
  desktop and the drawer (`SettingsMobileDrawer`) on mobile.
- **Sidebar.** Search, pinned (localStorage), recents, grouped sections, pin
  buttons, `aria-current` for the active section.
- **Sticky save bar.** Forms render `<StickySaveBar>` which appears on dirty
  state, blocks the browser unload event, and shows a spinner on save.
- **Control Center.** `app/dashboard/settings/page.tsx` renders three cards:
  - **Workspace readiness** (HealthOverview) — overall score + tile per section.
  - **Quick actions** — 10 deep links for the most common admin moves.
  - **Platform status** — Stripe / Resend / cron / domains / integrations / failures.

## Health scoring

`lib/settings/health-score.ts` defines weighted checks per section. Each check
contributes to a 0–100 score; `overallReadiness(sections)` averages them.
Tones (`danger` < 50, `warning` < 80, `ready` ≥ 80) drive badge colours.

Live signals (notification provider, Stripe, custom domains, integration
connections) come from `services/settings/settings-health-service.ts`.

## Business modes

Operators pick a business mode in `Workspace → Business mode`. The form calls
`applyBusinessModePreset({ type })` which:

1. Upserts `KitchenSettings.businessType` (legacy column).
2. Read-merge-writes `operations.sameDayOrdersEnabled`,
   `orders.requireApprovalForCateringOrders`,
   `orders.preorderRequiresMenu`, and `delivery.enabled` to the preset’s
   defaults. No other fields change.

Existing module recommendations + sidebar focusing still flow through the
established `lib/business-mode-registry.ts` engine.

## Module visibility

`/dashboard/settings/modules` is preserved as the canonical module visibility
editor. It now lives inside the new sidebar shell and shares the
`SectionHeader` component. Module gates (`pathAllowedByModuleGate`,
`navigationHrefDisabled`) continue to read from `KitchenModulePreference`.

## Mobile UX

- The sidebar collapses behind a `Sheet` (Radix dialog) labeled “Sections” at
  the top-left on `< lg` viewports.
- Health tiles, quick actions, status grid, and forms all stack to a single
  column on mobile.

## Audit + safety

- Settings writes go through Server Actions with Zod validation; the database
  never sees unparsed strings.
- Sensitive provider keys are *never* returned to the client — only boolean
  “configured” + non-secret metadata.
- Legacy `KitchenSettings` scalar columns remain in place so existing flows
  (storefront, packing, costing, ingredient demand) are unaffected.
- Super-admin bypass relies on a single canonical helper (`isSuperAdminEmail`).

## Adding a new section

1. Append a `SETTINGS_SECTIONS` entry (and capability if needed).
2. Add the typed payload key to `SettingsCenterPayload` + defaults.
3. Add the Zod schema + Server Action in `actions/settings-center.ts`.
4. Add the form component under `components/dashboard/settings/forms/`.
5. Add the page under `app/dashboard/settings/<slug>/page.tsx`.
6. Update health checks if the new section participates in readiness.
