import {
  apiMutationScopeKey,
  enforceApiRateLimitOrNull,
  enforceWebhookMutationRateLimitOrNull,
} from "@/lib/api/middleware-api-rate-limit";
import { getApiRoutePolicy } from "@/lib/api/route-registry";

type RouteContext = { params?: Promise<Record<string, string>> };

export type ApiMutationRouteHandler = (
  request: Request,
  context?: RouteContext,
) => Promise<Response>;

/**
 * Route-handler wrapper — applies enforceApiRateLimit (or webhook IP ingest limit)
 * before the handler body. Use on priority mutation routes when middleware is bypassed.
 */
export function withApiMutationRateLimit(
  handler: ApiMutationRouteHandler,
  options?: { scopeKey?: string },
): ApiMutationRouteHandler {
  return async (request, context) => {
    const pathname = new URL(request.url).pathname;
    const policy = getApiRoutePolicy(pathname);
    const blocked =
      policy?.routeClass === "webhook_signed"
        ? await enforceWebhookMutationRateLimitOrNull(request, pathname)
        : await enforceApiRateLimitOrNull(
            request,
            options?.scopeKey ?? apiMutationScopeKey(pathname),
          );
    if (blocked) return blocked;
    return handler(request, context);
  };
}
