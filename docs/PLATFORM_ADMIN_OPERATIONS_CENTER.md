# Platform admin operations center

## Access

- `/platform/*` layout uses `requirePlatformAccess` + permission-filtered nav (`lib/platform/platform-navigation.ts`).
- Founder: `workspace.moroz@gmail.com` (`lib/platform-owner.ts`).

## New surfaces

- `/platform/system-health` — cross-tenant operational aggregates + recent platform audit rows.
- `/platform/error-recovery` — triage tiles into webhooks, integrations, automations, tickets.

## Requirements

- **Separate platform roles** from workspace roles (`lib/platform/platform-permissions.ts`).
- **Audit** every sensitive action (impersonation, billing overrides, ticket edits).

## Priority

**P0** security + audit; **P1** operator UX depth.
