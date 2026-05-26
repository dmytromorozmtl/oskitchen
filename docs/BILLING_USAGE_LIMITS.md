# Usage & limits

## Metrics tracked

| Metric | Source |
|--------|--------|
| `orders_per_month` | `Order` rows created in the current UTC calendar month. |
| `active_menus` | `Menu` rows with `catalogOnly = false`. |
| `integrations` | `IntegrationConnection` rows in `CONNECTED`. |
| `staff` | `StaffMember` rows in `ACTIVE` or `TRAINING`. |
| `brands` | `Brand` rows for the workspace. |
| `locations` | `Location` rows for the workspace. |
| `storefronts` | `StorefrontDomain` rows for the workspace. |

## Limits

`PLAN_REGISTRY[plan].limits` defines plan limits. `null` means unlimited.

## Recomputation

`services/billing/usage-service.ts → recomputeUsage(userId)` does the
counts and upserts a row per metric in `usage_counters` for caching. UI
calls `usageBarsForUser(userId, plan)` to render bars.

## Tones

- `< 80%` → ok (green)
- `80–99%` → warning (amber)
- `≥ 100%` → danger (rose)

## Server enforcement

`services/billing/entitlement-service.ts → assertWithinLimit(userId, metric)`
recomputes and compares against the active plan limit. Superadmin
bypasses every limit.

```ts
const r = await assertWithinLimit(userId, "active_menus");
if (!r.ok) throw new Error(`Plan ${r.plan} limit reached (${r.used}/${r.limit}).`);
```

## UX policy

- Soft warning at 80%.
- Hard block only where the user must not exceed the limit (e.g. attempt
  to connect a 4th integration on Pro). Use `assertWithinLimit` in the
  server action right before the write.
- Mission-critical paths (order capture, packing) must **not** be hard
  blocked silently; surface the warning + a CTA to upgrade.
