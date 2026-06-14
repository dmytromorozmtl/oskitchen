# Preview route redirect regression (P2-52)

**Policy:** `preview-route-redirect-regression-p2-52-v1`  
**Unit:** `tests/unit/preview-route-redirect-regression-p2-52.test.ts`  
**E2E:** `e2e/preview-route-redirect-regression.spec.ts`

Gap P2-52 locks preview=blocked redirect regression for canonical hidden routes so deep links survive the middleware chain.

## Canonical routes

| Shorthand | Full path |
|-----------|-----------|
| `/ai/co-pilot` | `/dashboard/ai/co-pilot` |
| `/enterprise/multi-location` | `/dashboard/enterprise/multi-location` |
| `/quick-start` | `/dashboard/quick-start` |

## Redirect chain

| Step | Behavior |
|------|----------|
| `blocked_route` | Route has `hidden_default` / preview exposure |
| `preview_redirect` | Middleware → `/dashboard/today?preview=blocked` |
| `redirect_param` | `?redirect=` encodes original path (+ query) |
| `login_return_path` | `resolveDashboardLoginReturnPath` restores deep link |

Built on P0-5 (`previewRouteRedirectUrl`) and P1-40 (`enforcePreviewRouteGuard`).

## CI wiring check

```bash
npm run check:preview-route-redirect-regression-p2-52
```

## Live browser E2E (optional)

```bash
E2E_PREVIEW_ROUTE_REDIRECT=true npm run test:e2e:preview-route-redirect-regression
```

Contract/regression tests run without the flag.

## Artifact

`artifacts/preview-route-redirect-regression-p2-52.json`
