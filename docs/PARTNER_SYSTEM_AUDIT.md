# Partner system audit

Date: 2026-05-13. Scope: `/dashboard/partner`, Prisma partner models, `lib/partner/*`, `services/partner/*`, tenant isolation, billing/support boundaries.

## Executive summary

OS Kitchen already had `PartnerAccount`, `PartnerMember`, and `PartnerClient` as a thin program layer. The Partner Operating System extension adds typed lifecycle fields, revenue and managed-ticket tables, a command-center snapshot service, and a gated dashboard UI. Remaining gaps are mostly operational depth (server pagination, mutation APIs, payout automation, SSO) rather than missing tables.

## Findings

| Area | Current behavior | Risk | Scalability | Security | Recommended fix | Priority |
|------|------------------|------|-------------|----------|-----------------|----------|
| Partner dashboard (pre-change) | Placeholder list of owned accounts only. | Partners cannot operate at scale; data scattered. | Poor: no aggregates, no filtering. | Low direct risk; under-utilization. | Ship command center + `getPartnerCommandCenterSnapshot` + UI. | P0 |
| Permissions | Owners, superadmin (`workspace.moroz@gmail.com`), platform partner-related roles, account owners, linked `PartnerMember.userId`. | Over-broad platform roles see all partner accounts. | OK for small GTM team; audit role assignments. | Medium: platform role misuse = cross-tenant read. | Tighten default platform assignments; add org-level RBAC on mutations (future). | P1 |
| Tenant isolation | All queries scoped by `getAccessiblePartnerAccountIds`. | If new endpoints skip helper, data leaks. | Good when enforced consistently. | High if bypassed. | Centralize data access in partner services; add tests (see QA doc). | P0 |
| Workspace ownership | `PartnerClient.workspaceId` optional link to `Workspace`. | Stale or missing linkage obscures true tenant. | Medium. | Low unless partner acts on wrong workspace. | Enforce linkage at onboarding completion; surface “unlink” warnings. | P1 |
| Onboarding flow | Labels + stages on `PartnerClient`; no automated state machine. | Inconsistent stage updates. | OK manually; breaks at volume. | Low. | Add server actions for stage transitions + validation rules. | P2 |
| Support visibility | `PartnerManagedTicket` + open ticket count in KPIs. | Tickets not yet wired to customer ticketing UX. | Medium. | Medium if PII in notes without ACL. | Field-level ACL on notes; link to internal ticket IDs. | P2 |
| Billing ownership | `billingOwnerUserId` on account; MRR on client rows. | Revenue attribution vs Stripe/subscription source of truth drift. | Medium. | Low if cents are non-binding placeholders. | Reconcile with billing service; mark “advisory” vs “contractual”. | P2 |
| Implementation workflows | Enum pipeline + distribution charts; no task engine. | Partners track work outside the product. | Medium. | Low. | Optional `PartnerImplementationTask` model or reuse existing task system. | P2 |
| White-label readiness | Flags + domain fields on `PartnerAccount`. | Domains not verified; email/PDF branding not automated. | N/A. | High if DNS verification skipped (phishing). | Domain verification + signed asset URLs only. | P2 |
| Agency support | Multi-client table, bulk ID copy, saved filters. | No clone/template automation yet. | Medium. | Low. | Workspace clone + playbook templates (phase 15). | P3 |
| Public partner client routes | Previously listed clients without session scope. | Cross-tenant data exposure. | N/A. | High until fixed. | Require login + scope with `getAccessiblePartnerAccountIds`; detail `notFound` if out of scope. | P0 (mitigated) |
| Enterprise readiness | Dashboard gated + PlanGate; no SSO/MFA in partner layer. | Procurement blockers. | N/A. | Medium. | Document SSO readiness; use platform auth hardening. | P2 |

## Positive controls

- **Founder / superadmin**: `workspace.moroz@gmail.com` remains unrestricted via `isSuperAdminUser` / platform bootstrap patterns.
- **Degraded mode**: Command center catches Prisma migration errors and returns empty metrics instead of crashing production.

## Next audit cycle

After shipping server-side pagination and partner mutations, re-audit: API scopes, audit log coverage, and cross-linkage to Growth CRM / Beta applications.
