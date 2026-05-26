# Storefront advanced (final)

**Implemented:** `app/dashboard/storefront/advanced/page.tsx`, `actions/storefront-advanced.ts`, redirects + fulfillment rules JSON + test orders.

**Works:** Redirect CRUD; fulfillment upsert with `type` required; test order create/purge; checkout uses delivery match before rules for zone-aware rules.

**Limits:** Redirect external targets not supported in schema; redirect test link opens URL (does not simulate middleware).

**Config:** `STOREFRONT_REDIRECTS_ENABLED`, `STOREFRONT_MIDDLEWARE_SECRET`.

**QA:** Rule blocks checkout; inactive `active=false` skipped; test order excluded from analytics when setting on.

**Roadmap:** Redirect scheduling, CSV import.
