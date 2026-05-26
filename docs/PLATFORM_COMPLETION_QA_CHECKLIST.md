# Platform Completion — QA Checklist

- [ ] `/dashboard/today` renders readiness + KPIs without Prisma errors
- [ ] `/dashboard/error-recovery` tiles match counts + links resolve
- [ ] `/dashboard/system-health/data-integrity` lists issues or empty state
- [ ] `/dashboard/orders/[orderId]` 404s for other workspaces
- [ ] `/dashboard/products/[productId]` 404s cross-tenant
- [ ] `/dashboard/sales-channels/connections/[id]` hides token fields
- [ ] ⌘K returns nav matches + (after 2 chars) workspace hits
- [ ] STAFF role can open orders + error recovery + integrity
- [ ] Platform routes still blocked for non-admin users
- [ ] `workspace.moroz@gmail.com` retains bypass behavior (billing + platform)

## Commands

```
npm run typecheck
npm run lint
npm run build
```
