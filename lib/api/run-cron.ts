import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { logger } from "@/lib/logger";
import {
  isExperimentalCronsEnabled,
  verifyCronSecret,
  verifyExperimentalCron,
} from "@/lib/security/cron-auth";
import {
  cronSlugFromPathname,
  isAllowedProductionCronSlug,
  isExperimentalCronPath,
} from "@/services/cron/production-manifest";
import {
  recordCronExecutionFinished,
  recordCronExecutionStarted,
} from "@/services/cron/cron-execution-evidence";
import { emitCronFailure } from "@/services/observability/ops-signals";
import { logCronAuthDenied } from "@/services/cron/cron-auth-audit";

export type CronRouteOptions = {
  /** @deprecated Prefer production manifest; kept for route-level documentation only. */
  experimental?: boolean;
};

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function experimentalBlockedInProduction(pathname: string): boolean {
  return isProductionRuntime() && isExperimentalCronPath(pathname) && !isExperimentalCronsEnabled();
}

function stampExperimentalCronResponse(response: NextResponse, slug: string): NextResponse {
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-KOS-Cron-Tier", "experimental");
  return response;
}

function logExperimentalCronInvocation(slug: string, pathname: string): void {
  logger.warn("experimental_cron_invoked", { slug, pathname });
  if (process.env.SENTRY_DSN?.trim()) {
    Sentry.withScope((scope) => {
      scope.setTag("risk", "experimental_cron");
      scope.setTag("cron_slug", slug);
      Sentry.captureMessage(`Experimental cron executed: ${slug}`, "warning");
    });
  }
}

/**
 * Shared entry for `/api/cron/*` routes.
 * Production allowlist: `services/cron/production-manifest.ts`.
 */
export async function runCronRoute(
  request: Request,
  handler: () => Promise<NextResponse>,
  _options?: CronRouteOptions,
): Promise<NextResponse> {
  const pathname = new URL(request.url).pathname;
  const slug = cronSlugFromPathname(pathname);

  if (experimentalBlockedInProduction(pathname)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isProductionTier = slug != null && isAllowedProductionCronSlug(slug);
  const auth = isProductionTier ? verifyCronSecret(request) : verifyExperimentalCron(request);
  if (!auth.ok) {
    if (auth.reason !== "experimental_disabled") {
      await logCronAuthDenied({
        slug,
        pathname,
        reason: auth.reason,
        statusCode: auth.response.status === 503 ? 503 : 401,
      });
    }
    return auth.response;
  }

  if (!isProductionTier && slug) {
    logExperimentalCronInvocation(slug, pathname);
  }

  const started = Date.now();
  const startedAt = new Date(started);
  const shouldTrackProductionEvidence = isProductionTier && Boolean(slug) && isProductionRuntime();
  try {
    if (shouldTrackProductionEvidence && slug) {
      await recordCronExecutionStarted({ slug, productionTier: true, startedAt });
    }
    let res = await handler();
    if (shouldTrackProductionEvidence && slug) {
      await recordCronExecutionFinished({
        slug,
        productionTier: true,
        startedAt,
        statusCode: res.status,
      });
    }
    if (!isProductionTier) {
      res = stampExperimentalCronResponse(res, slug ?? "unknown");
    }
    const durationMs = Date.now() - started;
    if (durationMs > 120_000) {
      logger.warn("cron_slow", { route: pathname, durationMs, tier: isProductionTier ? "production" : "experimental" });
    }
    return res;
  } catch (err) {
    if (shouldTrackProductionEvidence && slug) {
      await recordCronExecutionFinished({
        slug,
        productionTier: true,
        startedAt,
        statusCode: 500,
        error: err,
      });
    }
    emitCronFailure(pathname, err, Date.now() - started);
    return NextResponse.json({ error: "Cron handler failed" }, { status: 500 });
  }
}

export { isExperimentalCronsEnabled };
