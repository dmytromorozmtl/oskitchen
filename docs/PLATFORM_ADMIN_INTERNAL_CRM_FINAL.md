# Platform Admin — Internal CRM (Final)

## Access

`/platform/*` is protected by `requirePlatformAccess()` in `app/platform/layout.tsx` — **never** rely on client-only hiding.

## Capabilities (target)

- Workspace directory, orgs, users, billing, entitlements, trials.  
- Support inbox + escalations + internal notes.  
- Integrations + webhooks + replay (audited, confirm-gated).  
- POS diagnostics counts on workspace detail.  
- Impersonation: reason + TTL + audit (`actions/platform-impersonation.ts`, `lib/platform/impersonation.ts`).

## Founder rule

`workspace.moroz@gmail.com` retains **PLATFORM_FOUNDER** privileges in seed/policy.

## P1

- Ticket deep links to orders / POS tx / imports (typed relations in UI).
