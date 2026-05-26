# Data exports

## In-app exports (CSV)

Settings → **Data exports** card triggers authenticated requests:

- Endpoint: `GET /api/export?type=orders|customers|products|production|inventory`
- Auth: session required (same rules as dashboard).

### Coverage

| Type | Notes |
|------|-------|
| `orders` | CSV of order rows |
| `customers` | CRM export |
| `products` | Catalog |
| `production` | Production entries |
| `inventory` | Placeholder row until full inventory schema ships |

## Backup guidance

- Supabase: rely on **automated backups** (plan-dependent) + periodic logical dumps for critical workspaces.
- Document RPO/RTO targets internally — do not over-promise in UI.

## Delete workspace (placeholder)

- Settings section should clarify **irreversibility** and legal retention — implement hard delete only after counsel review.

## Security

- Exports are **sensitive** — restrict to trusted roles (Owner/Manager).
- Never cache CSV URLs publicly.
