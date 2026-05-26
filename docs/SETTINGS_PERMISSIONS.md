# Settings Center Permissions

Permission helper: `lib/settings/settings-permissions.ts`.

## Super-admin bypass

`workspace.moroz@gmail.com` always passes every settings capability check.
The bypass is implemented via a single helper (`isSuperAdminEmail`) and is
honored by:

- The Settings layout (`view_settings`).
- Every Server Action in `actions/settings-center.ts`.
- The branding page (`OWNER` redirect short-circuited for super-admins).

## Capabilities

| Capability | Surfaces it unlocks |
| --- | --- |
| `view_settings` | Visit `/dashboard/settings` and any read-only bridge page. |
| `manage_workspace` | Workspace identity, hours, business mode, modules editor. |
| `manage_operations` | Operations section. |
| `manage_orders` | Orders section. |
| `manage_production` | Production section. |
| `manage_packing` | Packing section. |
| `manage_delivery` | Delivery section. |
| `manage_routes` | Routes section. |
| `manage_crm` | CRM section. |
| `manage_storefront` | Storefront bridge. |
| `manage_branding` | Branding section. |
| `manage_domains` | Domains bridge. |
| `manage_notifications` | Notifications bridge. |
| `manage_integrations` | Integrations bridge. |
| `manage_billing` | Billing bridge. |
| `manage_staff` | Staff bridge. |
| `manage_security` | Security bridge. |
| `manage_automation` | Automation form + studio bridge. |
| `manage_ai` | AI section. |
| `manage_imports` | Imports bridge + Backups section. |
| `manage_compliance` | Compliance section. |
| `manage_developer` | Developer bridge + toggles. |
| `manage_advanced` | Advanced section (danger zone). |

## Role grants

| Role | Grants |
| --- | --- |
| `owner` | All capabilities. |
| `admin` | All except `manage_advanced`. |
| `manager` | `view_settings`, `manage_operations`, `manage_orders`, `manage_production`, `manage_packing`, `manage_delivery`, `manage_routes`, `manage_crm`, `manage_storefront`, `manage_notifications`, `manage_automation`. |
| `staff` | `view_settings` only — sidebar shows the Control Center, every other section is hidden. |

Unknown roles fall back to `view_settings` only.

## Defense in depth

- Page-level: every page resolves the actor and calls `canUseSettings` before
  rendering. Failing the check calls `notFound()` so unauthorized users see
  the standard 404 page (no information leak).
- Action-level: every Server Action calls `canUseSettings` and returns
  `{ ok: false, error: "forbidden" }` on failure. Pages never trust client
  inputs to decide if a mutation should run.
- Provider secrets: Stripe + Resend secrets are *never* returned. Settings
  surfaces use only the boolean `configured` / `sendingEnabled` flags and
  non-secret metadata (e.g. `fromAddress`).
- Audit hooks: `developer.audit_traces` toggles extended audit context for
  future settings writes; the underlying `auditLog` model is already present.

## Adding a new role

1. Add the role string to `ROLE_GRANTS` in `lib/settings/settings-permissions.ts`.
2. Decide which `SettingsCapability` values it should hold.
3. Add a sidebar test (visit `/dashboard/settings` while signed in as that role).
4. Add a Server Action test (call any save action with that role and verify
   the `forbidden` rejection).

## Why we don’t reuse `UserRole`

The Prisma `UserRole` enum (`OWNER`, `STAFF`) is too coarse for the Settings
Center, but every existing flow continues to read from it. The
`SettingsActorScope.role` field is a free-form string keyed off the Prisma
role so future fine-grained roles (e.g. `manager`, `kitchen_lead`) can be
added without an enum migration — the role just needs an entry in
`ROLE_GRANTS`.
