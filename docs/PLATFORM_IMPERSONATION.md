# Platform impersonation

## Who can start

`startPlatformImpersonation` uses `requireSuperAdmin()` — **founder / super-admin row only**, not every `PLATFORM_ADMIN`.

## Flow

1. Reason captured (trimmed, max 500 chars).
2. `ImpersonationSession` created; HTTP-only cookie `kos_imp_session` (1 hour, secure in prod).
3. `recordPlatformAudit` with action `platform.impersonation.start` and `targetWorkspaceId` resolved from workspace ownership or first `WorkspaceMember` row.

## End

`endPlatformImpersonation` clears cookie and writes `platform.impersonation.end`.

## UI entry

Platform users table submits `startImpersonationFormAction` when `isSuperAdminUser` is true.

## Future

- Read-only impersonation flag, in-app banner coupling to session, block impersonating protected targets (already partially enforced).
