# Critical path QA matrix

| Scenario | Owner | Manager | Kitchen | Packer | Driver | Platform | Status |
|----------|-------|---------|---------|--------|--------|----------|--------|
| Create manual order | ✓ | ✓ | — | — | — | — | Automated tests + manual |
| Confirm + send to production | ✓ | ✓ | ✓ | — | — | — | Manual |
| Complete packing path | ✓ | ✓ | ✓ | ✓ | — | — | Manual |
| Delivery route assignment | ✓ | ✓ | — | — | ✓ | — | Manual |
| Import failure triage | ✓ | ✓ | — | — | — | ✓ | Manual |
| Product mapping unblock | ✓ | ✓ | — | — | — | ✓ | Manual |
| Today KPI accuracy | ✓ | ✓ | — | — | — | — | Manual smoke |
| Platform ticket reply | — | — | — | — | — | ✓ | Manual |
| Workspace read-only audit | — | — | — | — | — | ✓ | Manual |

### Regression gates (automated)

- `npm run typecheck`
- `npm run build`
- `npm run lint` (warnings allowed pre-existing)
- `npm test`

### Business-type smoke (manual)

Restaurant / meal-prep / ghost kitchen: verify **Order hub tabs**, **Today KPIs**, and **Order detail tabs** with demo or staging data.
