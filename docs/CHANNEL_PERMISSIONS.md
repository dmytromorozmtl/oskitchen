# Channel permissions

Implemented helpers in `lib/channels/channel-permissions.ts` and `lib/channels/require-channel-manage-actor.ts`:
- **Channel command mutations** (approve/reject imports, rollback, rules, handoff, simulator, webhook lab) — canonical `integrations.manage` via `requireChannelManageActor`, with owner + super-admin legacy fallback.
- **Import error CSV export** — `integrations.read` (or manage) via `requireIntegrationsReadActor`.
- **Credentials** — `integrations.manage` / owner + optional staff flag + super-admin.

Manage-only sales-channel pages use `requireSalesChannelsManagePage()` so direct URLs cannot bypass the read-only subnav. Import batch detail allows read-only viewing with `integrations.read`; approve/retry actions require manage.

`UserRole` today is `OWNER` | `STAFF`. Staff templates with `integrations.manage` (e.g. MANAGER) can run channel command mutations; read-only staff can monitor health/sync surfaces only.
