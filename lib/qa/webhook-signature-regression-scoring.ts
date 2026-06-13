import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import {
  WEBHOOK_SIGNATURE_REGRESSION_EXPECTED_ROUTE_COUNT,
  acceptsWebhookInvalidSignatureStatus,
} from "@/lib/qa/webhook-signature-regression-policy";
import {
  buildWebhookSignatureAuditReport,
  type WebhookSignatureAuditRow,
} from "@/scripts/audit-webhook-signatures";

export type WebhookSignatureRegressionScenarioResult = {
  apiPath: string;
  routeFile: string;
  signatureVerified: boolean;
  invalidSignatureFailClosed: boolean;
  bearerProbeStatus: number | null;
  passed: boolean;
  detail: string;
};

export type WebhookSignatureRegressionBenchmarkResult = {
  routeCount: number;
  expectedRouteCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarios: WebhookSignatureRegressionScenarioResult[];
};

function readCombinedRouteSource(root: string, row: WebhookSignatureAuditRow): string {
  const routeSource = readFileSync(join(root, row.routeFile), "utf8");
  const handlerSources = row.handlerFiles
    .map((file) => (existsSync(join(root, file)) ? readFileSync(join(root, file), "utf8") : ""))
    .join("\n");
  return `${routeSource}\n${handlerSources}`;
}

/** Invalid signature must fail closed — 401 (or Stripe constructEvent 400). */
export function hasInvalidSignatureFailClosed(source: string): boolean {
  if (source.includes("requireBearerWebhookSecret")) {
    return true;
  }
  if (/status:\s*401/.test(source)) {
    return true;
  }
  if (/result\.error\s*===\s*["']Unauthorized["']\s*\?\s*401/.test(source)) {
    return true;
  }
  if (/constructEvent\s*\(/.test(source) && /status:\s*400/.test(source)) {
    return true;
  }
  if (/invalid_signature/.test(source) && /status:\s*401/.test(source)) {
    return true;
  }
  return false;
}

export function probeBearerWebhookInvalidSignature(secret = "regression-test-secret"): number | null {
  const response = requireBearerWebhookSecret(
    new Request("https://example.com/api/webhooks/test", {
      method: "POST",
      headers: {
        Authorization: "Bearer definitely-not-the-secret",
        "Content-Type": "application/json",
      },
      body: "{}",
    }),
    { secret },
  );
  return response?.status ?? null;
}

export function runWebhookSignatureRegressionScenario(
  root: string,
  row: WebhookSignatureAuditRow,
): WebhookSignatureRegressionScenarioResult {
  const combinedSource = readCombinedRouteSource(root, row);
  const signatureVerified = row.signatureVerifiedInCode;
  const invalidSignatureFailClosed = hasInvalidSignatureFailClosed(combinedSource);

  let bearerProbeStatus: number | null = null;
  if (combinedSource.includes("requireBearerWebhookSecret")) {
    bearerProbeStatus = probeBearerWebhookInvalidSignature();
  }

  const bearerProbeOk =
    bearerProbeStatus == null || acceptsWebhookInvalidSignatureStatus(bearerProbeStatus);

  const passed = signatureVerified && invalidSignatureFailClosed && bearerProbeOk;

  let detail = "verified + fail-closed";
  if (!signatureVerified) {
    detail = "missing signature verification in source";
  } else if (!invalidSignatureFailClosed) {
    detail = "no invalid-signature fail-closed pattern (401/400/bearer guard)";
  } else if (!bearerProbeOk) {
    detail = `bearer probe returned ${bearerProbeStatus}, expected 401`;
  }

  return {
    apiPath: row.apiPath,
    routeFile: row.routeFile,
    signatureVerified,
    invalidSignatureFailClosed,
    bearerProbeStatus,
    passed,
    detail,
  };
}

export function runWebhookSignatureRegressionBenchmark(
  root = process.cwd(),
): WebhookSignatureRegressionBenchmarkResult {
  const report = buildWebhookSignatureAuditReport(root);
  const scenarios = report.routes.map((row) =>
    runWebhookSignatureRegressionScenario(root, row),
  );

  const routeCount = scenarios.length;
  const passedCount = scenarios.filter((row) => row.passed).length;
  const passPct = routeCount === 0 ? 0 : Math.round((passedCount / routeCount) * 100);

  return {
    routeCount,
    expectedRouteCount: WEBHOOK_SIGNATURE_REGRESSION_EXPECTED_ROUTE_COUNT,
    passedCount,
    passPct,
    passed:
      passedCount === routeCount &&
      routeCount === WEBHOOK_SIGNATURE_REGRESSION_EXPECTED_ROUTE_COUNT,
    scenarios,
  };
}
