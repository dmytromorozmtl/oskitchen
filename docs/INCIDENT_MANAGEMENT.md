# Incident Management

## Model

Incidents are **`AuditLog`** rows:

- `action`: `platform.incident.open`
- `category`: `DEVELOPER`
- `metadata_json`: `{ title, severity, status, affectedSystems[], mitigation?, visibility }`

## UI

- `/dashboard/developer/incidents` — create form + recent list.
- Tenant isolation: non-superadmin users only see rows where `audit_logs.user_id` matches their actor id; superadmin sees platform-wide incidents.

## Next steps

- Status transitions as new audit entries + timeline UI; public status page sync.
