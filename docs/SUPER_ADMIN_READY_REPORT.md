# Super-admin readiness report

## Summary

OS Kitchen now has a **first-class platform administration layer**: database-backed `PlatformRole`, automatic **SUPER_ADMIN** bootstrap for **`workspace.moroz@gmail.com`**, billing and feature **super-bypass**, `/platform` operational UI (dashboard, users, workspaces, organizations, support, integrations, automations, audit, tools), **impersonation sessions** with audit logging, and scaffolding for **feature flags** + **internal notes**.

## Platform role architecture

| Role | Purpose |
|------|---------|
| `SUPER_ADMIN` | Root operator — full bypass + impersonation start |
| `PLATFORM_ADMIN` | Infrastructure / release ops |
| `SUPPORT_ADMIN` | Ticket + customer workflows |
| `IMPLEMENTATION_ADMIN` | Rollout & onboarding teams |
| `GROWTH_ADMIN` | GTM & funnel tooling |
| `PARTNER_ADMIN` | Partner programs |
| `STANDARD_USER` | Enum completeness — not stored for normal tenants |

Kitchen `UserRole`, workspace, and organization roles **remain unchanged** and continue to govern day-to-day tenant UX.

## Super-admin logic

- **Email canonical match:** `workspace.moroz@gmail.com` (case-insensitive).  
- **DB reinforcement:** `ensurePlatformOwnerBootstrap` upserts `SUPER_ADMIN` on login via `ensureAppUser`.  
- **Runtime checks:** `isSuperAdminUser` in `lib/platform-super-bypass.ts` (no import cycles with billing).  
- **Gates:** `requireSuperAdmin`, `requirePlatformRole`, `requirePlatformStaff`.

## Access rules

| Surface | Rule |
|---------|------|
| `/platform/**` | `requirePlatformStaff()` |
| Billing bypass | `getBillingAccess.platformBypass` when super-admin |
| Feature registry | `canUseFeature` returns allow for super-admin |
| Growth owner pages | `canAccessOwnerOnlySurfaces` |
| Founder KPIs | same helper |
| Plan gate (server) | super-admin renders children |
| Onboarding redirect (dashboard) | skipped when `platformBypass` |
| Enterprise API | super-admin passes |

## Impersonation

- Cookie: `kos_imp_session` (httpOnly, 1h).  
- Table: `impersonation_sessions`.  
- **Super-admin only** to start.  
- **Protected targets:** users matching super-admin email or holding `SUPER_ADMIN` row.  
- **End session:** authenticated user must match `adminUserId` on the open row.

**Gap (documented):** customer `/dashboard` data fetching still uses the signed-in Supabase user; impersonation is **operator-visible** (banner + preview hub) pending a centralized tenant context refactor.

## New database objects

Migration: `20260511200000_platform_admin_foundation`

- `platform_user_roles`
- `impersonation_sessions`
- `internal_notes`
- `feature_flags`
- `workspace_feature_overrides`

Run: `npm run db:deploy`

## Code map

| Path | Role |
|------|------|
| `lib/platform-owner.ts` | Canonical email constant |
| `lib/platform-super-bypass.ts` | Super-admin detection (Prisma-safe) |
| `lib/platform-admin.ts` | Guards + bootstrap + owner surfaces helper |
| `lib/platform-audit.ts` | Audit helper for platform actions |
| `lib/feature-flags.ts` | Feature flag + workspace override resolution |
| `actions/platform-impersonation.ts` | Start/end impersonation |
| `app/platform/*` | Internal UI |

## Verification

- `npm run typecheck` — pass  
- `npm run build` — pass (after `prisma generate`)

## Remaining risks

1. Platform staff provisioning is **manual** (SQL or future UI) — avoid granting `PLATFORM_ADMIN` casually.  
2. Impersonation does not yet re-target all Prisma queries.  
3. Feature flag UI / internal notes UI not built — schema ready only.

## Next roadmap

1. Admin UI for role assignment + MFA step-up.  
2. `resolveEffectiveTenantId()` middleware/helper + regression tests.  
3. `/platform` CSV exports + saved filters.  
4. Queue-backed webhook replay + rate limits.
