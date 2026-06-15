/**
 * Task 75 — bundle optimization report from next build + @next/bundle-analyzer output.
 *
 * Usage:
 *   npm run analyze 2>&1 | tee artifacts/build-route-sizes.log
 *   npm run report:bundle
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUNDLE_SIZE_BASELINE_ARTIFACT,
  findBundleSizeViolations,
  parseFirstLoadJsFromBuildLog,
  type BundleSizeBaseline,
} from "@/lib/performance/bundle-size-budget-policy";

const ROOT = process.cwd();
const BUILD_LOG = join(ROOT, "artifacts/build-route-sizes.log");
const REPORT_PATH = join(ROOT, "artifacts/bundle-analysis-report.json");
const CLIENT_STATS = join(ROOT, ".next/analyze/client.json");
const NODE_STATS = join(ROOT, ".next/analyze/nodejs.json");
const ANALYZE_ATTEMPT = join(ROOT, "artifacts/bundle-analyzer-attempt.json");

type PackageSize = { package: string; sizeKb: number | null; note?: string };

const KNOWN_HEAVY_CLIENT_PACKAGES = [
  "recharts",
  "jspdf",
  "jspdf-autotable",
  "@sentry/nextjs",
  "@supabase/supabase-js",
  "stripe",
  "sonner",
  "lucide-react",
] as const;

function fallbackHeavyPackages(): PackageSize[] {
  const pkgJson = JSON.parse(
    readFileSync(join(ROOT, "package.json"), "utf8"),
  ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

  const installed = new Set([
    ...Object.keys(pkgJson.dependencies ?? {}),
    ...Object.keys(pkgJson.devDependencies ?? {}),
  ]);

  return KNOWN_HEAVY_CLIENT_PACKAGES.filter((name) => installed.has(name)).map((pkg) => ({
    package: pkg,
    sizeKb: null,
    note: "Installed dependency — treemap size unavailable (analyze build OOM locally)",
  }));
}

function gitSha(): string | null {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function topPackagesFromWebpackStats(statsPath: string, limit = 15): PackageSize[] {
  if (!existsSync(statsPath)) return [];

  const stats = JSON.parse(readFileSync(statsPath, "utf8")) as {
    modules?: Array<{ name?: string; identifier?: string; size?: number }>;
  };

  const sizes = new Map<string, number>();
  for (const mod of stats.modules ?? []) {
    const raw = mod.name ?? mod.identifier ?? "";
    const match = raw.match(/node_modules\/((?:@[^/]+\/[^/]+|[^/]+))/);
    if (!match?.[1]) continue;
    const pkg = match[1];
    sizes.set(pkg, (sizes.get(pkg) ?? 0) + (mod.size ?? 0));
  }

  return [...sizes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([pkg, bytes]) => ({ package: pkg, sizeKb: Math.round(bytes / 1024) }));
}

function loadBaseline(): BundleSizeBaseline {
  return JSON.parse(
    readFileSync(join(ROOT, BUNDLE_SIZE_BASELINE_ARTIFACT), "utf8"),
  ) as BundleSizeBaseline;
}

function routeHeadroom(
  measured: Map<string, number>,
  baseline: BundleSizeBaseline,
): Array<{ route: string; surface: string; firstLoadJsKb: number; baselineKb: number; headroomKb: number }> {
  return baseline.routes
    .map((row) => {
      const firstLoadJsKb = measured.get(row.route);
      if (firstLoadJsKb == null) return null;
      return {
        route: row.route,
        surface: row.surface,
        firstLoadJsKb,
        baselineKb: row.firstLoadJsKb,
        headroomKb: Math.round((row.firstLoadJsKb - firstLoadJsKb) * 10) / 10,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((a, b) => a.headroomKb - b.headroomKb);
}

function main() {
  if (!existsSync(BUILD_LOG)) {
    throw new Error(
      `Missing ${BUILD_LOG}. Run: npm run analyze 2>&1 | tee artifacts/build-route-sizes.log`,
    );
  }

  const buildLog = readFileSync(BUILD_LOG, "utf8");
  const analyzeAttempt = existsSync(ANALYZE_ATTEMPT)
    ? (JSON.parse(readFileSync(ANALYZE_ATTEMPT, "utf8")) as { result?: string })
    : null;
  const analyzeOom =
    buildLog.includes("JavaScript heap out of memory") || analyzeAttempt?.result === "oom";
  const measured = parseFirstLoadJsFromBuildLog(buildLog);
  const baseline = loadBaseline();
  const violations = findBundleSizeViolations(measured, baseline);
  const headroom = routeHeadroom(measured.routes, baseline);

  const clientPackages = topPackagesFromWebpackStats(CLIENT_STATS);
  const serverPackages = topPackagesFromWebpackStats(NODE_STATS, 10);
  const analyzerEnabled = clientPackages.length > 0 || serverPackages.length > 0;
  const topClientPackages =
    clientPackages.length > 0 ? clientPackages : fallbackHeavyPackages();

  const recommendations: string[] = [];
  const heavyNames = topClientPackages.map((p) => p.package).join(" ");
  if (heavyNames.includes("recharts")) {
    recommendations.push("Dynamic-import recharts on analytics routes only.");
  }
  if (heavyNames.includes("jspdf")) {
    recommendations.push("Lazy-load jspdf/jspdf-autotable inside export handlers.");
  }
  const regressedRoutes = headroom.filter((r) => r.headroomKb < 0);
  for (const route of regressedRoutes) {
    recommendations.push(
      `${route.route} grew ${Math.abs(route.headroomKb)} kB vs baseline (${route.firstLoadJsKb} kB) — review new client imports.`,
    );
  }
  if ((measured.sharedKb ?? 0) > baseline.sharedFirstLoadJsKb + 5) {
    recommendations.push(
      `Shared chunk grew to ${measured.sharedKb} kB (baseline ${baseline.sharedFirstLoadJsKb} kB) — audit dashboard layout imports.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push("No urgent bundle regressions — maintain dynamic imports for chart/PDF routes.");
  }
  if (analyzeOom && !analyzerEnabled) {
    recommendations.push(
      "Full @next/bundle-analyzer treemap OOM locally — re-run `npm run analyze` on Node 22 with ≥16 GB RAM or in CI.",
    );
  }

  const payload = {
    version: "bundle-analysis-report-v1",
    generatedAt: new Date().toISOString(),
    gitSha: gitSha(),
    buildCommand: analyzeOom ? "npm run build (analyze OOM; route sizes from build log)" : "npm run analyze",
    analyzer: {
      enabled: analyzerEnabled,
      attempted: Boolean(analyzeAttempt) || analyzeOom,
      oomLocally: analyzeOom && !analyzerEnabled,
      attemptArtifact: existsSync(ANALYZE_ATTEMPT) ? "artifacts/bundle-analyzer-attempt.json" : null,
      clientStatsPath: existsSync(CLIENT_STATS) ? ".next/analyze/client.json" : null,
      nodeStatsPath: existsSync(NODE_STATS) ? ".next/analyze/nodejs.json" : null,
      wiredIn: "next.config.ts (@next/bundle-analyzer, analyzerMode: json)",
    },
    overall: violations.length === 0 ? "PASS" : "FAIL",
    sharedFirstLoadJsKb: measured.sharedKb,
    baselineSharedFirstLoadJsKb: baseline.sharedFirstLoadJsKb,
    routeSizes: baseline.routes.map((row) => ({
      route: row.route,
      surface: row.surface,
      baselineKb: row.firstLoadJsKb,
      measuredKb: measured.routes.get(row.route) ?? null,
    })),
    headroomKbByRoute: headroom,
    violations,
    topClientPackages,
    topServerPackages: serverPackages,
    recommendations,
  };

  writeFileSync(REPORT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(`Overall: ${payload.overall}`);
  console.log(`Shared First Load JS: ${payload.sharedFirstLoadJsKb ?? "unknown"} kB`);
  console.log(`Violations: ${violations.length}`);
  if (violations.length > 0) {
    for (const v of violations) console.error(`- ${v.message}`);
    process.exit(1);
  }
}

main();
