/**
 * CI gate — compare LHCI Core Web Vitals manifest against committed baseline.
 *
 * Usage (after LHCI):
 *   npx @lhci/cli autorun --config=lighthouserc.core-web-vitals.cjs
 *   npm run check:cwv-performance-regression
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CWV_PERFORMANCE_BASELINE_ARTIFACT,
  CWV_PERFORMANCE_REGRESSION_MANIFEST,
  CWV_PERFORMANCE_REGRESSION_POLICY_ID,
  CWV_PERFORMANCE_REGRESSION_TOLERANCE_PERCENT,
  findAbsoluteCwvViolations,
  findCwvBaselineRegressions,
  mergeCwvViolations,
  parseLhciCwvManifest,
  type CwvPerformanceBaseline,
} from "@/lib/performance/cwv-performance-regression-policy";

const ROOT = process.cwd();

function main(): void {
  const manifestPath = join(ROOT, CWV_PERFORMANCE_REGRESSION_MANIFEST);
  if (!existsSync(manifestPath)) {
    if (process.env.CI === "true" || process.env.CI === "1") {
      throw new Error(
        `Missing ${CWV_PERFORMANCE_REGRESSION_MANIFEST}. Run: npm run lighthouse:core-web-vitals`,
      );
    }
    console.log(
      `Skip CWV regression check — no ${CWV_PERFORMANCE_REGRESSION_MANIFEST} (run npm run lighthouse:core-web-vitals)`,
    );
    return;
  }

  const baseline = JSON.parse(
    readFileSync(join(ROOT, CWV_PERFORMANCE_BASELINE_ARTIFACT), "utf8"),
  ) as CwvPerformanceBaseline;

  if (baseline.policyId !== CWV_PERFORMANCE_REGRESSION_POLICY_ID) {
    throw new Error(`Baseline policy mismatch: ${baseline.policyId}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;
  if (!Array.isArray(manifest)) {
    throw new Error("LHCI manifest must be an array");
  }

  const measured = parseLhciCwvManifest(manifest);
  const baselineViolations = findCwvBaselineRegressions(measured, baseline);
  const absoluteViolations = findAbsoluteCwvViolations(measured);
  const violations = mergeCwvViolations(baselineViolations, absoluteViolations);

  console.log(`CWV performance regression check (${CWV_PERFORMANCE_REGRESSION_POLICY_ID})`);
  console.log(`Manifest routes parsed: ${measured.length}`);
  console.log(`Baseline routes tracked: ${baseline.routes.length}`);
  console.log(`Tolerance: +${CWV_PERFORMANCE_REGRESSION_TOLERANCE_PERCENT}% FCP/LCP vs baseline`);

  if (violations.length === 0) {
    console.log("✓ No Core Web Vitals regressions vs baseline or absolute ceilings");
    return;
  }

  for (const violation of violations) {
    console.error(`✗ ${violation.message}`);
  }
  throw new Error(violations.map((v) => v.message).join("\n"));
}

main();
