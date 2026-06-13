import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import {
  API_MUTATION_RATE_LIMIT_EXEMPT_ROUTE_CLASSES,
  isApiMutationMiddlewareCovered,
  isApiMutationRateLimitExempt,
} from "@/lib/api/middleware-api-rate-limit";
import { getApiRoutePolicy } from "@/lib/api/route-registry";

export const API_MUTATION_RATE_LIMIT_AUDIT_POLICY_ID = "api-mutation-rate-limit-audit-v1" as const;

export const API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT =
  "artifacts/api-mutation-rate-limit-audit.json" as const;

const DEDICATED_RATE_LIMIT_PATTERNS: readonly RegExp[] = [
  /\benforceApiRateLimit\s*\(/,
  /\benforceRateLimit\s*\(/,
  /\bconsumeRateLimitToken\s*\(/,
  /\benforceWebhookIpRateLimit\s*\(/,
  /\benforceWebhookIngestRateLimit\s*\(/,
  /\benforceStorefrontRateLimit/,
  /\benforcePublicApiRateLimits\s*\(/,
  /\bguardPublicApi\s*\(/,
  /\bassertAiRateLimit\s*\(/,
];

const MUTATION_HANDLER_RE = /export async function (POST|PUT|DELETE|PATCH)\b/g;

export type ApiMutationRateLimitAuditRow = {
  routePath: string;
  file: string;
  routeClass: string | null;
  coverage: "middleware" | "dedicated" | "exempt_class";
  mutationHandlers: number;
};

export type ApiMutationRateLimitAuditReport = {
  policyId: typeof API_MUTATION_RATE_LIMIT_AUDIT_POLICY_ID;
  scannedRoutes: number;
  mutationRoutes: number;
  middlewareCovered: number;
  dedicatedCovered: number;
  exemptClass: number;
  rows: ApiMutationRateLimitAuditRow[];
};

function walk(dir: string, output: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full, output);
      continue;
    }
    if (stats.isFile() && entry === "route.ts") {
      output.push(full);
    }
  }
  return output;
}

function routePathFromFile(apiRoot: string, filePath: string): string {
  const rel = relative(apiRoot, filePath).split(sep).join("/");
  const pathWithoutLeaf = rel.replace(/\/route\.ts$/, "");
  return `/api/${pathWithoutLeaf}`.replace(/\/+$/, "");
}

function countMutationHandlers(source: string): number {
  return [...source.matchAll(MUTATION_HANDLER_RE)].length;
}

function hasDedicatedRateLimit(source: string): boolean {
  return DEDICATED_RATE_LIMIT_PATTERNS.some((pattern) => pattern.test(source));
}

export function auditApiMutationRateLimit(root = process.cwd()): ApiMutationRateLimitAuditReport {
  const apiRoot = join(root, "app", "api");
  const files = walk(apiRoot);
  const rows: ApiMutationRateLimitAuditRow[] = [];

  for (const filePath of files) {
    const source = readFileSync(filePath, "utf8");
    const mutationHandlers = countMutationHandlers(source);
    if (mutationHandlers === 0) continue;

    const routePath = routePathFromFile(apiRoot, filePath);
    const policy = getApiRoutePolicy(routePath);
    const dedicated = hasDedicatedRateLimit(source);
    const middlewareEligible = isApiMutationMiddlewareCovered(routePath);

    let coverage: ApiMutationRateLimitAuditRow["coverage"];
    if (dedicated) {
      coverage = "dedicated";
    } else if (middlewareEligible) {
      coverage = "middleware";
    } else {
      coverage = "exempt_class";
    }

    rows.push({
      routePath,
      file: relative(root, filePath).split(sep).join("/"),
      routeClass: policy?.routeClass ?? null,
      coverage,
      mutationHandlers,
    });
  }

  rows.sort((a, b) => a.routePath.localeCompare(b.routePath));

  return {
    policyId: API_MUTATION_RATE_LIMIT_AUDIT_POLICY_ID,
    scannedRoutes: files.length,
    mutationRoutes: rows.length,
    middlewareCovered: rows.filter((row) => row.coverage === "middleware").length,
    dedicatedCovered: rows.filter((row) => row.coverage === "dedicated").length,
    exemptClass: rows.filter((row) => row.coverage === "exempt_class").length,
    rows,
  };
}

export function assertApiMutationRateLimitAuditPasses(report: ApiMutationRateLimitAuditReport): void {
  const covered =
    report.middlewareCovered + report.dedicatedCovered + report.exemptClass;
  if (covered !== report.mutationRoutes) {
    throw new Error(
      `Uncovered mutation API routes: ${report.mutationRoutes - covered} of ${report.mutationRoutes}`,
    );
  }
  if (report.middlewareCovered + report.dedicatedCovered === 0) {
    throw new Error("No mutation API routes covered by middleware or dedicated rate limits");
  }
}

export function summarizeExemptRouteClasses(): readonly string[] {
  return API_MUTATION_RATE_LIMIT_EXEMPT_ROUTE_CLASSES;
}
