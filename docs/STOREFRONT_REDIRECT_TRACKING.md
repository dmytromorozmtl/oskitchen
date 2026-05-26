# Storefront redirect tracking

**Model:** `StorefrontRedirect` — `fromPath`, `toPath`, `httpStatus`, `hitCount`, `active` (unique per storefront + fromPath).

**Stored-only mode:** Default when `STOREFRONT_REDIRECTS_ENABLED` is not `true` or `STOREFRONT_MIDDLEWARE_SECRET` missing. UI shows hits not tracked.

**Active mode:** Middleware calls `GET /api/storefront/resolve-redirect` with secret; increments hit count on match; responds 301/302 only for validated internal targets (`lib/storefront/storefront-redirects.ts`, `services/storefront/storefront-redirect-service.ts`).

**Safety:** No external `toPath`; loop guard for trivial self maps; `/s/{slug}` suffix matching.

**QA:** Enable flag + secret → hit public URL → hitCount increases; disable → stays flat.

**Roadmap:** Admin audit log for config changes (not per hit).
