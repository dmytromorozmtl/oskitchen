/**
 * CI gate — compare `next build` First Load JS output against committed baseline.
 *
 * Usage (after build):
 *   npm run build 2>&1 | tee artifacts/build-route-sizes.log
 *   npm run check:bundle-size-regression
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertNoBundleSizeViolations,
  BUNDLE_SIZE_BASELINE_ARTIFACT,
  BUNDLE_SIZE_BUDGET_POLICY_ID,
  findBundleSizeViolations,
  parseFirstLoadJsFromBuildLog,
  type BundleSizeBaseline,
} from "@/lib/performance/bundle-size-budget-policy";

const ROOT = process.cwd();
const BUILD_LOG = join(ROOT, "artifacts/build-route-sizes.log");

function main(): void {
  if (!existsSync(BUILD_LOG)) {
    throw new Error(
      `Missing ${BUILD_LOG}. Run: npm run build 2>&1 | tee artifacts/build-route-sizes.log`,
    );
  }

  const baseline = JSON.parse(
    readFileSync(join(ROOT, BUNDLE_SIZE_BASELINE_ARTIFACT), "utf8"),
  ) as BundleSizeBaseline;

  if (baseline.policyId !== BUNDLE_SIZE_BUDGET_POLICY_ID) {
    throw new Error(`Baseline policy mismatch: ${baseline.policyId}`);
  }

  const measured = parseFirstLoadJsFromBuildLog(readFileSync(BUILD_LOG, "utf8"));
  const violations = findBundleSizeViolations(measured, baseline);

  console.log(`Bundle size regression check (${BUNDLE_SIZE_BUDGET_POLICY_ID})`);
  console.log(`Shared First Load JS: ${measured.sharedKb ?? "unknown"} kB`);
  console.log(`Baseline routes tracked: ${baseline.routes.length}`);

  if (violations.length === 0) {
    console.log("✓ No bundle size regressions vs baseline or surface budgets");
    return;
  }

  for (const v of violations) {
    console.error(`✗ ${v.message}`);
  }
  assertNoBundleSizeViolations(measured, baseline);
}

main();
