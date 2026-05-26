# Platform security hardening

## Implemented

- **Platform roles** stored in `platform_user_roles` — elevated access separate from kitchen `UserRole`.
- **Canonical super-admin** identity: `workspace.moroz@gmail.com` — always receives `SUPER_ADMIN` on bootstrap.
- **`/platform` namespace** — gated by `requirePlatformStaff()` (any non-standard platform role, or super-admin email before row exists).
- **Billing / feature bypass** — only for super-admin identity (email or `SUPER_ADMIN` row), not for generic `OWNER`s.
- **Impersonation** — httpOnly cookie, DB session row, audit events `platform.impersonation.*`, cannot target another super-admin.
- **Enterprise public API** — super-admin API users pass entitlement check without Stripe subscription linkage.

## Hardening backlog

1. **Rate limiting** — add middleware or edge config for `/platform` and sensitive POST routes (placeholders acceptable on Vercel until Redis).  
2. **IP allowlist** (optional) — enterprise customers may require VPN-only platform access.  
3. **MFA** — require step-up auth for `SUPER_ADMIN` destructive actions.  
4. **Structured security logs** — JSON lines with `action`, `actorId`, `tenantId`, `requestId`.  
5. **CSP / headers** — review `next.config` security headers for platform routes.  
6. **Impersonation scope** — today the banner + preview hub are explicit; wiring Prisma queries to an “effective user id” must be deliberate to avoid accidental cross-tenant writes.

## Operational rules

- Only **super-admin** starts impersonation sessions.  
- Any authenticated **admin user who owns the session row** may end impersonation.  
- Never log tokens, cookies, or raw integration secrets in audit metadata.
