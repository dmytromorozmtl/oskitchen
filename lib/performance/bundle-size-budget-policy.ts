/**
 * Bundle size budgets and regression checks — Task 41 / docs/bundle-analysis.md.
 *
 * Parses `next build` First Load JS output and compares against a committed baseline
 * plus surface ceilings (marketing, dashboard, POS, analytics).
 */

export const BUNDLE_SIZE_BUDGET_POLICY_ID = "bundle-size-budget-v1" as const;

export const BUNDLE_SIZE_BASELINE_ARTIFACT = "artifacts/bundle-size-baseline.json" as const;

export const BUNDLE_SIZE_DEFAULT_TOLERANCE_PERCENT = 15 as const;

export const BUNDLE_SHARED_MAX_KB = 130 as const;

export type BundleSurface =
  | "marketing"
  | "auth"
  | "dashboard"
  | "pos"
  | "analytics"
  | "marketplace";

/** Internal ceiling per surface (docs/bundle-analysis.md). */
export const BUNDLE_SURFACE_MAX_KB: Record<BundleSurface, number> = {
  marketing: 220,
  auth: 150,
  dashboard: 350,
  pos: 450,
  analytics: 500,
  marketplace: 350,
};

export type BundleRouteBaseline = {
  route: string;
  surface: BundleSurface;
  firstLoadJsKb: number;
};

export type BundleSizeBaseline = {
  version: string;
  policyId: typeof BUNDLE_SIZE_BUDGET_POLICY_ID;
  generatedAt: string;
  sharedFirstLoadJsKb: number;
  tolerancePercent: number;
  routes: BundleRouteBaseline[];
};

export type ParsedBuildLogSizes = {
  sharedKb: number | null;
  routes: Map<string, number>;
};

export type BundleRegressionViolation = {
  route: string;
  kind: "baseline_regression" | "surface_budget" | "shared_budget";
  measuredKb: number;
  limitKb: number;
  message: string;
};

const ROUTE_LINE =
  /^[├└┌]\s*[○ƒλ◐◑]\s+(\S+)\s+[\d.]+\s*kB\s+([\d.]+\s*(?:kB|MB))\s*$/;

const SHARED_LINE = /^\+ First Load JS shared by all\s+([\d.]+\s*(?:kB|MB))\s*$/;

export function parseSizeToKb(raw: string): number {
  const normalized = raw.trim().replace(/\s+/g, " ");
  const match = normalized.match(/^([\d.]+)\s*(kB|MB)$/i);
  if (!match) {
    throw new Error(`Unrecognized bundle size: ${raw}`);
  }
  const value = Number.parseFloat(match[1] ?? "0");
  const unit = (match[2] ?? "kB").toLowerCase();
  return unit === "mb" ? value * 1024 : value;
}

export function parseFirstLoadJsFromBuildLog(log: string): ParsedBuildLogSizes {
  const routes = new Map<string, number>();
  let sharedKb: number | null = null;

  for (const line of log.split("\n")) {
    const routeMatch = line.match(ROUTE_LINE);
    if (routeMatch) {
      routes.set(routeMatch[1] ?? "", parseSizeToKb(routeMatch[2] ?? "0 kB"));
      continue;
    }
    const sharedMatch = line.match(SHARED_LINE);
    if (sharedMatch) {
      sharedKb = parseSizeToKb(sharedMatch[1] ?? "0 kB");
    }
  }

  return { sharedKb, routes };
}

function regressionLimitKb(baselineKb: number, tolerancePercent: number): number {
  return baselineKb * (1 + tolerancePercent / 100);
}

export function findBundleSizeViolations(
  measured: ParsedBuildLogSizes,
  baseline: BundleSizeBaseline,
): BundleRegressionViolation[] {
  const violations: BundleRegressionViolation[] = [];
  const tolerance = baseline.tolerancePercent ?? BUNDLE_SIZE_DEFAULT_TOLERANCE_PERCENT;

  if (measured.sharedKb != null) {
    const sharedRegressionLimit = regressionLimitKb(baseline.sharedFirstLoadJsKb, tolerance);
    if (measured.sharedKb > sharedRegressionLimit) {
      violations.push({
        route: "__shared__",
        kind: "baseline_regression",
        measuredKb: measured.sharedKb,
        limitKb: sharedRegressionLimit,
        message: `Shared First Load JS ${measured.sharedKb} kB exceeds baseline regression limit ${sharedRegressionLimit.toFixed(1)} kB`,
      });
    }
    if (measured.sharedKb > BUNDLE_SHARED_MAX_KB) {
      violations.push({
        route: "__shared__",
        kind: "shared_budget",
        measuredKb: measured.sharedKb,
        limitKb: BUNDLE_SHARED_MAX_KB,
        message: `Shared First Load JS ${measured.sharedKb} kB exceeds hard cap ${BUNDLE_SHARED_MAX_KB} kB`,
      });
    }
  }

  for (const routeBaseline of baseline.routes) {
    const measuredKb = measured.routes.get(routeBaseline.route);
    if (measuredKb == null) continue;

    const regressionLimit = regressionLimitKb(routeBaseline.firstLoadJsKb, tolerance);
    if (measuredKb > regressionLimit) {
      violations.push({
        route: routeBaseline.route,
        kind: "baseline_regression",
        measuredKb,
        limitKb: regressionLimit,
        message: `${routeBaseline.route} First Load JS ${measuredKb} kB exceeds baseline regression limit ${regressionLimit.toFixed(1)} kB (baseline ${routeBaseline.firstLoadJsKb} kB + ${tolerance}%)`,
      });
    }

    const surfaceMax = BUNDLE_SURFACE_MAX_KB[routeBaseline.surface];
    if (measuredKb > surfaceMax) {
      violations.push({
        route: routeBaseline.route,
        kind: "surface_budget",
        measuredKb,
        limitKb: surfaceMax,
        message: `${routeBaseline.route} First Load JS ${measuredKb} kB exceeds ${routeBaseline.surface} surface cap ${surfaceMax} kB`,
      });
    }
  }

  return violations;
}

export function assertNoBundleSizeViolations(
  measured: ParsedBuildLogSizes,
  baseline: BundleSizeBaseline,
): void {
  const violations = findBundleSizeViolations(measured, baseline);
  if (violations.length === 0) return;
  throw new Error(violations.map((v) => v.message).join("\n"));
}
