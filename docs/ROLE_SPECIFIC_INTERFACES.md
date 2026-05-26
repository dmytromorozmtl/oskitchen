# Role-specific interfaces (roadmap)

## Roles

Owner, Manager, Chef / kitchen lead, Kitchen staff, Packer, Driver, Bar staff, Café staff, Server (placeholder), Accountant, Viewer.

## Routing

- Add `preferredHomeRoute` or derive from role + business mode table.  
- Middleware or client redirect after login: e.g. Packer → `/dashboard/packing/verify`, Driver → `/dashboard/routes`.

## Navigation

Filter `NAV_GROUPS` links by role capability flags (reuse subscription / admin checks patterns).

## Empty states

Use `lib/terminology.ts` for role-aware copy (“Scan outbound bags” vs “Review tonight’s prep”).

Superadmin (`workspace.moroz@gmail.com` / platform) keeps full nav regardless of role.
