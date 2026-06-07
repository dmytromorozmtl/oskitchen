/**
 * Absolute Final Task 54 — Core Web Vitals performance regression CI gate.
 *
 * Compares LHCI manifest medians against a committed baseline with tolerance,
 * plus absolute ceilings shared with Task 50.
 *
 * @see lib/performance/lighthouse-core-web-vitals-policy.ts
 * @see scripts/check-cwv-performance-regression.ts
 */

import {
  coreWebVitalsPass,
  evaluateCoreWebVitals,
  LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID,
  LIGHTHOUSE_CWV_CLS_MAX,
  LIGHTHOUSE_CWV_FCP_MAX_MS,
  LIGHTHOUSE_CWV_LCP_MAX_MS,
  LIGHTHOUSE_CWV_PATHS,
  type CoreWebVitalsMetrics,
} from "@/lib/performance/lighthouse-core-web-vitals-policy";

export const CWV_PERFORMANCE_REGRESSION_POLICY_ID =
  "cwv-performance-regression-absolute-final-v1" as const;

export const CWV_PERFORMANCE_BASELINE_ARTIFACT =
  "artifacts/cwv-performance-baseline.json" as const;

export const CWV_PERFORMANCE_REGRESSION_MANIFEST =
  ".lighthouseci/manifest.json" as const;

export const CWV_PERFORMANCE_REGRESSION_WORKFLOW_PATH =
  ".github/workflows/lighthouse.yml" as const;

export const CWV_PERFORMANCE_REGRESSION_CHECK_SCRIPT =
  "scripts/check-cwv-performance-regression.ts" as const;

/** Allowed median regression vs committed baseline (percent). */
export const CWV_PERFORMANCE_REGRESSION_TOLERANCE_PERCENT = 10 as const;

/** Extra CLS slack on top of baseline median (unitless). */
export const CWV_PERFORMANCE_CLS_REGRESSION_DELTA = 0.02 as const;

export const CWV_PERFORMANCE_REGRESSION_CI_SCRIPTS = [
  "test:ci:performance-regression-cwv",
  "check:cwv-performance-regression",
] as const;

export type CwvRouteBaseline = {
  path: string;
  fcpMs: number;
  lcpMs: number;
  cls: number;
};

export type CwvPerformanceBaseline = {
  version: string;
  policyId: typeof CWV_PERFORMANCE_REGRESSION_POLICY_ID;
  upstreamPolicyId: typeof LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID;
  generatedAt: string;
  tolerancePercent: number;
  routes: readonly CwvRouteBaseline[];
};

export type ParsedLhciCwvEntry = {
  path: string;
  url: string;
  metrics: CoreWebVitalsMetrics;
};

export type CwvRegressionViolation = {
  path: string;
  kind: "baseline_regression" | "absolute_ceiling" | "missing_route";
  metric: "fcp" | "lcp" | "cls";
  value: number;
  limit: number;
  message: string;
};

type LhciManifestEntry = {
  url?: string;
  summary?: Record<string, number | undefined>;
};

export function normalizeLhciPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/\/$/, "") || "/";
  } catch {
    return url.replace(/\/$/, "") || "/";
  }
}

export function parseLhciCwvManifest(entries: readonly LhciManifestEntry[]): ParsedLhciCwvEntry[] {
  const parsed: ParsedLhciCwvEntry[] = [];

  for (const entry of entries) {
    const url = entry.url?.trim();
    if (!url) continue;

    const summary = entry.summary ?? {};
    const fcpMs = summary["first-contentful-paint"];
    const lcpMs = summary["largest-contentful-paint"];
    const cls = summary["cumulative-layout-shift"];

    if (fcpMs == null || lcpMs == null || cls == null) continue;

    parsed.push({
      path: normalizeLhciPath(url),
      url,
      metrics: { fcpMs, lcpMs, cls },
    });
  }

  return parsed;
}

export function findAbsoluteCwvViolations(
  measured: readonly ParsedLhciCwvEntry[],
): CwvRegressionViolation[] {
  const violations: CwvRegressionViolation[] = [];

  for (const entry of measured) {
    for (const violation of evaluateCoreWebVitals(entry.metrics)) {
      violations.push({
        path: entry.path,
        kind: "absolute_ceiling",
        metric: violation.metric,
        value: violation.value,
        limit: violation.max,
        message: `${entry.path}: ${violation.message}`,
      });
    }
  }

  return violations;
}

export function findCwvBaselineRegressions(
  measured: readonly ParsedLhciCwvEntry[],
  baseline: CwvPerformanceBaseline,
  tolerancePercent = baseline.tolerancePercent,
): CwvRegressionViolation[] {
  const violations: CwvRegressionViolation[] = [];
  const measuredByPath = new Map(measured.map((entry) => [entry.path, entry]));

  for (const route of baseline.routes) {
    const entry = measuredByPath.get(route.path);
    if (!entry) {
      violations.push({
        path: route.path,
        kind: "missing_route",
        metric: "fcp",
        value: 0,
        limit: 0,
        message: `${route.path}: missing from LHCI manifest`,
      });
      continue;
    }

    const fcpLimit = route.fcpMs * (1 + tolerancePercent / 100);
    if (entry.metrics.fcpMs > fcpLimit) {
      violations.push({
        path: route.path,
        kind: "baseline_regression",
        metric: "fcp",
        value: entry.metrics.fcpMs,
        limit: fcpLimit,
        message: `${route.path}: FCP ${Math.round(entry.metrics.fcpMs)}ms regressed above baseline ${route.fcpMs}ms (+${tolerancePercent}% = ${Math.round(fcpLimit)}ms)`,
      });
    }

    const lcpLimit = route.lcpMs * (1 + tolerancePercent / 100);
    if (entry.metrics.lcpMs > lcpLimit) {
      violations.push({
        path: route.path,
        kind: "baseline_regression",
        metric: "lcp",
        value: entry.metrics.lcpMs,
        limit: lcpLimit,
        message: `${route.path}: LCP ${Math.round(entry.metrics.lcpMs)}ms regressed above baseline ${route.lcpMs}ms (+${tolerancePercent}% = ${Math.round(lcpLimit)}ms)`,
      });
    }

    const clsLimit = route.cls + CWV_PERFORMANCE_CLS_REGRESSION_DELTA;
    if (entry.metrics.cls > clsLimit) {
      violations.push({
        path: route.path,
        kind: "baseline_regression",
        metric: "cls",
        value: entry.metrics.cls,
        limit: clsLimit,
        message: `${route.path}: CLS ${entry.metrics.cls.toFixed(3)} regressed above baseline ${route.cls} (+${CWV_PERFORMANCE_CLS_REGRESSION_DELTA})`,
      });
    }
  }

  return violations;
}

export function mergeCwvViolations(
  ...groups: readonly CwvRegressionViolation[][]
): CwvRegressionViolation[] {
  const seen = new Set<string>();
  const merged: CwvRegressionViolation[] = [];

  for (const group of groups) {
    for (const violation of group) {
      const key = `${violation.path}:${violation.kind}:${violation.metric}:${violation.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(violation);
    }
  }

  return merged;
}

export function assertNoCwvRegressions(
  measured: readonly ParsedLhciCwvEntry[],
  baseline: CwvPerformanceBaseline,
): void {
  const violations = mergeCwvViolations(
    findCwvBaselineRegressions(measured, baseline),
    findAbsoluteCwvViolations(measured),
  );
  if (violations.length > 0) {
    throw new Error(violations.map((v) => v.message).join("\n"));
  }
}

export function cwvPerformanceRegressionPass(
  measured: readonly ParsedLhciCwvEntry[],
  baseline: CwvPerformanceBaseline,
): boolean {
  return (
    mergeCwvViolations(
      findCwvBaselineRegressions(measured, baseline),
      findAbsoluteCwvViolations(measured),
    ).length === 0
  );
}

export const CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS = {
  fcpMs: LIGHTHOUSE_CWV_FCP_MAX_MS,
  lcpMs: LIGHTHOUSE_CWV_LCP_MAX_MS,
  cls: LIGHTHOUSE_CWV_CLS_MAX,
} as const;

export const CWV_PERFORMANCE_REGRESSION_REQUIRED_PATHS = LIGHTHOUSE_CWV_PATHS;

export function coreWebVitalsMetricsPass(metrics: CoreWebVitalsMetrics): boolean {
  return coreWebVitalsPass(metrics);
}
