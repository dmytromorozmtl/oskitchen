# Audit Logs QA Checklist

- [ ] `/dashboard/audit-logs` loads for owner; forbidden for unauthorized roles.
- [ ] Tab deep links (`?tab=security`, etc.) apply presets.
- [ ] Filters + reset + pagination (load more).
- [ ] Detail drawer loads; sensitive JSON hidden for manager.
- [ ] Export CSV/JSON downloads; formula cells escaped (`csvEscapeCell`).
- [ ] Settings save produces `SETTINGS_UPDATED`.
- [ ] Order create produces `ORDER_CREATED`.
- [ ] Import commit produces `IMPORT_COMMITTED`.
- [ ] Stripe webhook (sandbox) produces `STRIPE_WEBHOOK_RECEIVED` when user resolvable.
- [ ] Mapping approval produces `PRODUCT_MAPPING_APPROVED`.
- [ ] Role upsert produces `ROLE_PERMISSION_CHANGED`.
- [ ] Superadmin retains sensitive detail + export.
- [ ] `npm run typecheck` / `npm run build` pass.

Automated tests not added in this iteration — run manually or add Playwright coverage.
