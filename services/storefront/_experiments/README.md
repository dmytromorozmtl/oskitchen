# Storefront experiment sync services

**Not production-critical.** These modules power experimental/regulatory cron jobs gated by:

- `ENABLE_EXPERIMENTAL_CRONS=true`
- `runCronRoute(..., { experimental: true })`

Do **not** import from production storefront checkout, cart, or theme publish paths.

Production storefront services remain in `services/storefront/` (parent directory).
