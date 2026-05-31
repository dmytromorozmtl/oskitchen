# Settings Module Audit (Pre-Settings-Center)

Snapshot of the **pre-rebuild** Settings surface, the gaps that block OS Kitchen from being a real enterprise admin, and the priority of each fix. This is the source of truth for the Settings Center transformation.

> Hard constraints respected by every recommendation:
>
> - Do not rebuild the whole app.
> - Do not break the existing `/dashboard/settings` page or `KitchenSettings` model.
> - Do not break existing branding / module / notification flows.
> - Do not delete data. Schema changes are additive only.
> - Keep `workspace.moroz@gmail.com` as super-admin with full bypass.
> - TypeScript strict / Prisma stable.

## 1. Surface area today

### Routes

| Route | What it renders |
| --- | --- |
| `/dashboard/settings` | Single scroll page: GuidedSetupCard, Branding link, Data exports, one tall `SettingsForm` (business profile, pickup, delivery, kitchen workflow default, locale, notification toggles). |
| `/dashboard/settings/modules` | Owner-only module visibility editor (over `KitchenModulePreference`). |
| `/dashboard/settings/branding` | Brand color / theme key / custom-domain hint / email footer line / hide-branding toggle. Plan-gated. |
| `/dashboard/settings/white-label` | Read-only enterprise placeholder cards. |

### Models that already feed Settings

- `KitchenSettings` — business name, logo, business type, country, currency, pickup, delivery toggles, kitchen workflow text, notification toggles, tax fields, units, branding fields, costing/demand JSON.
- `KitchenModulePreference` — per-module enable/pin row.
- `Subscription` / `BillingCustomer` / `InvoiceRecord` / `UsageCounter` / `EntitlementOverride` — billing center (already its own surface).
- `NotificationRule` / `NotificationTemplate` / `NotificationLog` / `NotificationEvent` / `NotificationPreference` — notification center (already its own surface).
- `OnboardingProgress`, `IntegrationConnection`, `AuditLogEntry`, `WorkspaceBackup`, `StorefrontDomain` — exist with their own pages.

### What `/dashboard/settings` does **not** expose today

Workspace identity (legal name vs DBA, tax IDs, support email/phone, website, social, invoice footer, business hours), business mode logic, operations rules (cutoffs, batches, station map, prep capacity, QC, allergen policy), order policies (auto-confirm, approvals, minimums, fraud, refund windows), production policies (shifts, batch sizing, station colors, auto-printing), packing policies (stages, QC requirements, label rules), delivery policies (zones, fees, free thresholds, dispatch windows, courier integrations), CRM policies (segmentation, VIP, loyalty, churn, follow-ups), storefront/domains beyond a single hint field, automation (IF/THEN), AI configuration, imports/backups schedule, compliance (retention, GDPR/PIPEDA, consent, allergen/nutrition disclaimers), developer (API keys, webhook inspector, queue, feature flags), advanced danger-zone (workspace transfer, archive, hard-reset hints).

## 2. Findings

| # | Issue | Current state | Why limiting | Affected workflow | Recommended fix | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Flat single-page Settings | `app/dashboard/settings/page.tsx` is one tall scroll. | Not navigable, not findable, fails enterprise expectations (Shopify/Toast/Square parity). | Every owner/admin workflow. | Sidebar-driven admin with 20 sections + dashboard overview. | P0 |
| 2 | No health/readiness signal | Nothing tells operators how complete their config is. | Owners cannot prioritise setup; CS cannot triage. | Onboarding, post-launch ops. | Per-section health score (0–100) + overall readiness on `/dashboard/settings`. | P0 |
| 3 | Workspace identity is shallow | Only `businessName`, `logoUrl`, `businessType`, `country`, `currency`. | Tax IDs, support contacts, hours, locale beyond `en`, social links, invoice footer all missing. | Invoices, storefront, emails, compliance. | New `workspaceIdentity` block stored in `KitchenSettings.settingsCenterJson`. | P0 |
| 4 | Business mode logic hidden | `BusinessType` only nudges defaults via `lib/business-mode-registry.ts`; users never see the rationale or what changes when they switch. | Owners can’t intentionally pick a mode for a meal-prep + catering hybrid. | Onboarding, module visibility, terminology. | Dedicated business modes section listing recommended modules, terminology, suggested templates per mode. | P1 |
| 5 | Module visibility is binary, no dependencies | `/dashboard/settings/modules` toggles only. | No dependency warning when you disable e.g. `orders` while `production` is on; no per-location override; no beta gating UX. | Multi-brand operators, franchise. | Module management with dependency warnings, beta callouts, per-location/per-brand override stubs. | P1 |
| 6 | Operations config absent | Order cutoff lives on one field; everything else (prep lead, batch rules, zones, QC, allergen protocol) is hard-coded in modules. | Owners can’t tune lead times, can’t describe their station map, can’t enforce QC. | Production, packing, fulfillment. | Operations / Orders / Production / Packing / Delivery sub-sections with JSON-backed structured config. | P0 |
| 7 | Order rules not configurable | Auto-confirm, approval rules, minimum, payment, fraud, escalation are implicit. | Orders Module evolves; Settings should declare policy. | Orders, Today, automation. | `orderPolicies` block (auto-confirm, min order, allowed payment modes, refund window, escalation minutes). | P0 |
| 8 | CRM rules absent | No place to define VIP, loyalty, churn signals, birthday rules. | CRM module renders without owner-tunable thresholds. | CRM, marketing, automation. | `crmRules` block with VIP threshold, tags, churn days. | P1 |
| 9 | Storefront-/domain-level config split | `customDomainHint` is a single string. `StorefrontDomain` model already exists but isn’t linked from Settings. | Owners cannot manage SEO, navigation, banners, multilingual, white-label, multi-brand. | Storefront. | Storefront + Domains settings bridging to existing storefront and `StorefrontDomain` model. | P1 |
| 10 | Branding scope thin | Only color/theme/email footer/hide brand. No dark logo, favicon, typography, PDF/label branding, theme presets, live preview. | Brand operators ship inconsistent assets. | Storefront, emails, packing labels, invoices. | Branding section with asset fields + preview, theme presets, advanced CSS toggle. | P1 |
| 11 | Notifications not integrated into Settings shell | Notification Center exists at `/dashboard/notifications`; Settings only flips four legacy booleans. | Owners assume Settings → Notifications is empty. | Notifications, onboarding. | Settings sub-section that surfaces the Notification Center as a tab-style bridge + the legacy KitchenSettings toggles. | P0 |
| 12 | Integrations scattered | `/dashboard/integrations` exists; Settings has no entry point. | New owners can’t find Stripe/Resend/Twilio/Slack hooks from Settings. | Integrations. | Bridge page with status pills + deep links to existing integrations centre. | P0 |
| 13 | Billing only reachable from sidebar | `/dashboard/billing` is full-blown Billing Center; Settings has no entry. | Owners expect Settings → Billing. | Billing. | Bridge page with current plan, billing health, deep link. | P0 |
| 14 | Staff & permissions not surfaced as Settings | Staff Center has its own area; RBAC overview is missing from Settings. | Owners can’t see the permission matrix from Settings. | Staff. | Bridge page with role summary + deep link. | P0 |
| 15 | Security center exists but Settings has no entry | `/dashboard/security` is a sub-app. | Owners don’t discover it. | Security, audit, compliance. | Bridge page summarising 2FA, sessions, API keys, audit log link. | P0 |
| 16 | No automation surface | Automation Studio exists per-module; no central settings entry. | IF/THEN rules feel hidden. | Automation. | Bridge page with rule counts, link to studio, sample templates. | P1 |
| 17 | AI configuration absent | Provider keys are env-only; no governance UI. | Owners can’t enforce AI policy. | AI assistant, AI summaries. | AI section with provider preference (read-only when env-locked), token-cap toggle, summary-on-by-default toggle, prompt presets list. | P1 |
| 18 | Imports & backups split | Backups exist (`WorkspaceBackup`) but Settings has no entry. | Owners cannot self-serve restore previews. | Imports, backups. | Settings imports & backups bridge with retention info, last backup, link to existing center. | P1 |
| 19 | Compliance missing | No GDPR / PIPEDA UI, no consent overview, no allergen/nutrition disclaimer wording. | Risk for regulated jurisdictions. | Legal, ops. | Compliance section with retention defaults, consent log link, allergen disclaimer text fields. | P0 |
| 20 | Developer surface incomplete | Developer console exists for API keys; no webhook inspector / queue / feature flags shown in Settings. | Operators can’t self-debug. | Developer, support. | Developer bridge with webhook event counts (Stripe + Resend), feature flag list, queue health link. | P1 |
| 21 | No mobile shell | `/dashboard/settings` doesn’t collapse on mobile beyond standard responsive stacking. | Phone-only owners struggle. | All. | Mobile drawer for sidebar + bottom-sheet patterns where appropriate. | P0 |
| 22 | No sticky save UX | Forms post and reload. | Dirty-state ambiguity, accidental nav loss. | Every settings form. | Sticky save bar component used by every form. | P1 |
| 23 | Permissions are scattered | Settings reads from session user; no `canUseSettings(cap)` helper. | Hard to add staff roles without copy-paste. | All. | `lib/settings/settings-permissions.ts` + super-admin bypass. | P0 |
| 24 | Audit trail absent | Settings changes leave no record outside ad-hoc audit logs. | Compliance / multi-owner workspaces. | Compliance, security. | Settings-write actions write an `AuditLogEntry` row when applicable. | P1 |
| 25 | No section search | 24 sections need a palette. | Findability. | All. | Sidebar search input (client). | P2 |
| 26 | No favorites / recent | Operators revisit 3-4 sections per day. | Findability. | All. | Local-storage pinned/recents list at top of sidebar. | P2 |
| 27 | No section descriptions / icons | The legacy nav has no per-section copy. | Discoverability. | Onboarding. | Section registry with icon + one-liner + help link. | P1 |
| 28 | Enterprise multi-brand absent | Multi-brand operators can’t apply per-brand overrides. | Multi-brand. | Storefront, branding, notifications. | Settings registry includes multi-brand scope hint per section; per-brand override stubbed. | P2 |

## 3. Section map (target)

`Workspace / Operations / Orders / Production / Packing / Delivery / Routes / CRM / Storefront / Branding / Domains / Notifications / Integrations / Billing / Staff & Permissions / Security / Automation / AI / Imports & Backups / Compliance / Developer / Advanced` — plus the existing `Modules` editor reachable from Workspace and the Control Center overview at `/dashboard/settings`.

## 4. Data model strategy

- New JSON column `KitchenSettings.settingsCenterJson` holds structured config for the new Settings Center: `workspaceIdentity`, `businessHours`, `operations`, `orders`, `production`, `packing`, `delivery`, `routes`, `crm`, `storefront`, `automation`, `ai`, `imports`, `compliance`, `developer`, `advanced`. Always merged with defaults at read-time so missing keys never break the UI.
- Legacy `KitchenSettings.*` scalar columns are **not** dropped — they remain the source of truth for already-deployed flows (pickup, delivery toggles, branding, tax). The Settings Center reads + writes both layers transactionally.
- No destructive migrations; no enum changes.

## 5. Permissions strategy

`SettingsCapability` (`view_settings`, `manage_workspace`, `manage_operations`, `manage_orders`, `manage_production`, `manage_packing`, `manage_delivery`, `manage_crm`, `manage_storefront`, `manage_branding`, `manage_domains`, `manage_notifications`, `manage_integrations`, `manage_billing`, `manage_staff`, `manage_security`, `manage_automation`, `manage_ai`, `manage_imports`, `manage_compliance`, `manage_developer`, `manage_advanced`).

Roles:

- `owner` → all caps.
- `admin` → all caps except `manage_advanced`.
- `manager` → operations / orders / production / packing / delivery / crm / storefront / notifications view+manage; no security/billing/developer/advanced.
- `staff` → `view_settings` only.

Super-admin email (`workspace.moroz@gmail.com`) bypasses everything.

## 6. Out of scope (deferred)

- SMS / push / Slack / Teams / Discord / WhatsApp channels: shipping email today; rest are stubs with channel registry support so future work is additive.
- DNS automation for custom domains: continues to be an operator process; Settings exposes the `StorefrontDomain` records.
- Visual workflow builder canvas: Settings page links to Automation Studio; no new canvas in Settings.
- Multi-tenant white-label SaaS administration tooling beyond the existing white-label placeholder cards.

## 7. Rollout

1. Audit (this doc).
2. `lib/settings/*` + permissions + section registry + health.
3. Additive schema (`settingsCenterJson`).
4. Services + actions.
5. Sidebar + sticky save bar + control center.
6. Sections (workspace → operations → orders → production → packing → delivery → routes → crm).
7. Bridges (storefront / branding / domains / notifications / integrations / billing / staff / security / automation / ai / imports / compliance / developer / advanced).
8. Docs + typecheck + build.
