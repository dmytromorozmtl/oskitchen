# Super-admin audit (OS Kitchen)

## Scope

OS Kitchen uses **Supabase Auth** (JWT) for identity, **`UserProfile`** (`users` table) as the app tenant anchor, **`UserRole` (OWNER/STAFF)** for kitchen-level permissions, **workspace / organization** membership for multi-tenant groundwork, **`getBillingAccess` + `canUseFeature`** for commercial gates, and **dashboard layout** redirects for onboarding and trial enforcement.

## Findings by area

### 1. Authentication (Supabase)

| Topic | Current logic | Risk | Rank |
|-------|-----------------|------|------|
| Session source | `getSessionUser` / `requireSessionUser` via `@supabase/ssr` | Standard; no platform elevation in JWT | Low |
| App user provisioning | `ensureAppUser` upserts profile + subscription + trial | None for platform | Low |

**Fix applied:** `ensureAppUser` now bootstraps **platform owner** role for canonical email (dynamic import avoids circular deps).

### 2. Billing & plan gates

| Topic | Current logic | Risk | Rank |
|-------|-----------------|------|------|
| Trial lockout | `getBillingAccess` + `BillingAccessGuard` client redirect | Owner locked out of ops during trial edge cases | Medium |
| Feature matrix | `canUseFeature` + plan ranks | Legitimate upsell friction | Low |
| Dev bypass | `DEV_BYPASS_BILLING` env | Must never ship enabled in prod | High |

**Fix applied:** **Platform super-admin** path in `getBillingAccess` + `canUseFeature` + enterprise API resolver grants full access without mutating Stripe.

### 3. Role system

| Topic | Current logic | Risk | Rank |
|-------|-----------------|------|------|
| Kitchen `UserRole` | OWNER vs STAFF | Growth / founder pages OWNER-only | Medium |
| Workspace roles | `WorkspaceMemberRole` | Not always enforced on every query | High |
| Platform roles | **New** `PlatformUserRole` + `PlatformRole` enum | Must be enforced on `/platform` and sensitive actions | Critical |

**Fix applied:** `PlatformRole` + `PlatformUserRole` model; `/platform` layout uses `requirePlatformStaff()`.

### 4. Route guards

| Topic | Current logic | Risk | Rank |
|-------|-----------------|------|------|
| Dashboard | Session + onboarding + billing props | Super-admin previously forced through onboarding | High |
| Growth subtree | `requireOwnerForGrowth` | Blocked internal operators | Medium |
| Founder KPIs | OWNER-only | Same | Medium |
| Plan gate (server) | `PlanGate` | Blocked super preview | Medium |

**Fixes applied:** Onboarding skip + owner-only surfaces + `PlanGate` bypass for super-admin.

### 5. API access

| Topic | Current logic | Risk | Rank |
|-------|-----------------|------|------|
| Enterprise API | `resolveEnterpriseApiUserId` | Super-admin API keys previously gated | Medium |

**Fix applied:** super-admin user passes enterprise gate without Stripe linkage.

### 6. Impersonation & audit

| Topic | Current logic | Risk | Rank |
|-------|-----------------|------|------|
| Impersonation | **New** cookie + `ImpersonationSession` | Dashboard-wide “act as user” not yet wired into every Prisma call | High |
| Audit trail | `AuditLog` + `recordPlatformAudit` | Platform actions must stay consistent | Medium |

**Fix applied:** start/end actions + cookie + banner on `/platform`; **cannot impersonate** another super-admin target.

### 7. Internal notes & feature flags

| Topic | Status | Rank |
|-------|--------|------|
| `InternalNote` | Schema added — UI pending | Medium |
| `FeatureFlag` / `WorkspaceFeatureOverride` | `lib/feature-flags.ts` helpers — UI pending | Medium |

### 8. Privilege escalation risks (mitigations)

1. **Email spoofing** — trust is from Supabase verified session email, not client input.  
2. **Platform staff assignment** — only DB rows; document manual provisioning until admin UI ships.  
3. **Cookie theft** — `httpOnly` + `secure` in production; short TTL (1h).  
4. **Cross-tenant data in `/platform`** — every page must keep using `requirePlatformStaff`; add tests next.

## Recommended next steps

1. Wire **effective tenant context** for read-only dashboards when impersonation cookie is set (central `resolveTenantId()` helper).  
2. Admin UI to grant `PLATFORM_ADMIN` / `SUPPORT_ADMIN` without SQL.  
3. Rate limits on `/platform` routes + `/api/*` admin extensions.  
4. Expand audit metadata schema for structured SIEM export.
