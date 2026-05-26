# Support privacy & security

## Access

- **Triage:** platform roles + founder/superadmin bypass.  
- **Customer:** tickets where `userId` matches, **or** email matches session, **or** `workspaceId` in user’s owned/member workspaces.

## Internal content

- `INTERNAL` comments hidden from non-triage readers in API/UI.  
- Diagnostics JSON passed through `redactSupportJson` before persistence.

## Secrets

- Never store raw env vars in ticket fields.  
- Do not echo `process.env` into UI.

## Superadmin

`workspace.moroz@gmail.com` retains full triage visibility via `isSuperAdminUser`.
