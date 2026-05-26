# Growth Module Audit (Founder CRM / PLG)

## Routes (current)

| Route | Purpose |
| --- | --- |
| `/dashboard/growth` | Founder Growth Command Center (KPIs + charts + risk/expansion tables). |
| `/dashboard/growth/leads` | Beta lead CRM — Kanban lanes + inbox table. |
| `/dashboard/growth/demo-requests` | Demo scheduling queue with status workflow. |
| `/dashboard/growth/feedback` | In-app feedback triage. |
| `/dashboard/growth/onboarding-calls` | Call logs. |
| `/dashboard/growth/accounts` | Account list. |
| `/dashboard/growth/customer-success` | Health + retention heuristics + CS notes. |
| `/dashboard/growth/referrals` | Referral codes/events. |
| `/dashboard/growth/usage` | `usage_events` explorer + quiet workspaces. |
| `/dashboard/growth/launch-analytics` | Launch metrics. |
| `/dashboard/growth/outreach` | Outbound assistant + campaigns. |
| `/dashboard/growth/content-library` | Sales/content assets. |
| `/dashboard/growth/roadmap` | Roadmap / feedback bridge. |

**Gap (pre-change):** UI felt like admin placeholders; analytics fragmented across pages. **P0/P1:** unify command center, tighten permissions for superadmin + platform GTM roles, extend CRM schema (UTM, lifecycle, demos).

## Data surfaces

| Store | Use |
| --- | --- |
| `BetaLead` | Primary founder CRM lead (`beta_leads`). |
| `DemoRequest` | Demo funnel (`demo_requests`). |
| `UsageEvent` | Product telemetry (`usage_events`, per user). |
| `ActivationState` | PLG milestones. |
| `ReferralCode` / `ReferralEvent` | Referral attribution. |
| `CustomerHealthSnapshot` | CS health signals. |
| `Subscription` / `InvoiceRecord` | Monetization + paid revenue proxy. |
| `OutreachCampaign` | **New** outbound program registry. |

## Permissions (pre-change)

`requireOwnerForGrowth` allowed only `UserRole.OWNER` via `canAccessOwnerOnlySurfaces` (plus superadmin bypass). **Gap:** platform `GROWTH_ADMIN` could not access Growth without being workspace owner.

## Telemetry

`UsageEvent` exists but coverage depends on client instrumentation — empty states required.

## Prioritized findings

| Issue | Risk | Priority | Mitigation |
| --- | --- | --- | --- |
| Owner-only gate excluded platform GTM | Ops friction | P0 | `canAccessGrowthModule` + platform roles. |
| No unified KPI dashboard | Slow decisions | P0 | `getGrowthCommandCenterSnapshot` + charts. |
| Leads table-only UX | Weak pipeline visibility | P1 | Kanban + lifecycle mapping. |
| Demo enum missing qualification/nurture | Pipeline hygiene | P1 | Extend `DemoRequestStatus` + columns. |
| No UTM / lifecycle on leads | Attribution blind | P1 | `BetaLead` columns + indexes. |
| MRR/ARR not modeled | Investor reporting | P2 | Invoice-based 30d revenue proxy + docs. |
| AI insights not centralized | Missed automation | P3 | Document + optional OpenAI hooks (`outreach` already guarded). |
