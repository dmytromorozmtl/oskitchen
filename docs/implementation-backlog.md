# KitchenOS Implementation Backlog

Status: canonical execution backlog grouped by strategic priority
Primary evidence: `docs/system-reality-model.md`, `docs/p0-hardening-roadmap.md`, `docs/feature-maturity-matrix.md`, `docs/rbac-permission-architecture.md`

## Era 4 — Cross-channel operational truth

### KOS-E4-001 — Inventory depletion channel policy (POS-only)
- ID: `KOS-E4-001`
- Title: Formalize POS-only inventory depletion; prohibit unified cross-channel stock claims
- Module: Inventory / storefront / POS
- Priority: P0 (Era 4 Cycle 1)
- Status: **completed (policy)** — implementation of storefront hook deferred
- Decision: `era4-pos-only-v1` — certified channel: POS only
- Evidence: `lib/inventory/inventory-depletion-policy.ts`, `test:ci:inventory-depletion:cert`, canonical matrix + positioning updates
- Next: optional storefront depletion implementation (future cycles) or RBAC wave 4

### KOS-E4-002 — POS browser E2E CI policy (tier 2b optional + explicit status)
- ID: `KOS-E4-002`
- Title: POS browser E2E must not silently pass when skipped
- Module: POS / CI / QA
- Priority: P0 (Era 4 Cycle 2)
- Status: **completed**
- Decision: `era4-tier2b-optional-v1` — always-on unit/integration/inventory; optional Playwright; always-on policy summary + artifact
- Evidence: `lib/ci/pos-browser-e2e-policy.ts`, `scripts/pos-browser-e2e-ci-policy.ts`, `.github/workflows/ci.yml`, `test:ci:pos-browser-e2e:policy`, `test:ci:pos-money-path:cert`
- Next: RBAC wave 4 residuals (batch 2)

### KOS-E4-003 — RBAC wave 4 residuals (batch 1)
- ID: `KOS-E4-003`
- Title: Close residual sensitive mutations (routes, copilot, demo, feedback, integrations, production calendar, holiday packages)
- Module: Platform / security
- Priority: P0 (Era 4 Cycle 3)
- Status: **completed (batch 1)**
- Evidence: `lib/routes/require-route-mutation.ts`, `lib/ai/require-copilot-mutation.ts`, `lib/demo/require-demo-mutation.ts`, `lib/feedback/require-app-feedback-submit.ts`, `test:ci:rbac-wave4`, `test:ci:rbac-wave4:cert`

### KOS-E4-006 — RBAC wave 4 residuals (batch 2)
- ID: `KOS-E4-006`
- Title: Close restaurant tables, customer subscriptions, and experiment ethics review mutations
- Module: Platform / security / FOH preview / CRM / storefront
- Priority: P0 (Era 4 Cycle 6)
- Status: **completed**
- Evidence: `lib/restaurant/require-restaurant-table-mutation.ts` (`pos.access`), `requireCrmMutation` on `actions/customer-subscription.ts`, `requireStorefrontManageActor` on `actions/experiment-ethics-review.ts`, extended `test:ci:rbac-wave4`
- Residual: copilot void form actions silent-deny UX; broader tenant-only grep sweep

### KOS-E4-004 — Cron experimental surface archive
- ID: `KOS-E4-004`
- Title: Archive experimental cron routes off App Router; certify 16 production-only active surface
- Module: DevOps / platform
- Priority: P0 (Era 4 Cycle 4)
- Status: **completed**
- Evidence: 121 slugs in `archive/cron-routes/`, `config/cron-archive-manifest.json`, `test:ci:cron-hygiene:cert` includes `cron-archive-era4-cert-live`
- Ops restore: `npm run cron:restore:archived -- --execute` (see `docs/CRON_ARCHIVE_RUNBOOK.md`)

### KOS-E4-005 — Woo / Shopify golden path proof
- ID: `KOS-E4-005`
- Title: Certify external order ingest path without overclaiming full integration live ops
- Module: Integrations / channels / order hub
- Priority: P0 (Era 4 Cycle 5)
- Status: **completed**
- Decision: `era4-channel-golden-path-v1` — webhook/sync normalize → `externalOrder` → channel import staging → order hub external visibility; kitchen Order auto-create **not** certified
- Evidence: `lib/integrations/channel-golden-path-policy.ts`, `tests/fixtures/channel-golden-path/`, `test:ci:channel-golden-path`, `test:ci:channel-golden-path:cert` (in `test:ci:governance-bundles`), `scripts/smoke-woo-shopify-certification.ts` for staging/live store
- Next: enterprise procurement basics or additional typecheck slices

### KOS-E4-007 — Typecheck slice 1 (dashboard / services / API)
- ID: `KOS-E4-007`
- Title: First strict typecheck slice for operational spine without weakening full CI gate
- Module: DevOps / platform
- Priority: P0 (Era 4 Cycle 7)
- Status: **completed (slice 1)**
- Decision: `era4-typecheck-slice-v1` — `typecheck:full` remains CI canonical; local slices `typecheck:slice:services-core` (6GB) and `typecheck:slice:dashboard-services-api` (6GB); slices omit `.next/types` to avoid archived-cron validator noise
- Evidence: `tsconfig.base.json`, `tsconfig.slice.dashboard-services-api.json`, `lib/ci/typecheck-slice-policy.ts`, `test:ci:typecheck-slice:cert`
- Next: storefront/marketing slices or wire optional CI parallel slice job

### KOS-E4-008 — Enterprise procurement basics
- ID: `KOS-E4-008`
- Title: Canonical enterprise procurement pack without false SSO/SOC2/SCIM claims
- Module: Product / security / GTM
- Priority: P0 (Era 4 Cycle 8)
- Status: **completed**
- Decision: `era4-procurement-honesty-v1` — single canonical pack for questionnaires and RFPs; deprecated enterprise audit family for posture
- Evidence: `docs/enterprise-procurement-pack.md`, `lib/enterprise/enterprise-procurement-policy.ts`, `test:ci:enterprise-procurement:cert`
- Next: cross-channel loyalty/gift card E2E or KDS staging smoke

## P0 — Platform Safety
### KOS-P0-001 — Canonical RBAC rollout for sensitive mutations
- ID: `KOS-P0-001`
- Title: Canonical RBAC rollout for sensitive mutations
- Module: Platform / security
- Priority: P0
- Owner role: Platform architect
- Business value: prevents trust-breaking authorization gaps
- Technical value: unifies fragmented permission logic
- User story: as an owner or operator, I need permissions to be predictable and enforced server-side
- Current state: mixed central registry, legacy fallback, and domain-specific gates
- Progress update: **Era 3 Cycle 99 — audit sensitive detail in security CI bundle** — `tests/unit/audit-sensitive-detail-rbac.test.ts` wired into `test:security`; `test:ci:audit-center-rbac:cert` asserts full audit-center RBAC suite; **Era 3 Cycle 98 — audit sensitive detail RBAC** — before/after/diff JSON visibility requires `audit.export` via `canViewSensitiveAuditDetailFromGrants`; `stripSensitiveDetailForViewer` uses canonical boolean gate (`tests/unit/audit-sensitive-detail-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 97 — audit center view/read RBAC wave 3** — `resolveScope` requires `reports.read.audit` with denial audits; workspace lookup uses owner `dataUserId` (staff session-id leak fix); retention read uses `workspace.settings` (`tests/unit/audit-center-actions-rbac.test.ts`); **Era 3 Cycle 96 — audit center RBAC in security CI bundle** — `tests/unit/audit-center-actions-rbac.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:audit-center-rbac:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 95 — audit center mutation RBAC wave 3** — `runAuditExportAction` requires `audit.export`; `upsertAuditRetentionAction` requires `workspace.settings`; denial audits via `lib/audit/require-audit-center-mutation-access.ts`; page flags aligned to canonical grants (`tests/unit/audit-center-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 94 — global search RBAC in security CI bundle** — `tests/unit/global-search-actions-rbac.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:global-search-rbac:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 93 — platform email bypass in security CI bundle** — `tests/unit/platform-email-bypass-closure.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:platform-email-bypass:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 92 — support ticket comment RBAC wave 3** — `addSupportTicketComment` uses `requireSupportCommentMutationAccess` with `support_comment.permission_denied` audits (`tests/unit/support-tickets-actions-rbac.test.ts`); **Era 3 Cycle 91 — support ticket triage/status RBAC wave 3** — `assignSupportTicket`, `updateSupportTicketStatus`, `escalateSupportTicketAction` use `requireSupportTriageAccess` / `requireSupportStatusMutationAccess` with denial audits (`tests/unit/support-tickets-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 90 — partner org provision RBAC wave 3** — `createPartnerOrganization` uses `requirePartnerProvisionActor` (platform GTM bridge + denial audits) before mutations (`tests/unit/partner-operations-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 89 — order creation RBAC in security CI bundle** — `tests/unit/order-creation-rbac.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:order-creation-rbac:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 88 — global search RBAC + tenant scope wave 3** — `actions/global-search.ts` requires `workspace.view`, uses owner `dataUserId` for scoped search (fixes staff session-id leak), denial audits (`tests/unit/global-search-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 87 — forecast AI page RBAC wave 3** — `/dashboard/forecast/ai` gates on `copilot.read.financial` via `requireForecastAiPageAccess` (closes direct `getAIOrderForecast` bypass); **Era 3 Cycle 86 — kitchen AI tools RBAC wave 3** — `actions/kitchen-ai.ts` gates OpenAI insight actions on copilot capabilities via `lib/ai/require-kitchen-ai-actor.ts` with `kitchen_ai.permission_denied` audits (`tests/unit/kitchen-ai-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 85 — label print queue RBAC wave 3** — `actions/label-print-queue.ts` mutations require `reports.read.audit` with `nutrition_label_print.permission_denied` audits (`tests/unit/label-print-queue-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 84 — webhook replay workspace RBAC wave 3** — `actions/webhook-replay.ts` workspace surface requires `integrations.manage` via `requireIntegrationsActor` before tenant replay (`tests/unit/webhook-replay-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 83 — order creation denial audit wave 3** — `lib/orders/order-create-access.ts` records `orders.permission_denied` on deny; `createOrderViaCenterAction` checks RBAC before tenant actor; `tests/unit/order-creation-rbac.test.ts` wired into `test:ci:rbac-wave3`; **Era 3 Cycle 82 — settings self-account RBAC wave 3** — `lib/settings/require-self-account-mutation.ts` documents self-service password/email/avatar paths; owner `companyName` on profile requires `workspace.settings` (`tests/unit/settings-self-account-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 81 — kitchen settings RBAC wave 3** — `actions/settings.ts` `updateKitchenSettings` requires `workspace.settings` with `kitchen_settings.permission_denied` audits (`tests/unit/settings-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 80 — onboarding mutations RBAC wave 3** — `actions/onboarding.ts` wizard mutations require `workspace.settings` with `onboarding.permission_denied` audits (`tests/unit/onboarding-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 79 — legacy implementation actions RBAC wave 3** — `actions/implementation.ts` mutations require canonical permissions (`go-live.manage`, `integrations.manage`, `customers.manage`) with `implementation.permission_denied` audits (`tests/unit/implementation-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 78 — public POST fail-closed ROI route certification** — `tests/unit/roi-lead-route-fail-closed.test.ts` certifies `app/api/leads/roi/route.ts` wiring to `enforcePublicMarketingPostGuard` (503 when guard rejects, 400 invalid payload); wired into `test:ci:public-post-fail-closed` alongside IoT/NPS guard + route tests; **Era 3 Cycle 77 — location legacy create and switcher RBAC wave 3** — `actions/locations.ts` legacy create requires `workspace.settings`; active location switch requires tenant actor and tenant-owned location ids (`tests/unit/locations-actions-rbac.test.ts`); **Era 3 Cycle 76 — location create/bulk-assign RBAC wave 3** — `actions/locations.ts` full create and bulk assign require `workspace.settings` with `locations.permission_denied` audits (`tests/unit/locations-actions-rbac.test.ts`); **Era 3 Cycle 75 — location hours/archive RBAC wave 3** — `actions/locations.ts` pickup/delivery hours require `routes.manage`, business hours and archive require `workspace.settings`, with `locations.permission_denied` audits (`tests/unit/locations-actions-rbac.test.ts`); **Era 3 Cycle 74 — location profile/fulfillment RBAC wave 3** — `actions/locations.ts` profile updates require `workspace.settings`, fulfillment updates require `routes.manage`, with `locations.permission_denied` audits (`tests/unit/locations-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 73 — module preferences RBAC wave 3** — `actions/module-preferences.ts` mutations require `workspace.settings` with `module_preferences.permission_denied` audits (`tests/unit/module-preferences-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 72 — brands RBAC wave 3** — `actions/brands.ts` mutations require `workspace.settings` with `brands.permission_denied` audits (`tests/unit/brands-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 71 — operating mode RBAC wave 3** — `actions/operating-mode.ts` mutation requires `workspace.settings` via `requireSettingsCenterMutation("manage_operations")` with settings denial audits (`tests/unit/operating-mode-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 70 — legacy catering RBAC wave 3** — `actions/catering.ts` mutations require `orders.manage` with `catering.permission_denied` audits (`tests/unit/catering-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 69 — catering quotes RBAC wave 3** — `actions/catering-quotes.ts` mutations require `orders.manage` with `catering_quotes.permission_denied` audits (`tests/unit/catering-quotes-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 68 — operations checklist RBAC wave 3** — `actions/operations.ts` mutations require `production.manage` with `operations.permission_denied` audits (`tests/unit/operations-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 67 — nutrition label settings RBAC wave 3** — `actions/nutrition-label-settings.ts` packing gates require `workspace.settings`, storefront label visibility requires `storefront.manage`, with `nutrition_label_settings.permission_denied` audits (`tests/unit/nutrition-label-settings-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 66 — allergen profile RBAC wave 3** — `actions/allergen-profile.ts` upsert requires `products.edit` with `allergen_profile.permission_denied` audits (`tests/unit/allergen-profile-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 65 — nutrition label verification RBAC wave 3** — `actions/nutrition-label-verification.ts` verify/status mutations require `reports.read.audit` with `nutrition_label_verification.permission_denied` audits (`tests/unit/nutrition-label-verification-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 64 — ingredient declaration RBAC wave 3** — `actions/ingredient-declaration.ts` upsert requires `products.edit` with `ingredient_declaration.permission_denied` audits (`tests/unit/ingredient-declaration-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 63 — nutrition profile RBAC wave 3** — `actions/nutrition-profile.ts` upsert requires `products.edit` with `nutrition_profile.permission_denied` audits (`tests/unit/nutrition-profile-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 62 — product categories RBAC wave 3** — `actions/product-categories.ts` requires `products.edit` with `product_categories.permission_denied` audits (`tests/unit/product-categories-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 61 — inventory RBAC certification** — existing `actions/inventory.ts` `production.manage` gates certified with denial audit `sessionUserId` parity and `tests/unit/inventory-actions-rbac.test.ts` wired into `test:ci:rbac-wave3`; **Era 3 Cycle 60 — menus RBAC wave 3** — `actions/menus.ts` mutations require `products.edit` with `menus.permission_denied` audits (`tests/unit/menus-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 59 — products RBAC wave 3** — `actions/products.ts` mutations require `products.edit` with `products.permission_denied` audits (`tests/unit/products-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 58 — food safety RBAC wave 3** — `actions/food-safety.ts` mutations require `production.manage` with `food_safety.permission_denied` audits (`tests/unit/food-safety-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 57 — kitchen task RBAC wave 3** — `actions/kitchen-task.ts` mutations require `production.manage` with `kitchen_task.permission_denied` audits (`tests/unit/kitchen-task-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 56 — bank reconciliation RBAC wave 3** — `actions/accounting/bank-reconciliation.ts` CSV import and reconcile require `reports.read.financial` with `accounting.bank_reconciliation.permission_denied` audits (`tests/unit/bank-reconciliation-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 55 — packing verification RBAC wave 3** — `actions/packing-verification.ts` requires `packing.manage` with `packing.verification.permission_denied` audits; supervisor override keeps owner/platformBypass gate; tenant scope fixed to `dataUserId` (`tests/unit/packing-verification-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 54 — forecast actions RBAC wave 3** — `actions/forecast.ts` mutations require `production.manage` with `forecast.permission_denied` audits; archive/restore tenant scope fixed to `dataUserId` (`tests/unit/forecast-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 53 — accounts payable RBAC wave 3** — `actions/accounting/ap.ts` create/match require `production.manage`, approve/mark-paid require `reports.read.financial`, with `accounting.ap.permission_denied` audits (`tests/unit/accounting-ap-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 52 — scorecard refresh** — incremental Era 3 scorecard (Overall 71→**73**, DevOps 75→**78**, QA 71→**75**) in `canonical-doc-index.md`, `full-strategic-reaudit-2026-05-27.md` §Step 20, `next-master-prompt-input-2026-05-27.md`; live consistency gate `tests/unit/scorecard-ci-live.test.ts` (`test:ci:scorecard:cert`, last in `test:ci:governance-bundles`); CI wiring P0 gap marked resolved; **Era 3 Cycle 51 — doc canon CI certification** — live wiring gate `tests/unit/doc-canon-ci-live.test.ts` (`test:ci:doc-canon:cert`, chained first in `test:ci:governance-bundles` before `test:ci:doc-canon`) certifies canonical index, deprecated-family notice, gateway audit banners, and governance bundle alignment; **Era 3 Cycle 50 — public API v1 CI certification** — live wiring gate `tests/unit/public-api-v1-ci-live.test.ts` (`test:ci:public-api-v1:cert`, chained in `test:ci:governance-bundles` before `test:ci:public-api-v1`) certifies all eight v1 routes use `guardPublicApi` fail-closed wiring, unit bundle script alignment, and matrix doc coverage; **Era 3 Cycle 49 — integration honesty CI certification** — live wiring gate `tests/unit/integration-honesty-ci-live.test.ts` (`test:ci:integration-honesty:cert`, chained in `test:ci:governance-bundles` with `test:ci:integration-honesty`) certifies marketplace placeholder registry/channel/nav alignment, UI Placeholder badges, and no fake health scores; **Era 3 Cycle 48 — nav/maturity governance CI certification** — live wiring gate `tests/unit/nav-maturity-governance-ci-live.test.ts` (`test:ci:nav-governance:cert`, chained in `test:ci:governance-bundles` with `test:ci:nav-governance`) certifies `NAV_MATURITY_RULES`, focused nav filtering via `getFilteredNavGroups`, preview badges in `dashboard-nav`, and matrix doc alignment; **Era 3 Cycle 47 — KDS v1 prototype CI certification** — `kds-v1-prototype` CI job runs `test:ci:kds-v1:integration` (queue→bump + allergen conflict); live wiring gate `test:ci:kds-v1:prototype:cert` in `test:ci:governance-bundles`; rollout behind `ENABLE_KDS_V1_CERTIFIED` in non-production; allergen alert UI in `KdsDailyService`; **Era 3 Cycle 46 — KDS v1 scope CI certification** — live wiring gate `tests/unit/kds-v1-scope-ci-live.test.ts` (`test:ci:kds-v1:cert`, chained in `test:ci:governance-bundles` with `test:ci:kds-v1:unit`) certifies locked `docs/kds-v1-scope.md`, canonical index reference, permissioned `kitchen-daily-kds` actions, and tier-1c unit artifacts; integration queue→bump remains focused DB workflow; **Era 3 Cycle 45 — cron surface hygiene CI certification** — live wiring gate `tests/unit/cron-hygiene-ci-live.test.ts` (`test:ci:cron-hygiene:cert`, chained in `test:ci:governance-bundles`) certifies `quality` job runs `validate:production-crons` + `validate:cron-inventory`, 16-slug production allowlist honesty, and tier-1b artifact presence; **Era 3 Cycle 44 — inventory depletion proof certification** — live gate `tests/unit/inventory-depletion-cert-live.test.ts` (`test:ci:inventory-depletion:cert`, chained in `test:ci:governance-bundles`) certifies POS recipe depletion unit + integration in CI, POS checkout hook to `recordPendingInventoryImpactsForPosOrder`, and explicit storefront deferral (no cross-channel hook yet); **Era 3 Cycle 43 — POS money-path CI certification** — live wiring gate `tests/unit/pos-money-path-ci-live.test.ts` (`test:ci:pos-money-path:cert`, chained in `test:ci:governance-bundles`) certifies `pos-money-path` CI job (seed + unit + integration + inventory + optional auth-gated E2E), tier-1 POS checkout in `test:security`, software-only scope (no hardware claim), and `docs/ci-e2e-tier-matrix.md` artifacts; **Era 3 Cycle 42 — storefront money-path CI certification** — live wiring gate `tests/unit/storefront-money-path-ci-live.test.ts` (`test:ci:storefront-money-path:cert`, chained in `test:ci:governance-bundles`) certifies `storefront-money-path` CI job (seed + unit + pay-later E2E), tier-1 payment failure recovery in `test:security`, and `docs/ci-e2e-tier-matrix.md` artifacts; **Era 3 Cycle 41 — growth leads export RBAC** — `/api/growth/leads/export` requires `growth.manage` via `requireGrowthApiAccess` (aligned with growth hub mutations; `growth.view` alone insufficient for bulk beta-lead CSV export) (`tests/unit/growth-leads-export-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 40 — customer success export RBAC** — `/api/growth/customer-success/export` requires `growth.manage` via `requireGrowthApiAccess` (aligned with customer success mutations; `growth.view` alone insufficient for bulk customer CSV export) (`tests/unit/customer-success-export-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 39 — customer success RBAC wave 2** — `appendCustomerSuccessNoteForm` and `markCustomerContactedForm` require `growth.manage` via `authorizeGrowth` (replacing owner-only profile gate) with growth denial audits (`tests/unit/customer-success-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 38 — channel certification RBAC wave 2** — `runChannelCertificationAction` and `recordCertificationSignOffAction` require `integrations.manage` via `requireIntegrationsActor` (replacing owner-only sign-off gate) with integration denial audits (`tests/unit/channel-certification-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 37 — notifications center RBAC wave 2** — `actions/notifications-center.ts` mutations require `workspace.settings` via `requireMutationPermission` with settings denial audits (`tests/unit/notifications-center-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 36 — email bypass closure certification** — automated guard `tests/unit/platform-email-bypass-closure.test.ts` proves no runtime `isSuperAdminEmail` / `SUPERADMIN_EMAIL` / hardcoded founder email in `app/` / `actions/` / `lib/` outside bootstrap allowlist (`test:ci:rbac-wave3`); **Era 3 Cycle 35 — notifications platform bypass** — `isSuperAdminNotifications` / `canUseNotifications` use `platformBypass` from persisted `SUPER_ADMIN` role row via `getNotificationActorScope` (`tests/unit/notifications-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 34 — dashboard superadmin UI parity** — billing, branding settings, and training dashboard pages use `actor.platformBypass` from persisted `SUPER_ADMIN` role row (via `requireBillingPageAccess`, `requireWorkspacePermissionActor`, `getTrainingPageAccess`); no runtime `isSuperAdminEmail` in `app/` or `actions/`; **Era 3 Cycle 33 — platform target protection bypass** — `isTargetSuperAdminProtected` uses `hasSuperAdminRoleRow` only, not bootstrap email (`tests/unit/platform-target-protection-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 32 — platform guards founder flag** — `requirePlatformAccess` sets `isFounder` from `SUPER_ADMIN` role row, not bootstrap email (`tests/unit/platform-guards-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 31 — platform support session bypass** — `isWorkspaceOwnerSuperAdminProtected` and protected-workspace session start require `SUPER_ADMIN` role row, not bootstrap email (`tests/unit/platform-support-session-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 30 — analytics platform bypass** — `isSuperAdminAnalytics` / `canDoAnalytics` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveAnalyticsActorScope` (`tests/unit/analytics-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 29 — packing verification platform bypass** — `canSupervisorOverride` uses `platformBypass` from persisted `SUPER_ADMIN` role row; `supervisorOverrideVerificationAction` uses `requireWorkspacePermissionActor` (`tests/unit/packing-verification-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 28 — catering quote platform bypass** — `isSuperAdminCatering` / `canDoCateringQuote` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveCateringQuoteActorScope` (`tests/unit/catering-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 27 — meal plans platform bypass** — `isSuperAdmin` / `canDoMealPlan` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveMealPlanActorScope` (`tests/unit/meal-plans-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 26 — CRM platform bypass** — `isSuperAdmin` / `canDoCrm` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveCrmActorScope` (`tests/unit/crm-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 25 — locations platform bypass** — `isSuperAdmin` / `canDoLocation` / `visibleLocationIds` use `platformBypass` from persisted `SUPER_ADMIN` role row; locations settings page no longer uses email override badge (`tests/unit/locations-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 24 — brands platform bypass** — `canViewAllBrands` / `canManageBrands` / `canManageSingleBrand` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveBrandActorScope` (`tests/unit/brands-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 23 — tasks platform bypass** — `actorIsSuperAdmin` uses `platformBypass` from persisted `SUPER_ADMIN` role row; tasks settings page no longer uses email override badge (`tests/unit/tasks-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 22 — implementation platform bypass** — `test:ci:public-post-fail-closed` wired into CI; route tests for IoT/NPS; **Era 3 Cycle 12 — settings/audit platform bypass** — `tests/unit/public-api-v1-resources-contract.test.ts` + `test:ci:public-api-v1` cover auth, pagination, tenant scope, and mutation validation across all eight v1 resources; **Integration honesty (Cycle 23–24)** — `lib/integrations/integration-honesty.ts` canonicalizes DoorDash/Grubhub/Uber Eats/Uber Direct placeholders; Grubhub added to channel catalog; channel cards + available list label placeholders and suppress misleading health scores; **Navigation/maturity governance (Cycle 21–22)** — `lib/navigation/nav-maturity-governance.ts` hides marketplace placeholder links from focused default nav; Cron surface hygiene certified, ~121 experimental routes gated via `runCronRoute` + `ENABLE_EXPERIMENTAL_CRONS`, CI validators `validate:production-crons` / `validate:cron-inventory` include `tests/unit/cron-hygiene-live.test.ts`; Inventory depletion proof — POS checkout with active recipe decrements ingredient stock — `pos-money-path` job runs `pos:seed-ci-checkout`, unit/integration/inventory tests, and optional dashboard-auth E2E — `storefront-money-path` job in `.github/workflows/ci.yml` seeds `hello` via `scripts/seed-ci-storefront-checkout.ts`, runs `test:ci:storefront-money-path:unit` (payment recovery + stripe matrix) and pay-later checkout E2E — `app/api/iot/temperature/route.ts` requires `IOT_INGEST_SECRET` bearer (503 when unset); `app/api/leads/roi/route.ts` uses rate limit + Turnstile with production fail-closed when captcha not configured; `app/api/nps/route.ts` requires session or `NPS_INGEST_SECRET` bearer with rate limit (`lib/api/public-post-guard.ts`, `tests/unit/public-post-fail-closed.test.ts`); RBAC wave 2 slice — `actions/settings-center.ts` mutations use `requireSettingsCenterMutation` mapped to canonical workspace permissions with settings denial audits (`tests/unit/settings-center-rbac.test.ts`); `actions/monetization.ts` API key create/revoke require `integrations.manage` — `isSuperAdminUser` / workspace `platformBypass` require persisted `SUPER_ADMIN` role (bootstrap email seeds role via `ensurePlatformOwnerBootstrap` only); `actions/order-creation.ts` and `/dashboard/orders/new` use `orders.manage` via `lib/orders/order-create-access.ts`; billing mode assign uses `requireSuperAdminActor`; Storefront publish API RBAC — `app/api/storefront/theme/publish/route.ts` and `app/api/storefront/builder/publish/route.ts` now require `storefront.publish` (replacing owner-only session match), resolve tenant owner via `requireTenantActor`, and have denial/tenant-scope tests in `tests/unit/storefront-publish-api-routes.test.ts`; Storefront rewards RBAC consolidated (`storefront-rewards-permission.ts`, `storefront-rewards-page-access.ts`, unified subnav `rewards` gate); storefront loyalty admin aligned to `loyalty.manage`; storefront gift cards aligned to `giftcards.manage` (issue action, page gate, subnav) matching workspace CRM gift cards; Import Center job commit/rollback/cancel actions and job detail UI aligned to type-scoped permissions (`requireImportCenterJobCommit` / `requireImportCenterJobCancel`, `resolveImportCenterJobPermissions`); Import Center migrated from legacy profile-role strings to canonical workspace RBAC (`requireImportCenterActor`, hub/upload/settings page gates, filtered subnav, API route guards); CRM hub gated on `customers.read` / `customers.manage` with filtered subnav and mutation denial audits; workspace gift cards and customer loyalty program actions gated on `giftcards.manage` / `loyalty.manage` with page and POS balance API alignment; POS hub subnav includes Tabs and Handheld for `pos.access` actors (aligned with existing page gates); cron route inventory CI uses Vitest live gate (`cron-route-inventory-live.test.ts`) via shared `cron-route-inventory-validation.ts`; Import / Export Center ingredient CSV preview gated on `products.edit` via `requireImportActor` with `IMPORT_PERMISSION_DENIED` audits; hub layout subnav filters by import/export capabilities; production cron manifest/route/archive/`vercel.json` reconciliation re-certified with live Vitest gate (`cron-reconciliation-live.test.ts`) and CI wired to `npm run validate:production-crons`; cron bearer auth uses timing-safe comparison with `cron.auth_denied` audits from `runCronRoute`; billing Stripe webhook fails closed when `STRIPE_WEBHOOK_SECRET` is unset; POS, KDS, billing (entitlement overrides, checkout/portal API routes, billing hub layout/page gates, cancel feedback), integrations, export, storefront publish/media/manage draft mutations, report read/saved-report/generator pages, storefront domains/settings/forms pages and mutations, storefront hub `storefront.read` layout gate with per-href RBAC subnav (`storefront-subnav-access.ts`), admin page gates (launch, preview, website, referrals, notifications, menu, products, media), and mutation gates on blackout, Stripe Connect, reservations, product fields, webhook redelivery, and multi-store switching; manage-tab mutations (pages create, builder nav/footer, domain verify, forms CRUD) aligned via `requireManageStorefrontRow` / `getManageStorefrontForSession`; growth hub on canonical `growth.view` / `growth.manage` with platform GTM legacy bridge; and channel-command-center mutation surfaces are on canonical keys; `/dashboard/reports/[reportKey]` uses `requireReportGeneratorPageAccess` with audited denials before `runReport`; billing uses `requireBillingActor` / `requireBillingPageAccess` / `requireBillingApiAccess`; `channel-command-center` actions require `integrations.manage`; manage-only sales-channel pages use `requireSalesChannelsManagePage`; sales-channels monitoring allows `integrations.read` with read-only subnav
- Target state: canonical permission registry and helpers protect all high-risk mutations
- Affected files: `lib/permissions/**`, `actions/pos.ts`, `actions/integrations.ts`, `actions/billing.ts`, `actions/upload.ts`, export routes
- Dependencies: none
- Implementation steps: define registry, add helpers, migrate high-risk modules, add denial audits, add scanner
- Data model changes: minimal initially; code-first
- Service changes: permission resolution and denial logging
- UI changes: permission-aware nav and denied states
- Permission changes: large
- Audit log requirements: denial + success for sensitive actions
- Analytics requirements: optional denial counters
- Tests required: negative role tests, scanner, route guard tests
- Acceptance criteria: all P0 mutations use canonical permission helpers
- Remaining work after current slice: optional `storefront.admin` registry key for team-only split vs `storefront.manage`; vendor-specific malware scanner certification when `UPLOAD_MALWARE_SCAN_URL` is enabled in production
- Rollback considerations: keep legacy adapter during migration
- Risk level: High
- Estimated complexity: High

### KOS-P0-002 — POS permission hardening
- ID: `KOS-P0-002`
- Title: POS permission hardening
- Module: POS
- Priority: P0
- Owner role: Restaurant operations architect
- Business value: protects financial operations and operator trust
- Technical value: creates reusable permission pattern for other domains
- User story: as a cashier or manager, I should only be able to perform authorized POS actions
- Current state: refunds/voids are better protected than checkout/register/shift flows
- Progress update: **Era 3 Cycle 43** certifies tier-2b POS money path in CI via `pos-money-path` job (unit + integration + inventory + optional auth-gated E2E) with live wiring gate `test:ci:pos-money-path:cert`; checkout/register/shift/refund/void flows plus `app/api/pos/terminal/route.ts` now enforce canonical POS permissions, the main POS shell/registers/shifts/settings entry pages now mirror those permissions, and focused POS RBAC test files/config now cover checkout discount denial, direct checkout-service invariants for canonical order routing, open-shift enforcement, terminal placeholder pending-payment persistence, follow-on audit/ops side effects, and post-order POS persistence failure handling, a joined checkout-to-terminal capture lifecycle proving that a checkout-created pending terminal transaction on an open shift/register is marked paid with canonical capture metadata, a terminal cancel/retry recovery lifecycle proving cancellation leaves the local pending checkout intact until a later successful capture settles the same register/shift transaction, a route-to-service terminal lifecycle proving the `POST`/`DELETE`/`PUT` handlers drive the same pending checkout through cancel, retry, and capture with route-level audit events, a failed-capture recovery slice proving a route-level `PUT` capture failure leaves the local pending checkout untouched until a later retry succeeds, and an intent-creation recovery slice proving a failed route-level `POST` leaves the same pending checkout untouched until a later retry/capture succeeds, direct refund/void service invariants for processor-skipped refunds, partial Stripe-backed refunds, Stripe failure rollback, duplicate-refund protection, and voided-order warning audits, register/shift/refund/void action denials, canonical allowed-path shift open/close audit coverage, direct shift-service invariants for duplicate-open prevention, owner-scoped register resolution, cash closeout expected/variance math, and not-found close failures, terminal route denials across GET/POST/PUT/DELETE, terminal token issuance and payment-intent creation allowed-path coverage, malformed terminal JSON request handling, explicit terminal service-failure contracts for token/intention/capture/cancel flows without false allowed-path audits, direct Stripe Terminal service invariants for token creation, payment-intent scaling, capture failure/success paths, payment row persistence, and cancel delegation, the terminal process/cancel lifecycle edges with canonical allowed-path audit coverage for successful payment capture, page-level deny/allow parity for POS settings and hardware readiness, transactions, receipts, and plan-gated reports, `pos.access` page parity for handheld and bar-tab surfaces with denied paths proving they do not load tab data, `actions/pos/tabs.ts` workflow mutations with canonical `pos.access`/`pos.checkout` enforcement plus denied and allowed audit coverage, and cashier/manager/owner outcomes exercised directly at the `requireMutationPermission()` layer for the core POS mutation bundle; the primary remaining gaps are broader E2E/device lifecycle coverage and any deeper workflow-role nuances beyond the current focused mutation/page slices, plus making dependency restoration reproducible enough that the focused runner does not need manual package recovery
- Target state: all POS mutations and route handlers require explicit POS capabilities
- Affected files: `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `services/pos/**`
- Dependencies: `KOS-P0-001`
- Implementation steps: add POS permissions, wrap actions/routes, align primary UI gates, extend parity to remaining POS pages/settings surfaces, then deepen negative tests and API coverage
- Data model changes: none required initially
- Service changes: permission injection and manager override checks
- UI changes: denied states and clearer role affordances
- Permission changes: POS-specific keys
- Audit log requirements: overrides, refunds, voids, shift/register changes
- Analytics requirements: optional denied action telemetry
- Tests required: POS E2E, refund/void, role-negative, terminal API permission-negative
- Acceptance criteria: unauthorized staff cannot perform protected POS actions; owner-scoped tenant data is preserved for staff-run POS mutations
- Rollback considerations: preserve legacy fallback during transition
- Risk level: High
- Estimated complexity: Medium to High

### KOS-P0-003 — Upload and media hardening
- ID: `KOS-P0-003`
- Title: Upload and media hardening
- Module: Storefront / uploads
- Priority: P0
- Owner role: Security lead
- Business value: prevents unsafe content and protects brand trust
- Technical value: centralizes file validation
- User story: as an operator, I need uploads to be safe and predictable
- Current state: storefront media path validates more than generic upload actions
- Progress update: upload validation lives in `lib/upload-policy/media-upload-validation.ts` across storefront media, kitchen product/logo uploads, profile avatars, invoice OCR images, import CSV uploads, and public form attachments; kitchen product/logo uploads require `products.edit` / `workspace.settings`; invoice OCR requires `reports.read.financial`; `services/audit/upload-audit.ts` records `UPLOAD_SUCCEEDED` / `UPLOAD_DENIED` for these channels; static malware/content-safety scanning and optional external hook run via `lib/upload-policy/malware-scan.ts` + `enforce-upload-content-safety.ts` on every upload path (replaces prior `stub_pass` form scan label).
- Target state: all upload entrypoints share one hardened validation policy
- Affected files: `actions/upload.ts`, `actions/storefront-media.ts`, `services/storefront/storefront-media-upload-service.ts`, storage helpers
- Dependencies: `KOS-P0-001`
- Implementation steps: central validator, unify policies, add audit and error states, consider scan hook
- Data model changes: optional file scan metadata later
- Service changes: centralized upload policy
- UI changes: clearer upload denial and setup states
- Permission changes: `storefront.media.manage` and related export/upload keys
- Audit log requirements: upload success/failure where sensitive
- Analytics requirements: upload failure rates
- Tests required: MIME/size/malicious upload tests
- Acceptance criteria: unsafe uploads are denied consistently
- Rollback considerations: keep existing provider abstractions
- Risk level: High
- Estimated complexity: Medium

## P1 — Restaurant Core
### KOS-P1-001 — Storefront payment failure recovery
- ID: `KOS-P1-001`
- Title: Storefront payment failure recovery
- Module: Storefront
- Priority: P1
- Owner role: Commerce lead
- Business value: protects direct-order revenue
- Technical value: stabilizes a flagship path
- User story: as a customer or operator, I need failed checkouts to be recoverable and visible
- Current state: strong checkout validation, partial recovery/observability maturity
- Progress update: initial online-checkout session failures now preserve the already-written `StorefrontOrder` plus internal `Order` pair instead of deleting them, the persisted storefront payment state is explicitly marked `FAILED`, public token-scoped retry now recreates Stripe Checkout only for the same order after a clear checkout-start failure, Stripe cancel now returns guests to the saved order page (`?canceled=1`) and idempotently marks still-pending online orders `FAILED` for same-token retry, workspace audit logs record `STOREFRONT_PAYMENT_FAILED` / `STOREFRONT_PAYMENT_RETRY_STARTED`, Order Hub surfaces payment failed/pending badges for storefront rows, focused recovery coverage now proves failed-to-pending-to-paid progression plus a guard that blocks retry while payment is still `PENDING` so KitchenOS does not mint duplicate live checkout sessions, same-cart duplicate submits now explicitly reuse the original order token with guest-visible duplicate guidance instead of silently dropping the customer onto status tracking, and focused webhook idempotency proof now covers both route-level duplicate Stripe-event acknowledgement and storefront completion-service no-op behavior once the order is already `PAID`; **Era 3 Cycle 42** certifies tier-2 storefront money path in CI via `storefront-money-path` job (pay-later E2E + unit recovery matrix) and live wiring gate `test:ci:storefront-money-path:cert`; staging Stripe live-card E2E remains optional.
- Target state: deterministic payment failure lifecycle with retry and support guidance
- Affected files: `actions/storefront-order.ts`, `services/storefront/storefront-payment-service.ts`, storefront checkout UI
- Dependencies: none
- Implementation steps: define failure states, improve UI, add reporting and traces
- Data model changes: optional payment failure metadata
- Service changes: retry/recovery handlers
- UI changes: failure/retry state components
- Permission changes: operator-side storefront management only
- Audit log requirements: payment failure and retry events
- Analytics requirements: failure rate and recovery rate
- Tests required: payment success/failure matrix, duplicate handling tests
- Acceptance criteria: failed payments no longer leave ambiguous operator/customer state
- Rollback considerations: keep canonical order writer unchanged
- Risk level: Medium
- Estimated complexity: Medium

### KOS-P1-002 — KDS permission and bump/recall foundation
- ID: `KOS-P1-002`
- Title: KDS permission and bump/recall foundation
- Module: Kitchen ops
- Priority: P1
- Owner role: Kitchen operations lead
- Business value: moves KDS toward restaurant-grade usage
- Technical value: creates a coherent kitchen state machine
- User story: as kitchen staff or expo, I need live ticket actions that are fast and permissioned
- Current state: daily KDS fetch/bump/recall actions and the kitchen page enforce `kitchen.view` / `kitchen.bump` / `kitchen.recall`; production work-item transitions from the kitchen screen require `kitchen.bump` or `kitchen.expo.manage` (with `production.manage` fallback); station/mode configure UI requires `kitchen.configure`
- Progress update: **Era 3 Cycle 47** certifies KDS v1 prototype workflow in CI via `kds-v1-prototype` job + `test:ci:kds-v1:prototype:cert`; queue→bump integration + allergen conflict flag; UI allergen badge; non-prod rollout gate; **Era 3 Cycle 46** locks KDS v1 scope in CI via `test:ci:kds-v1:cert` + `test:ci:kds-v1:unit` in governance bundles; canonical scope doc `docs/kds-v1-scope.md` defines daily-service ticket workflow, permissions (`kitchen.view`/`kitchen.bump`/`kitchen.recall`), and explicit out-of-scope boundaries; **Navigation/maturity governance (Cycle 21–22)** — `lib/navigation/nav-maturity-governance.ts` hides DoorDash/Grubhub/Uber placeholder links from focused default nav, labels preview surfaces (POS tabs/handheld, tables, copilot, forecast, reservations, food safety), gates internal GTM links; wired into `getFilteredNavGroups` + sidebar badges; KDS v1 prototype — allergen conflict badge
- Target state: canonical kitchen permissions and bump/recall/rush ticket workflow
- Affected files: kitchen services, `actions/kitchen-daily-kds.ts`, future KDS UI shells
- Dependencies: `KOS-P0-001`
- Implementation steps: define kitchen permissions, state machine, UI shells, negative tests
- Data model changes: ticket/item action states
- Service changes: bump/recall orchestration
- UI changes: readable KDS actions
- Permission changes: `kitchen.*`
- Audit log requirements: bump, recall, config changes
- Analytics requirements: timer/SLA tracking
- Tests required: realtime KDS tests, negative permission tests
- Acceptance criteria: unauthorized users cannot mutate kitchen state
- Rollback considerations: keep production/packing flows intact
- Risk level: Medium
- Estimated complexity: High

### KOS-P1-003 — Inventory depletion and variance closure
- ID: `KOS-P1-003`
- Title: Inventory depletion and variance closure
- Module: Inventory / costing
- Priority: P1
- Owner role: Ops / finance lead
- Business value: makes inventory and costing credible
- Technical value: links sales and economics
- User story: as an owner, I need sales to deplete stock and variance reports to mean something
- Current state: **in progress** — POS impacts, recipe depletion (unit + integration certified in CI via `test:ci:inventory-depletion:cert`); **Era 4 Cycle 1:** POS-only channel policy (`KOS-E4-001`); count completion + detail/list variance rollups, waste→stock; remaining: optional storefront depletion hook (scoped implementation), multi-count variance dashboards
- Target state: certified depletion per channel (POS today) and usable variance reporting
- Affected files: `services/pos/pos-inventory-impact-service.ts`, inventory and costing services
- Dependencies: canonical permissions for inventory
- Implementation steps: finalize depletion linkage, add variance reporting, surface operator diagnostics
- Data model changes: impact/variance snapshots if needed
- Service changes: depletion and reconciliation services
- UI changes: pending vs configured inventory visibility
- Permission changes: `inventory.*`, `costing.manage`
- Audit log requirements: adjustments and reconciliations
- Analytics requirements: variance KPIs
- Tests required: depletion integration tests, costing tests
- Acceptance criteria: certified channels deplete inventory (POS today); variance is understandable; no false unified depletion claims
- Rollback considerations: additive with safe fallbacks
- Risk level: Medium
- Estimated complexity: High

### KOS-P1-004 — Staff role parity across POS/KDS/schedule
- ID: `KOS-P1-004`
- Title: Staff role parity across POS, KDS, and schedule
- Module: Workforce
- Priority: P1
- Owner role: People systems lead
- Business value: aligns workforce and operations
- Technical value: reduces permission sprawl
- User story: as an owner, I need staff roles to govern what people can actually do
- Current state: **in progress** — staff + labor + training + go-live + executive + playbooks + templates + product-mapping + storefront-admin canonical gates; product mapping uses `integrations.read` / `integrations.manage`; storefront admin tabs map to `storefront.read` / `storefront.manage` via `requireStorefrontAdminPermission` with `staffAccess` JSON; settings-backed admin pages (settings, workspace, advanced, fulfillment, ordering, seo, marketing, pickup-windows, cart-recovery, redirects, schedule, analytics, reviews, inventory) use `requireStorefrontAdminPageAccess`; promo codes (`/dashboard/storefront/discounts`) use `storefront.manage` via `requireStorefrontManagePage` / `requireManageStorefrontRow`; gift cards + loyalty use `requireStorefrontRewardsPageAccess`
- Target state: staff roles map directly to canonical capabilities
- Affected files: `actions/staff.ts`, `actions/training.ts`, `lib/staff/**`, `lib/training/**`
- Dependencies: `KOS-P0-001`
- Implementation steps: map roles to capabilities, update role management, add tests
- Data model changes: custom role mapping if needed
- Service changes: role resolution
- UI changes: role editor and permission summaries
- Permission changes: broad
- Audit log requirements: role assignment/change logs
- Analytics requirements: none initially
- Tests required: staff role and permission-negative tests
- Acceptance criteria: staff permissions map to real operational actions
- Rollback considerations: transitional adapters
- Risk level: Medium
- Estimated complexity: Medium

## P2 — Growth And Intelligence
### KOS-P2-001 — Loyalty and gift-card cross-channel certification
- ID: `KOS-P2-001`
- Title: Loyalty and gift-card cross-channel certification
- Module: CRM / growth
- Priority: P2
- Owner role: Growth lead
- Business value: stronger retention and direct revenue
- Technical value: unifies incentives across surfaces
- User story: as a customer, I need rewards and balances to work online and in-store
- Current state: foundations exist, parity is not fully certified
- Target state: online and POS parity with clear operator diagnostics
- Affected files: `actions/loyalty.ts`, `actions/gift-cards.ts`, related services
- Dependencies: POS and storefront hardening
- Implementation steps: close parity gaps, add runbooks and tests
- Data model changes: optional redemption history refinements
- Service changes: unified redemption flows
- UI changes: wallet/balance/redeem states
- Permission changes: `loyalty.manage`, `giftcards.manage`
- Audit log requirements: issue/redeem/reversal events
- Analytics requirements: redemption attribution
- Tests required: loyalty/gift-card parity suites
- Acceptance criteria: incentives work across channels without ambiguity
- Rollback considerations: keep current reward logic stable
- Risk level: Medium
- Estimated complexity: Medium

### KOS-P2-002 — Consent-aware campaign and attribution engine
- ID: `KOS-P2-002`
- Title: Consent-aware campaign and attribution engine
- Module: Growth / marketing
- Priority: P2
- Owner role: Growth architect
- Business value: turns CRM into measurable revenue
- Technical value: formalizes growth event model
- User story: as a marketer, I need campaigns that respect consent and show impact
- Current state: growth services exist, automation and attribution are partial
- Target state: consent-first campaign orchestration with revenue attribution
- Affected files: CRM/growth services, campaign surfaces, consent helpers
- Dependencies: CRM metric maturity
- Implementation steps: consent model, event model, attribution reports, approval workflow
- Data model changes: campaign, send, attribution records
- Service changes: eventing and campaign services
- UI changes: composer, segment targeting, attribution dashboards
- Permission changes: `campaigns.manage`
- Audit log requirements: send approvals and consent denials
- Analytics requirements: attribution rollups
- Tests required: consent and attribution tests
- Acceptance criteria: campaigns are attributable and consent-aware
- Rollback considerations: start with drafts and internal send paths
- Risk level: Medium
- Estimated complexity: High

### KOS-P2-003 — Deterministic operations insights
- ID: `KOS-P2-003`
- Title: Deterministic operations insights
- Module: Intelligence
- Priority: P2
- Owner role: Data/product lead
- Business value: gives owners immediate value without risky AI claims
- Technical value: builds clean data products before generative layers
- User story: as an owner, I want to know what is selling, what is slowing, and what needs attention
- Current state: analytics and forecast surfaces exist, but insight packaging is partial
- Target state: explainable insights for sales, margin, waste, bottlenecks, and prep
- Affected files: `services/ai/`, `services/forecast/`, analytics/reporting services
- Dependencies: reporting and data quality hardening
- Implementation steps: deterministic insight cards, evidence links, alert thresholds
- Data model changes: snapshot/insight records optionally
- Service changes: insight generation services
- UI changes: owner dashboard and insight panels
- Permission changes: `analytics.view`
- Audit log requirements: none required initially
- Analytics requirements: insight usage tracking
- Tests required: insight logic tests
- Acceptance criteria: insights are explainable and useful without AI overreach
- Rollback considerations: additive
- Risk level: Low to Medium
- Estimated complexity: Medium

## P3 — Enterprise Expansion
### KOS-P3-001 — Enterprise identity roadmap implementation
- ID: `KOS-P3-001`
- Title: Enterprise identity roadmap implementation
- Module: Enterprise platform
- Priority: P3
- Owner role: Security architect
- Business value: unlocks enterprise deals
- Technical value: reduces identity risk and manual support
- User story: as an enterprise admin, I need federated identity and lifecycle controls
- Current state: roadmap only
- Target state: phased SSO/SAML/SCIM implementation
- Affected files: auth, platform, org/workspace identity layers
- Dependencies: RBAC canon and platform governance
- Implementation steps: architecture, pilot SSO, SCIM roadmap, support runbooks
- Data model changes: identity provider mappings
- Service changes: enterprise auth provisioning
- UI changes: enterprise identity settings
- Permission changes: platform/admin settings
- Audit log requirements: identity admin actions
- Analytics requirements: optional auth health
- Tests required: enterprise auth tests
- Acceptance criteria: enterprise identity is real before sales claims
- Rollback considerations: keep native auth intact
- Risk level: High
- Estimated complexity: High

### KOS-P3-002 — Audit export and governance package
- ID: `KOS-P3-002`
- Title: Audit export and governance package
- Module: Enterprise governance
- Priority: P3
- Owner role: Platform lead
- Business value: supports enterprise trust and procurement
- Technical value: formalizes audit and retention posture
- User story: as an auditor or enterprise admin, I need exportable, scoped evidence
- Current state: audit infra exists, export maturity partial
- Target state: permissioned audit export with retention controls and runbooks
- Affected files: audit services, export routes, governance docs
- Dependencies: RBAC canon
- Implementation steps: export path, filters, permissions, runbook, retention docs
- Data model changes: optional export job tracking
- Service changes: audit export services
- UI changes: export/admin surfaces
- Permission changes: `audit.view`, `audit.export`
- Audit log requirements: export initiated/completed
- Analytics requirements: export usage stats
- Tests required: export permission tests
- Acceptance criteria: enterprise audit exports are trustworthy and scoped
- Rollback considerations: additive
- Risk level: Medium
- Estimated complexity: Medium

## P4 — Long-Term Domination
### KOS-P4-001 — Restaurant-grade table service and bar mode
- ID: `KOS-P4-001`
- Title: Restaurant-grade table service and bar mode
- Module: FOH
- Priority: P4
- Owner role: Restaurant product lead
- Business value: opens larger restaurant segment
- Technical value: expands FOH depth
- User story: as a full-service restaurant, I need table, check, and bar workflows that feel native
- Current state: preview foundations only
- Target state: robust table service and bar workflows
- Affected files: table and POS surfaces
- Dependencies: POS permission hardening
- Implementation steps: floor plan, checks, tabs, coursing, bar speed paths
- Data model changes: tables/checks/seat models
- Service changes: table/bar orchestration
- UI changes: FOH shells
- Permission changes: `tables.*`, `checks.*`
- Audit log requirements: table transfer/merge/close events
- Analytics requirements: FOH metrics
- Tests required: table/bar E2E
- Acceptance criteria: service restaurants can run live operations
- Rollback considerations: ship in phases
- Risk level: High
- Estimated complexity: High

### KOS-P4-002 — Certified kiosk and QR table commerce
- ID: `KOS-P4-002`
- Title: Certified kiosk and QR table commerce
- Module: Omnichannel
- Priority: P4
- Owner role: Commerce lead
- Business value: expands self-service ordering
- Technical value: extends order spine cleanly
- User story: as a guest, I want fast self-service ordering that attaches correctly to the restaurant workflow
- Current state: partial QR surfaces, no certified kiosk
- Target state: production-grade self-service ordering
- Affected files: storefront, table, POS, checkout
- Dependencies: storefront and table maturity
- Implementation steps: kiosk shell, QR attach, pay-at-table, recovery
- Data model changes: kiosk/table session models
- Service changes: self-service orchestration
- UI changes: kiosk/QR flows
- Permission changes: storefront and table permissions
- Audit log requirements: session/order attach logs
- Analytics requirements: self-service conversion
- Tests required: QR/kiosk E2E
- Acceptance criteria: self-service flows are safe and recoverable
- Rollback considerations: start with QR menus before payment
- Risk level: High
- Estimated complexity: High

### KOS-P4-003 — AI-assisted operational optimization
- ID: `KOS-P4-003`
- Title: AI-assisted operational optimization
- Module: Intelligence
- Priority: P4
- Owner role: Data/AI lead
- Business value: long-term differentiation
- Technical value: compounds value of unified data model
- User story: as an owner, I want explainable recommendations that improve margin and service
- Current state: preview AI/copilot and forecast foundations
- Target state: explainable, approval-first operational optimization suite
- Affected files: AI, forecast, analytics, CRM surfaces
- Dependencies: deterministic insights, data quality, privacy governance
- Implementation steps: deterministic insights first, then draft recommendations, then constrained optimization
- Data model changes: insight/recommendation tracking
- Service changes: recommendation services
- UI changes: approval and explanation panels
- Permission changes: intelligence and campaign permissions
- Audit log requirements: recommendation approvals and sends
- Analytics requirements: adoption and outcome tracking
- Tests required: safety, privacy, explanation, approval tests
- Acceptance criteria: AI remains explainable and operator-controlled
- Rollback considerations: keep preview/beta labels until proven
- Risk level: Medium to High
- Estimated complexity: High
