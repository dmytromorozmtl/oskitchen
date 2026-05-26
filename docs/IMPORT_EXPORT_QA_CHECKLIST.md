# Import / export QA checklist

Run after changes to CSV, Prisma models, or routes.

## Commands

```bash
npm run typecheck
npm run build
```

## Exports

- [ ] `GET /api/export?type=orders` — 200, CSV, session required  
- [ ] `GET /api/export?type=customers`  
- [ ] `GET /api/export?type=products`  
- [ ] `GET /api/export?type=production`  
- [ ] `GET /api/export?type=inventory`  
- [ ] Extended type (e.g. `menus`, `packing`) — 200  
- [ ] `audit_logs` as non-superadmin — **403**  
- [ ] `audit_logs` as superadmin — **200** (smoke in staging only)  
- [ ] Export appears in **Export history** UI  

## Templates

- [ ] `GET /api/import-export/template?kind=ingredients` — attachment  
- [ ] Invalid `kind` — 400  

## Imports (ingredients preview)

- [ ] Upload valid CSV — job created, redirect to detail  
- [ ] Upload malformed CSV — user-visible error, no job  
- [ ] Oversized file — error from limits  
- [ ] Preview rows capped — count ≤ `MAX_PREVIEW_ROWS_PERSISTED`  

## UI

- [ ] `/dashboard/import-export` — KPIs load without error  
- [ ] Subnav highlights active section  
- [ ] Empty states for imports / exports / validation  

## Security

- [ ] No secrets in export CSV for integrations  
- [ ] Cell beginning with `=` exported safely (string prefix)  

## Permissions

- [ ] Logged-out user cannot hit export API (401)  
