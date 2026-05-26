# Performance + safe fallbacks

## Performance

- Prefer **server pagination** on large tables (orders, audit, webhooks).  
- **Query limits** consistent with UX (e.g. hub lists capped — currently 150 rows in `loadOrderHubPageData`; revisit as usage grows).  
- Avoid **N+1** on hot paths — batch includes in services.  
- **Skeletons** instead of spinners on primary dashboard routes.

## Optional providers (no crash)

| Missing | UX |
|---------|-----|
| Stripe | Billing/read-only messaging; no fake charges |
| Resend | Notifications disabled with setup route |
| Google Maps | Delivery map degraded; address text still usable |
| OpenAI | Copilot deterministic fallback |
| Storage | Asset upload disabled; honest copy |
| Marketplace credentials | Integration cards show setup / not available |
| Recipes / stock | AvT LOW confidence + missing-data checklist |

## Related

- Observability services (where present) should back KPI snapshots **without** blocking page render.
