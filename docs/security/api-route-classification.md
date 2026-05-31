# API Route Classification

Every `app/api/**/route.ts` file must have an explicit authorization story.

OS Kitchen has too many API routes to rely on memory or code review discipline
alone. New routes must be classifiable by static audit before they are allowed
to ship.

## Allowed Classes

- `public`
- `webhook`
- `cron`
- `session`
- `platform`
- `storefront`
- `health`
- `internal`
- `invite`

## How a Route Passes the Audit

A route is considered valid if at least one of the following is true:

1. the file contains a comment like:

```ts
// @auth-classification session
```

2. the file uses an approved helper such as:

- `withApiGuard(...)`
- `requireApiSession()`
- `guardPublicApi(...)`
- `runCronRoute(...)`
- `requireBearerWebhookSecret(...)`
- `requireConfiguredWebhookSecret(...)`
- `verifyResendWebhookSignature(...)`
- `requireStorefrontMiddlewareSecret(...)`
- `hasStorefrontPreviewAccess(...)`

3. the route is explicitly covered by:

- `config/security/api-route-classification.json`

Audit command:

```bash
npm run audit:api-routes
```

## Policy Intent

### `public`

Unauthenticated or API-key-based external access. Must be intentionally public,
strictly validated, and rate-limited.

### `webhook`

Signed third-party ingress. Must verify signature, reject replay/invalid
requests, and prefer async processing in production.

### `cron`

Machine-triggered internal automation. Must require cron secret and respect
production allowlist rules.

### `session`

Dashboard/session-bound operator API. Must require authenticated session and
tenant-scoped permission checks.

### `platform`

Internal platform admin access. Must be restricted to platform users with
strong audit logging.

### `storefront`

Customer-facing commerce routes. Must be safe for public traffic, abuse-aware,
and explicit about whether they are read-only or mutation endpoints.

### `health`

Operational read-only health / docs / readiness surfaces. Must never leak
secrets.

### `internal`

Non-public internal service traffic. Must never be exposed accidentally without
explicit gating.

### `invite`

Invitation/acceptance flows that are intentionally public but token-based.

## Recommended Pattern for New Routes

For new session-bound routes, prefer a shared helper instead of inline auth
logic:

```ts
export const POST = withApiGuard(async (request, context) => {
  // handler logic
});
```

For public API routes, prefer:

```ts
const guard = await guardPublicApi(request, "scope", "bucket");
```

## Relationship to Existing Registry

OS Kitchen already has a route-policy registry in:

- `lib/api/route-registry.ts`

The classification audit is complementary:

- the registry remains the runtime policy lookup,
- this audit becomes the static proof that every route has an auth story.

Some high-risk routes are intentionally stricter than the base registry. In
particular, `handler_session` billing and legacy exact session endpoints must
show file-local proof via an approved helper or explicit classification comment;
top-level prefix coverage alone is not enough.

The same rule now applies to selected high-risk `webhook` and `storefront`
routes whose safety depends on an explicit secret/signature contract rather than
their top-level directory name alone.

## Review Rule

If a route cannot be cleanly classified:

1. do not ship it silently,
2. add a temporary explicit config entry,
3. document the reason in review,
4. schedule conversion to a shared guard/helper pattern.
