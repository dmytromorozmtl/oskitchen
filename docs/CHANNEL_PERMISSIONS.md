# Channel permissions

Implemented helpers in `lib/channels/channel-permissions.ts`:
- **Credentials** — owner + optional staff flag + super-admin.
- **Approve / rollback imports** — owner + `workspace.moroz@gmail.com` super-admin.
- **Raw payload / webhook lab / replay** — owner + super-admin.
- **Rules** — owner + super-admin.

`UserRole` today is `OWNER` | `STAFF`. Treat STAFF as read-only for channel command actions until workspace roles land.
