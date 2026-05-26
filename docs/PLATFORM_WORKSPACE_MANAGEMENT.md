# Platform workspace management

## List

`/platform/workspaces` — requires `platform:workspaces:read`. Lists recent workspaces with owner, org link, business type, active flag, link to detail.

## Detail

`/platform/workspaces/[workspaceId]` — read-only snapshot:

- Owner profile and workspace-scoped role on `UserProfile`.
- Billing via **owner** `Subscription` (workspace billing is owner-linked in current schema).
- User-level `TrialState` on owner.
- Organization link when present.

## Planned (not yet UI)

- Archive / lock, plan changes, module toggles, entitlement overrides — each should use `recordPlatformAudit`, confirmation for destructive ops, and optional `platform-dangerous-actions` flow.
