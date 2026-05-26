# Audited support session foundation

## Model

`PlatformSupportSession` (Prisma) — actor, target workspace, target user (owner), `READ_ONLY` / `ASSISTED_EDIT` mode, reason, expiry, status, timestamps.

## Permissions

- `platform:support-session:start` — start session (founder/super-admin/platform admin/support admin as configured in `platform-permissions.ts`).
- `platform:support-session:end` — end active session from cookie.

## Flow

1. Platform user opens `/platform/workspaces/[workspaceId]` and submits **Start read-only session** (reason required, TTL select).
2. Server action validates platform permission, calls `startPlatformSupportSession`.
3. HttpOnly cookie `kos_support_session` stores session id for the actor.
4. **Platform banner** (`SupportSessionPlatformBanner`) shows workspace + expiry + end button.
5. **Dashboard notice** (`SupportSessionCustomerNotice`) informs workspace members while `targetWorkspaceId` matches their membership/ownership.
6. `endPlatformSupportSessionAction` clears cookie and marks **ENDED** with audit.

## Protections

- **Founder workspace** (`workspace.moroz@gmail.com` superadmin path) requires founder actor email match (see `isWorkspaceOwnerSuperAdminProtected`).
- **ASSISTED_EDIT** rejected at service layer in this release.
- **Expiry** enforced via `expireStaleSupportSessions` (batch **EXPIRED** audit).

## Explicitly deferred

- Central mutation guard that inspects cookie + blocks writes in `READ_ONLY` (requires middleware / server action wrapper rollout).
- `PLATFORM_SUPPORT_SESSION_REVOKED` operator tooling.
- Assisted edit permission matrix + audited mutation tagging (`supportSessionId` on every write).
