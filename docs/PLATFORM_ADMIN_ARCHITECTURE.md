# Platform admin architecture

## Layers

1. **Guards** (`lib/platform/platform-guards.ts`): `requirePlatformAccess`, `assertPlatformPermission`, founder bootstrap via `ensurePlatformOwnerBootstrap`.
2. **Permissions** (`lib/platform/platform-permissions.ts`): string keys; `resolvePlatformPermissions` unions Prisma `PlatformRole` rows; founder email bypass.
3. **Navigation** (`lib/platform/platform-navigation.ts`): grouped IA; `filterNavForPermissions`.
4. **UI shell** (`app/platform/layout.tsx`, `components/platform/platform-chrome.tsx`): dark chrome, env badge, role strip, Cmd/Ctrl+K search shortcut.
5. **Services** (`services/platform/*`): read models through Prisma; no secrets in selects.
6. **Actions** (`actions/platform-support.ts`, `actions/platform-impersonation.ts`): mutate data + `recordPlatformAudit`.

## Data model (current)

- Staff: `PlatformUserRole`.
- Audit: `AuditLog` with `category: "PLATFORM"` or actions prefixed `platform.`.
- Impersonation: `ImpersonationSession` + cookie.
- Support: `SupportTicket`, `SupportTicketComment`, `SupportTicketEvent`.
- Flags: `FeatureFlag`, `WorkspaceFeatureOverride`.

Extended tables from the long-term spec (dedicated `PlatformActionLog`, etc.) are **not** required for this architecture to function — `AuditLog` is the canonical platform audit store today.

## Service map

| Service | Role |
|---------|------|
| `platform-service` | Dashboard snapshot counts |
| `platform-support-service` | Ticket fetch + filtered lists |
| `platform-workspace-service` | Workspace detail for operators |
| `platform-audit-service` | Filtered audit tail |
| `platform-search-service` | Cross-tenant search (bounded) |
| Other `platform-*-service` | Stubs / future orchestration |

## Conventions

- Server Components fetch data; forms post to server actions.
- Revalidate `/platform/support` and ticket detail after mutations.
- Never return encrypted integration fields to the client UI.
