# Storefront follow-up audit

Date: 2026-05-15. Scope: dashboard tabs and public flows after the first storefront hardening pass.

## `/dashboard/storefront/forms`

| Area | Current | Missing / risk | Priority | Fix |
| --- | --- | --- | --- | --- |
| Behavior | CRUD via server actions; public link picker; submissions + CSV export | JSON builder is admin-facing | P2 | Document field schema in `lib/storefront/forms.ts` |
| Routes | `/forms`, `/forms/new`, `/forms/[id]`, `/forms/[id]/submissions` | — | — | Implemented |
| Public | Contact/catering use linked `StorefrontForm` when set | Legacy form if none linked | P1 | Default templates |

## `/dashboard/storefront/domains`

| Area | Current | Missing / risk | Priority | Fix |
| --- | --- | --- | --- | --- |
| DNS | TXT `_kos-verify.{host}` + internal resolve-host | DNS propagation delays | P0 | Status + `customDomainLastError` |
| SSL | Explicit note: TLS not inspected here | Users may expect cert proof | P1 | Hosting-provider guidance only |

## `/dashboard/storefront/advanced`

| Area | Current | Missing / risk | Priority | Fix |
| --- | --- | --- | --- | --- |
| Redirects | Prisma CRUD; `httpStatus` 301/302 | Edge redirect middleware off by default | P2 | Document opt-in |
| Rules | JSON CRUD + engine in checkout | Unknown rule types warn only | P1 | Extend `lib/storefront/fulfillment-rules.ts` |
| Test orders | Create + purge; `isTestOrder` | Deletes linked `Order` | P1 | Admin-only |

## `/dashboard/storefront/analytics`

| Area | Current | Missing / risk | Priority | Fix |
| --- | --- | --- | --- | --- |
| Data | Report service over visits, conversions, orders | UTM not parsed | P2 | Future metadata |

## `/dashboard/storefront/theme`

| Area | Current | Missing / risk | Priority | Fix |
| --- | --- | --- | --- | --- |
| Validation | HTTPS URLs, contrast helper | No remote HEAD probe | P2 | Optional |

## Public checkout / payments / consent

- Checkout enforces fulfillment rules and currency alignment server-side.
- Consent modes persist on `StorefrontSettings` via SEO form; marketing tags load per `StorefrontConsentAndMarketingScripts`.
- First-party `/api/storefront/analytics` events are separate from third-party pixels.
