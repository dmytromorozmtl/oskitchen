# KitchenOS System Reality Model

**Updated:** 2026-05-27 (Cycle 29–30 scorecard refresh)  
Status: canonical current-state audit for the next hardening cycle  
**Index:** [`docs/canonical-doc-index.md`](./canonical-doc-index.md)

## Repository metrics snapshot (2026-05-27)

| Metric | Count | Notes |
|--------|------:|-------|
| App Router pages | 699 | unchanged breadth |
| API routes | 296 | route registry governed |
| Server action files | 144 | 23 use `requireMutationPermission` |
| Service files | 604 | +1 since May re-audit |
| Vitest tests | 415 | +16 since May re-audit |
| Playwright specs | 53 | money-path tiers in dedicated CI jobs |
| Docs (markdown) | 1,440 | canon index governs truth |
| Cron route handlers | 137 | 16 production-scheduled in `vercel.json` |
| Evolution Era 2 cycles | 30/30 | see `canonical-doc-index.md` ledger |

## Scope
This document summarizes the current, code-backed reality of KitchenOS before additional implementation work. It is based on direct inspection of the active repository surface and reconciliation with existing audit materials, not on aspirational product claims.

Primary evidence sources:
- Runtime and build: `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.typecheck.json`, `next.config.ts`, `middleware.ts`, `instrumentation.ts`, `vercel.json`, `.vercelignore`
- Delivery and quality: `.github/workflows/ci.yml`, `.github/workflows/e2e-staging.yml`, `README.md`, `SECURITY.md`, `CONTRIBUTING.md`
- Tenancy, orders, permissions: `lib/scope/require-tenant-actor.ts`, `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `lib/api/route-registry.ts`, `services/orders/order-creation-service.ts`
- High-risk operational surfaces: `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `app/api/public/v1/orders/route.ts`, `actions/upload.ts`, `services/storefront/storefront-media-upload-service.ts`
- Historical audits used as supporting evidence: `docs/enterprise-full-audit-26mayafter.md`, `docs/RBAC_FINAL_ARCHITECTURE.md`, `docs/MODULE_MATURITY_REPORT.md`, `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/POS_ARCHITECTURE.md`, `docs/QA_TEST_COVERAGE_AUDIT.md`, `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md`

## 1. Product Summary
- KitchenOS is no longer a narrow meal-prep MVP. The active route and service surface already spans restaurant POS, storefront commerce, order hub, delivery, catering, CRM, inventory, staff, reports, platform administration, and a large experimental/storefront operations layer. Evidence: `app/`, `app/dashboard/`, `app/platform/`, `app/s/[storeSlug]/`, `services/`, `docs/enterprise-full-audit-26mayafter.md`.
- The current market-safe summary is: KitchenOS is a broad food-operations platform with a comparatively strong storefront and order core, plus emerging restaurant operations modules that are unevenly hardened. Evidence: `README.md`, `app/dashboard/pos/terminal/page.tsx`, `app/s/[storeSlug]/checkout/page.tsx`, `services/orders/order-creation-service.ts`.
- The repo still carries a founder-pilot bias: many surfaces exist, but several remain operational beta, roadmap, or placeholder-only even when UI exposure is broad. Evidence: `docs/MODULE_MATURITY_REPORT.md`, `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/POS_ARCHITECTURE.md`, `actions/integrations.ts`.

## 2. Architecture Summary
- Core runtime is a Next.js 15 App Router monolith with server components, server actions, API routes, Prisma/Postgres, Supabase auth, Stripe billing/payments, and significant feature-domain services. Evidence: `package.json`, `README.md`, `app/`, `actions/`, `services/`, `prisma/schema.prisma`.
- The strongest architectural seam is the canonical order creation service, reused by manual orders, POS, storefront, and public API flows. Evidence: `services/orders/order-creation-service.ts`, `actions/order-creation.ts`, `actions/pos.ts`, `app/api/public/v1/orders/route.ts`.
- Tenant scoping is implemented through resolved owner/workspace context rather than a mature capability-first organization model. Evidence: `lib/scope/require-tenant-actor.ts`, `lib/scope/resolve-owner-workspace-id.ts`, `lib/scope/workspace-order-scope.ts`.
- Storefront traffic, vanity hosts, brand cookies, and experiment middleware add significant edge/runtime complexity. Evidence: `middleware.ts`, `lib/storefront/`, `app/api/storefront/`.
- The system includes a large operational control plane: cron routes, webhooks, platform/admin routes, release scripts, smoke tests, and pilot runbooks. Evidence: `app/api/cron/`, `app/api/webhooks/`, `app/platform/`, `scripts/`, `.github/workflows/`.

## 3. Tech Stack Summary
- Frontend: Next.js 15, React 19, TypeScript strict mode, Tailwind, Radix, Framer Motion, Recharts, Zustand. Evidence: `package.json`, `tsconfig.json`.
- Backend/data: Prisma 6 on PostgreSQL, Supabase auth and storage, server actions plus App Router API routes. Evidence: `package.json`, `prisma/schema.prisma`, `README.md`.
- Payments/commerce: Stripe, Stripe Terminal JS placeholder wiring, storefront Stripe checkout services. Evidence: `package.json`, `app/api/pos/terminal/route.ts`, `services/storefront/storefront-payment-service.ts`, `services/payments/stripe-terminal-service.ts`.
- Messaging/analytics/ops: Resend, Sentry, PostHog, Lighthouse, Playwright, Vitest, k6, Vercel cron/deploy tooling. Evidence: `package.json`, `.github/workflows/ci.yml`, `.github/workflows/lighthouse-storefront.yml`, `.github/workflows/k6-edge-assign-smoke.yml`.
- Build/runtime constraints are real: the repo already tunes static generation concurrency and prebuilt deployment paths to work around memory pressure. Evidence: `next.config.ts`, `README.md`, `vercel.json`.

## 4. Route Inventory Summary
- Marketing/public growth routes are extensive: landing pages, blog/resources, demos, legal/support, partner pages. Evidence: `app/page.tsx`, `app/blog/`, `app/resources/`, `app/demo/`, `app/support/`.
- Auth and onboarding routes are present and production-relevant. Evidence: `app/login/`, `app/signup/`, `app/forgot-password/`.
- Authenticated dashboard routes cover a very large operational surface, including orders, POS, storefront, inventory, purchasing, costing, CRM, staff, training, analytics, reports, notifications, locations, brands, playbooks, implementation, developer tooling, and executive dashboards. Evidence: `app/dashboard/`.
- Platform/internal routes exist separately from workspace routes, indicating a distinct support/platform operations surface. Evidence: `app/platform/`.
- Public storefront routes include branded storefront pages, checkout, order tracking, and guest account/session surfaces. Evidence: `app/s/[storeSlug]/`, `app/api/storefront/`.
- Current route surface is extremely broad and should be treated as larger than the maturity model implied by default navigation. Evidence: `app/`, `docs/enterprise-full-audit-26mayafter.md`.

## 5. API Inventory Summary
- API routes are classified by policy into dashboard session, platform internal, public API key, storefront public, webhook signed, cron secret, health, and invite. Evidence: `lib/api/route-registry.ts`, `scripts/validate-api-route-registry.ts`.
- The API surface includes public API v1, signed webhook ingress, cron workers, exports, integrations, POS terminal endpoints, loyalty/gift card endpoints, and operational dashboards. Evidence: `app/api/public/`, `app/api/webhooks/`, `app/api/cron/`, `app/api/export/`, `app/api/pos/`.
- Governance intent is stronger than uniform implementation. Route classification exists, but route-level permission depth varies widely after session/API-key admission. Evidence: `lib/api/route-registry.ts`, `app/api/pos/terminal/route.ts`, `app/api/public/v1/orders/route.ts`.

## 6. Server Action Inventory Summary
- There are action families for auth, orders, POS, storefront, integrations, inventory, costing, purchasing, CRM, growth, staff, labor, training, billing, implementation, platform support, and more. Evidence: `actions/`.
- Some action families already use explicit mutation gates. Integrations and selected POS mutations use `requireMutationPermission(...)` or domain-specific guards. Evidence: `actions/integrations.ts`, `actions/pos.ts`, `actions/customers.ts`.
- Many other action families still rely primarily on `requireTenantActor()` or bespoke domain guards, which means permission enforcement is not canonical or uniform. Evidence: `actions/inventory.ts`, `actions/costing.ts`, `actions/purchasing.ts`, `actions/labor/schedule.ts`, `actions/labor/time-clock.ts`.

## 7. Prisma / Data Model Summary
- The Prisma schema is extremely large and models a broad operating platform, including orders, storefront, POS, staffing, purchasing, costing, training, billing, integrations, experiments, and audit-related rows. Evidence: `prisma/schema.prisma`, `prisma/migrations/`.
- Workspace migration is still ongoing. The codebase contains explicit workspace coverage audits, backfills, and migration gates, meaning multi-tenant normalization is not fully closed. Evidence: `CONTRIBUTING.md`, `package.json` (`workspace:*` scripts), `scripts/check-workspace-coverage.ts`.
- The schema already contains restaurant-adjacent models such as POS register/shift/payment entities, table-related enums, gift cards, loyalty, purchasing, and staff/training entities. Evidence: `prisma/schema.prisma`, `prisma/migrations/20260514180000_pos_terminal_module/migration.sql`, `prisma/migrations/20260524100000_staff_workforce_center/migration.sql`.

## 8. Core Modules Summary
- Strongest core today: order creation/order hub, storefront checkout, billing/subscription lifecycle, tenant/workspace scoping foundation, and integration credential storage patterns. Evidence: `services/orders/order-creation-service.ts`, `app/api/public/v1/orders/route.ts`, `actions/storefront-order.ts`, `app/api/webhooks/stripe/route.ts`, `actions/integrations.ts`.
- Emerging but uneven core: POS terminal, staff/workforce, CRM, costing, purchasing, training, route/delivery planning, and platform support/admin. Evidence: `app/dashboard/pos/`, `actions/staff.ts`, `actions/customers.ts`, `actions/costing.ts`, `actions/purchasing.ts`, `actions/training.ts`, `app/platform/`.
- Highly experimental or unusually complex core: storefront experimentation, large cron families, AI/experiment control routes, and compliance-themed sync/webhook surfaces. Evidence: `lib/storefront/`, `app/api/cron/`, `app/api/webhooks/`, `services/storefront/`.

## 9. Live Modules
- Canonical order creation and order hub foundations. Evidence: `services/orders/order-creation-service.ts`, `actions/order-creation.ts`, `actions/orders.ts`.
- Stripe billing/subscription lifecycle and webhook-backed synchronization. Evidence: `app/api/webhooks/stripe/route.ts`, `services/billing/subscription-service.ts`, `actions/billing.ts`.
- Public storefront checkout foundation with server-side validation, pricing/tax/rules checks, and Stripe/pay-later branching. Evidence: `app/s/[storeSlug]/checkout/page.tsx`, `actions/storefront-order.ts`, `services/storefront/storefront-payment-service.ts`.
- Basic CRM/customer profile management. Evidence: `actions/customers.ts`, `services/crm/customer-service.ts`, `services/crm/customer-metrics-service.ts`.
- Integration credential storage for Shopify and WooCommerce, with honest `NEEDS_AUTH` status handling. Evidence: `actions/integrations.ts`, `docs/INTEGRATION_MATURITY_MATRIX.md`.

## 10. Beta Modules
- POS terminal, shifts, refunds/voids, and register management. Evidence: `app/dashboard/pos/terminal/page.tsx`, `actions/pos.ts`, `services/pos/`, `docs/POS_ARCHITECTURE.md`.
- Staff, schedule, time clock, and payroll-adjacent workforce workflows. Evidence: `app/dashboard/staff/`, `actions/staff.ts`, `actions/labor/schedule.ts`, `actions/labor/time-clock.ts`.
- Inventory counts, waste logging, costing runs, and purchasing approvals. Evidence: `actions/inventory.ts`, `actions/costing.ts`, `actions/purchasing.ts`, `services/inventory/`, `services/costing/`, `services/purchasing/`.
- Training/program/certification workflows. Evidence: `actions/training.ts`, `app/dashboard/training/`, `services/training/training-service.ts`.
- Platform/internal support and observability surfaces. Evidence: `app/platform/`, `actions/platform-support.ts`, `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md`.

## 11. Preview Modules
- Storefront experimentation and theme experiment orchestration. Evidence: `lib/storefront/theme-experiment-*.ts`, `app/api/storefront/experiment/`, `app/api/cron/storefront-experiment-*`.
- AI/copilot and deterministic insight surfaces that are real code but not yet safe as generally sold intelligence features. Evidence: `app/dashboard/copilot/`, `services/ai/`, `actions/kitchen-ai.ts`, `actions/copilot.ts`.
- Some developer/platform observability centers, where surface exists but enterprise-grade contract maturity is incomplete. Evidence: `app/dashboard/developer/`, `docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`.

## 12. Placeholder Modules
- Native Stripe Terminal hardware, drawer kick, and similar POS hardware control remain intentionally non-shipped. Evidence: `docs/POS_ARCHITECTURE.md`, `docs/POS_TERMINAL_AUDIT.md`, `app/api/pos/terminal/route.ts`.
- Several partner integrations and external POS replacements are still roadmap/partner-access-only despite UI/registry presence. Evidence: `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`, `actions/integrations.ts`.
- Some storefront forms, DNS verification, advanced builder, and upload/media operational layers remain partial. Evidence: `docs/STOREFRONT_COMPLETION_AUDIT.md`, `services/storefront/storefront-media-upload-service.ts`.

## 13. Hidden / Internal Modules
- Platform administration, support escalation, impersonation, and internal runbook surfaces should remain internal. Evidence: `app/platform/`, `actions/platform-support.ts`, `actions/platform-impersonation.ts`, `tests/unit/platform-impersonation-audit.test.ts`.
- Many cron/webhook/experiment routes appear to be ops-only or research-only and should not be interpreted as customer-facing product. Evidence: `app/api/cron/`, `app/api/webhooks/`, `lib/storefront/theme-experiment-*.ts`.

## 14. Broken Modules
- Full typecheck/build reliability is not fully stable at current repo scale; the codebase already includes explicit mitigation for memory pressure and older audits record TypeScript OOM. Evidence: `next.config.ts`, `README.md`, `docs/enterprise-full-audit-26mayafter.md`.
- CI script-reference drift is now partially hardened by restoring the missing install-chain script and adding a static workflow-to-`package.json` script audit, but broader local test-runner reliability still needs work. Evidence: `.github/workflows/ci.yml`, `scripts/validate-ci-workflow-scripts.ts`, `package.json`, `scripts/verify-clean-install-chain.ts`.
- Production cron validation is enforced in CI via `npm run validate:production-crons` (Vitest live reconciliation against `services/cron/cron-reconciliation.ts`, `vercel.json`, and `config/vercel/crons-production.json`). Evidence: `tests/unit/cron-reconciliation-live.test.ts`, `.github/workflows/ci.yml`.

## 15. Duplicate Modules
- Permission logic is duplicated across workspace permissions, legacy role fallbacks, and domain-specific gate helpers. Evidence: `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `lib/permissions/legacy.ts`, `lib/staff/staff-permissions.ts`, `lib/training/training-permissions.ts`, `lib/billing/billing-permissions.ts`.
- Order creation entrypoints are intentionally multiple, but canonicalized correctly through a shared service; this is good duplication control, not accidental duplication. Evidence: `actions/order-creation.ts`, `actions/pos.ts`, `app/api/public/v1/orders/route.ts`, `services/orders/order-creation-service.ts`.
- Route and module surfaces sometimes overlap in terminology and product storytelling, especially across integrations, sales channels, storefront, and developer/public API docs. Evidence: `app/dashboard/sales-channels/`, `app/dashboard/integrations/`, `docs/INTEGRATIONS_ARCHITECTURE.md`, `docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`.

## 16. Modules That Should Become Flagship
- Order spine and order hub unification. Evidence: `services/orders/order-creation-service.ts`, `actions/orders.ts`, `app/dashboard/orders/`.
- Storefront checkout plus branded restaurant storefront operations. Evidence: `app/s/[storeSlug]/`, `actions/storefront-order.ts`, `services/storefront/`.
- Restaurant POS once permissions and hardware honesty are tightened. Evidence: `app/dashboard/pos/terminal/page.tsx`, `actions/pos.ts`, `services/pos/`.
- Multi-surface CRM/loyalty integration across storefront and POS. Evidence: `actions/customers.ts`, `actions/loyalty.ts`, `actions/gift-cards.ts`, `services/pos/pos-crm-service.ts`.
- Platform governance and tenant-safe operations as an enterprise differentiator, once RBAC is canonicalized. Evidence: `lib/scope/`, `lib/permissions/`, `app/platform/`.

## 17. Modules That Should Be Hidden Until Certified
- Native or near-native POS hardware claims. Evidence: `docs/POS_ARCHITECTURE.md`, `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`.
- Partner-marketplace and long-tail integration claims that depend on vendor approval or limited smoke coverage. Evidence: `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/ENTERPRISE_READINESS_AUDIT_FINAL.md`.
- AI/autonomous recommendation surfaces that are not yet explainable, certified, or operationally bounded. Evidence: `services/ai/`, `app/dashboard/copilot/`, `actions/kitchen-ai.ts`.
- Experimental storefront optimization and experiment orchestration features. Evidence: `lib/storefront/theme-experiment-*.ts`, `app/api/storefront/experiment/`.

## 18. P0 Technical Blockers
- Canonical permission model is too small for current system breadth and is not consistently applied to high-risk mutations. Evidence: `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `actions/pos.ts`, `app/api/pos/terminal/route.ts`.
- Typecheck/build memory pressure and CI drift reduce release confidence. Evidence: `README.md`, `next.config.ts`, `.github/workflows/ci.yml`, `package.json`.
- Upload/media validation is inconsistent across surfaces and is not yet enterprise-safe enough to market broadly. Evidence: `actions/upload.ts`, `lib/storefront/asset-validation.ts`, `services/storefront/storefront-media-upload-service.ts`.
- Workspace migration is still active, which means tenant normalization remains a platform risk area. Evidence: `CONTRIBUTING.md`, `package.json` workspace audit scripts, `scripts/check-workspace-coverage.ts`.

## 19. P1 Product Blockers
- POS lacks a canonical restaurant-grade capability matrix for cashier, manager, bartender, server, and kitchen roles. Evidence: `lib/permissions/permissions.ts`, `docs/POS_ARCHITECTURE.md`, `actions/pos.ts`.
- KDS/kitchen surface exists but is not yet documented or gated as a fully certified live-service operating system. Evidence: `services/kitchen-screen/kitchen-screen-service.ts`, `actions/kitchen-daily-kds.ts`, `app/dashboard/training/kitchen/page.tsx`, `app/api/cron/kds-overdue-alerts/route.ts`.
- Inventory/costing/purchasing are useful but not yet complete enough for Lightspeed-level operational confidence. Evidence: `actions/inventory.ts`, `actions/costing.ts`, `actions/purchasing.ts`.
- Staff/training/time clock exist, but role and permission parity with POS/KDS/order mutations is not yet canonical. Evidence: `actions/staff.ts`, `actions/training.ts`, `actions/labor/time-clock.ts`.

## 20. Security Gaps
- Server-side permission checks are uneven after authentication. Evidence: `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `actions/inventory.ts`, `actions/labor/schedule.ts`.
- Upload validation is insufficient in generic upload paths; MIME/size checks are inconsistent and there is no evidence of malware scanning or deeper content validation. Evidence: `actions/upload.ts`, `services/storefront/storefront-media-upload-service.ts`, `lib/storefront/asset-validation.ts`.
- The public and semi-public route surface is large, increasing the need for consistent rate limiting, scope checks, and webhook verification. Evidence: `lib/api-public/guard.ts`, `app/api/webhooks/`, `app/api/public/`, `app/api/storefront/`.
- Security policy documentation is thin relative to the codebase scale and enterprise ambition. Evidence: `SECURITY.md`.

## 21. RBAC Gaps
- Current canonical permission registry contains only a small set of keys and does not reflect the true module surface. Evidence: `lib/permissions/permissions.ts`.
- Legacy fallbacks are still required for mutation access, which signals incomplete migration to a capability-first model. Evidence: `lib/permissions/mutation-access.ts`, `lib/permissions/legacy.ts`.
- UI permission resolution is thin and currently serializes whatever limited workspace set exists; it is not yet a complete source of feature/capability truth. Evidence: `lib/permissions/resolve-ui-permissions.ts`.
- Domain-specific permission helpers for staff, training, and billing are useful but further fragment authorization logic. Evidence: `lib/staff/staff-permissions.ts`, `lib/training/training-permissions.ts`, `lib/billing/billing-permissions.ts`.

## 22. POS Gaps
- Checkout, register creation, and shift open/close in `actions/pos.ts` rely on tenancy plus plan gates, not canonical mutation permissions. Refund and void are better protected than checkout/open/close. Evidence: `actions/pos.ts`.
- POS API terminal routes require tenant context but do not layer explicit POS capability checks. Evidence: `app/api/pos/terminal/route.ts`.
- Hardware story is intentionally honest but not ready for broad operator expectations. Evidence: `docs/POS_ARCHITECTURE.md`, `docs/POS_TERMINAL_AUDIT.md`.
- No production-certified table service/bar mode parity yet. Evidence: `app/dashboard/pos/`, `actions/restaurant/tables.ts`, `docs/POS_ARCHITECTURE.md`.

## 23. KDS Gaps
- KDS and kitchen-routing services exist but the current product story is fragmented across production, kitchen screen, packing, and cron alerting. Evidence: `services/pos/pos-kitchen-routing-service.ts`, `services/kitchen-screen/kitchen-screen-service.ts`, `actions/kitchen-daily-kds.ts`, `actions/packing.ts`, `actions/packing-verification.ts`.
- Kitchen-specific permissions are not yet canonical in the central permissions registry. Evidence: `lib/permissions/permissions.ts`.
- Kitchen operating model, expo controls, SLA alerts, and live-service readability still need a restaurant-grade consolidated roadmap. Evidence: `docs/KITCHEN_SCREEN_ARCHITECTURE.md`, `app/api/cron/kds-overdue-alerts/route.ts`.

## 24. Storefront Gaps
- Storefront is one of the strongest modules, but domains verification, forms completeness, publish/rollback confidence, and media/upload hardening remain incomplete. Evidence: `docs/STOREFRONT_COMPLETION_AUDIT.md`, `services/storefront/storefront-media-upload-service.ts`, `actions/storefront-forms.ts`, `actions/storefront-domains.ts`.
- Checkout failure recovery and observability need hardening before stronger production claims. Evidence: `actions/storefront-order.ts`, `services/storefront/storefront-payment-service.ts`, `docs/enterprise-full-audit-26mayafter.md`.
- Storefront experimentation surface is disproportionately large relative to hardened core commerce needs. Evidence: `lib/storefront/theme-experiment-*.ts`, `app/api/storefront/experiment/`.

## 25. Inventory Gaps
- Inventory actions mostly use tenant context rather than canonical permission gates. Evidence: `actions/inventory.ts`.
- Inventory depletion, theoretical vs actual usage, and recipe-driven cost accuracy are present as concepts but not yet proven end-to-end as a flagship operational system. Evidence: `services/inventory/`, `services/costing/costing-service.ts`, `services/pos/pos-inventory-impact-service.ts`.
- Commissary, transfer, and multi-location inventory stories need a more canonical maturity model. Evidence: `actions/commissary.ts`, `app/dashboard/inventory/`, `prisma/schema.prisma`.

## 26. Staff / Scheduling Gaps
- Staff role, custom role, schedule, and certification modules exist, but they are not yet mapped into a single authoritative permission model across POS, KDS, storefront admin, and reports. Evidence: `actions/staff.ts`, `actions/labor/schedule.ts`, `actions/training.ts`, `lib/staff/staff-permissions.ts`.
- Time clock and payroll export exist as module areas, but payroll-grade readiness and audit confidence are still beta. Evidence: `actions/labor/time-clock.ts`, `services/labor/payroll-service.ts`, `app/dashboard/staff/payroll/page.tsx`.

## 27. CRM / Loyalty Gaps
- CRM actions are deeper than the top-level marketing copy implies, but permissioning is domain-specific rather than canonical. Evidence: `actions/customers.ts`, `lib/crm/require-crm-mutation.ts`.
- Loyalty and gift cards exist, but cross-channel maturity needs explicit certification before broad sales claims. Evidence: `actions/loyalty.ts`, `actions/gift-cards.ts`, `services/loyalty/loyalty-service.ts`, `services/gift-cards/gift-card-service.ts`.
- Campaign automation, attribution, and consent-aware outbound growth are still incomplete relative to Mailchimp/Klaviyo comparisons. Evidence: `services/marketing/email-marketing-service.ts`, `docs/INTEGRATION_MATURITY_MATRIX.md`.

## 28. Integrations Gaps
- Shopify and WooCommerce have real credential storage and sync patterns; many others are setup-ready, partner-access-required, beta, or roadmap-only. Evidence: `actions/integrations.ts`, `docs/INTEGRATION_MATURITY_MATRIX.md`.
- The repo surface makes it easy to over-claim integrations because routes, cards, and provider names exist before certification is complete. Evidence: `app/dashboard/sales-channels/`, `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`, `docs/INTEGRATION_MATURITY_MATRIX.md`.
- Webhook and queue operations are substantial but require stronger runbook and operational certification discipline. Evidence: `app/api/webhooks/`, `app/api/cron/webhook-jobs/route.ts`, `docs/PRODUCTION_READINESS_NEXT_PRIORITY_AUDIT.md`.

## 29. Analytics / Reporting Gaps
- Dashboard and executive surfaces are broad, but report/export readiness is uneven and sometimes explicitly placeholder-only. Evidence: `app/dashboard/reports/`, `app/dashboard/executive/`, `docs/ANALYTICS_READY_REPORT.md`, `docs/ANALYTICS_REPORTS.md`.
- Customer-safe and finance-safe reporting needs stronger contract maturity. Evidence: `app/api/export/`, `services/reports/report-service.ts`, `docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`.

## 30. DevOps / CI/CD Gaps
- CI is ambitious and multi-layered, but workflow drift and repo scale threaten reliability. Evidence: `.github/workflows/ci.yml`, `package.json`, `README.md`.
- Deployment depends on local prebuilt flows because remote Vercel build memory is a known issue. Evidence: `README.md`, `vercel.json`, `next.config.ts`.
- Staging and smoke infrastructure exists, but environment correctness and runbook discipline remain material risks. Evidence: `.github/workflows/e2e-staging.yml`, `scripts/`, `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md`.

## 31. QA / Test Coverage Gaps
- The repository has meaningful test breadth, including unit, integration, contract, visual, and E2E suites. Evidence: `tests/`, `e2e/`, `.github/workflows/ci.yml`.
- **Evolution Era 2 additions:** focused CI bundles for cron hygiene (`test:ci:cron-hygiene`), KDS v1 (`test:ci:kds-v1:*`), nav governance (`test:ci:nav-governance`), integration honesty (`test:ci:integration-honesty`), public API v1 (`test:ci:public-api-v1`), doc canon (`test:ci:doc-canon`), storefront/pos money paths (`test:ci:storefront-money-path:*`, `test:ci:pos-money-path:*`). Evidence: `package.json`, `docs/ci-e2e-tier-matrix.md`.
- Remaining gap: several focused bundles are not yet wired into the default `quality` CI job; full strict typecheck may still require high memory. Evidence: `.github/workflows/ci.yml`, `tsconfig.typecheck.json`.

## 32. UX / Design System Gaps
- The route surface is larger than any coherent role-based information architecture currently implied by navigation. Evidence: `app/dashboard/`, `app/platform/`, `docs/UX_UI_NAVIGATION_AUDIT.md`.
- POS, kitchen, owner, marketer, and accountant experiences need sharper role-specific shells and degraded/permission-denied states. Evidence: `app/dashboard/pos/terminal/page.tsx`, `app/dashboard/`, `docs/POS_ARCHITECTURE.md`.
- Component and workflow consistency are uneven because multiple module families grew independently. Evidence: `components/`, `app/dashboard/`, `docs/NAVIGATION_QA_MATRIX.md`.

## 33. Marketing / Sales Positioning Gaps
- Current code supports a strong “unified operations platform” story, but not a safe “Toast replacement everywhere” claim. Evidence: `README.md`, `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`, `docs/INTEGRATION_MATURITY_MATRIX.md`.
- Honest claims already exist in several docs and should be preserved: no fake Stripe Terminal, no false compliance/certification claims, no unsupported external POS claims. Evidence: `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`, `docs/MARKETING_PRICING_CLAIMS_AUDIT.md`, `docs/ENTERPRISE_SECURITY_ROADMAP.md`.

## 34. Enterprise Readiness Gaps
- RBAC, tenant normalization, audit coverage consistency, release reliability, and integration certification are not yet enterprise-clean. Evidence: `lib/permissions/`, `lib/scope/`, `.github/workflows/ci.yml`, `docs/ENTERPRISE_READINESS_AUDIT_FINAL.md`.
- Security policy, DPA/privacy support, SSO/SCIM, and certification posture are roadmap-level or partial. Evidence: `SECURITY.md`, `docs/SOC2_ROADMAP_Q4.md`, `docs/ENTERPRISE_SECURITY_ROADMAP.md`.
- Platform and support surfaces are real, but enterprise governance needs a more canonical operational model before customer-facing sales motion expands. Evidence: `app/platform/`, `actions/platform-support.ts`.

## 35. Immediate Safest Next Steps
- First, create a canonical capability and permission architecture that matches the actual module surface and apply it to the highest-risk mutations first: POS, orders, billing, storefront publishing, uploads/media, integrations, and exports. Evidence: `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `actions/pos.ts`, `actions/integrations.ts`, `actions/upload.ts`.
- Second, formalize feature maturity and hide or relabel surfaces that are beta, internal, partner-gated, or placeholder-only. Evidence: `docs/MODULE_MATURITY_REPORT.md`, `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/POS_ARCHITECTURE.md`.
- Third, harden release reliability: eliminate CI workflow drift, re-validate typecheck/build strategy, and re-certify cron/runtime validation. Evidence: `.github/workflows/ci.yml`, `package.json`, `README.md`, `scripts/validate-production-crons.ts`.
- Fourth, standardize upload/media security and failure handling before expanding storefront and asset-heavy sales motion. Evidence: `actions/upload.ts`, `lib/storefront/asset-validation.ts`, `services/storefront/storefront-media-upload-service.ts`.

## Current-State Conclusion
KitchenOS already contains enough breadth to become a category-level restaurant operating platform. **Evolution Era 2 (cycles 1–30) completed** platform-safety and money-path certification on the existing spine: publish API RBAC, email-bypass removal, public POST fail-closed, money-path CI tiers, cron hygiene, KDS v1 scope/prototype, nav/integration honesty, public API contracts, and doc canon.

The next phase (**Era 3**) is not feature sprawl. Priorities: finish RBAC migration on remaining tenant-only actions (~80 files), wire focused test bundles into default CI, typecheck slicing, and incremental scorecard updates via [`docs/canonical-doc-index.md`](./canonical-doc-index.md).
