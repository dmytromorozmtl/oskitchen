# Channel golden path (WooCommerce / Shopify) — honesty checklist

**Policy:** `era14-channel-golden-path-recert-v1` (`lib/integrations/channel-golden-path-era14-policy.ts`)

**Extends:** `era4-channel-golden-path-v1`, `era12-channel-golden-path-recert-v1`, `era12-channel-golden-path-smoke-v1`

**Posture:** Software path certified in CI; live store smoke is **optional** and **not** in default `ci.yml`.

## Certified today (CI — no live store API)

| Stage | What is proven | Evidence |
|-------|----------------|----------|
| normalize | Webhook payload → canonical shape | `test:ci:channel-golden-path` |
| persist_external_order | `externalOrder` row | fixtures + unit tests |
| stage_channel_import | Channel import staging | `channel-certification.test.ts` |
| order_hub_visibility | Order hub lists scoped external orders | `loadOrderHubPageData` + `externalOrderListWhereForOwner` |

## Staging / manual (not default CI)

| Step | Command | Notes |
|------|---------|-------|
| Cert bundle | `npm run smoke:channel-golden-path` | Runs `test:ci:channel-golden-path:cert` + era14 recert |
| Live tenant smoke | `npm run smoke:woo-shopify` | Requires `DATABASE_URL` + connection; `--skip-live` for credentials-only |

## Not certified (honest gaps)

| Claim | Status |
|-------|--------|
| Webhook auto-creates kitchen `Order` rows | **False** — `kitchenOrderAutoCreateFromWebhook: false` |
| Full bidirectional marketplace sync | **Out of scope** — partial integration |
| Live Woo/Shopify REST in every CI run | **False** — optional staging smoke only |
| Production marketplace parity vs Square/Toast | **Forbidden** — BETA / pilot_ready only |

## Manual pilot checklist

1. Run `npm run test:ci:channel-golden-path:cert` on release branches touching webhooks/integrations.
2. For tenant pilots: `npm run smoke:woo-shopify -- --owner-email …` (add `--skip-live` when store API unavailable).
3. Verify order hub shows imported external orders for the workspace owner.
4. Do not demo kitchen ticket auto-creation from Woo/Shopify webhooks unless a future era ships it.
5. Use `docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md` for per-tenant sign-off.

## CI certification

- `npm run test:ci:channel-golden-path-era14:cert` (chained in `test:ci:channel-golden-path:cert`)
- Governance: `test:ci:governance-bundles:partition-platform`
