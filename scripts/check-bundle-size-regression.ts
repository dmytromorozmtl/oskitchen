/**
 * CI gate — compare `next build` First Load JS output against committed baseline.
 *
 * Tiers (absolute-final P0):
 *   - warning when any route First Load JS > 500 kB
 *   - fail when any route First Load JS > 1000 kB
 *
 * Usage (after build):
 *   npm run build 2>&1 | tee artifacts/build-route-sizes.log
 *   npm run check:bundle-size-regression
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUNDLE_FIRST_LOAD_FAIL_KB,
  BUNDLE_FIRST_LOAD_WARN_KB,
  BUNDLE_SIZE_BASELINE_ARTIFACT,
  BUNDLE_SIZE_BUDGET_POLICY_ID,
  findAbsoluteBundleBudgetFails,
  findAbsoluteBundleBudgetWarnings,
  findBundleSizeViolations,
  mergeBundleViolations,
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
  const baselineViolations = findBundleSizeViolations(measured, baseline);
  const absoluteFails = findAbsoluteBundleBudgetFails(measured);
  const violations = mergeBundleViolations(baselineViolations, absoluteFails);
  const warnings = findAbsoluteBundleBudgetWarnings(measured);

  console.log(`Bundle size regression check (${BUNDLE_SIZE_BUDGET_POLICY_ID})`);
  console.log(`Shared First Load JS: ${measured.sharedKb ?? "unknown"} kB`);
  console.log(`Routes in build log: ${measured.routes.size}`);
  console.log(`Baseline routes tracked: ${baseline.routes.length}`);
  console.log(`Budget tiers: warn >${BUNDLE_FIRST_LOAD_WARN_KB} kB, fail >${BUNDLE_FIRST_LOAD_FAIL_KB} kB`);

  for (const warning of warnings) {
    console.warn(`⚠ ${warning.message}`);
  }

  if (violations.length === 0) {
    if (warnings.length > 0) {
      console.log(`✓ No failing regressions (${warnings.length} warning(s) above ${BUNDLE_FIRST_LOAD_WARN_KB} kB)`);
    } else {
      console.log("✓ No bundle size regressions vs baseline or surface budgets");
    }
    return;
  }

  for (const v of violations) {
    console.error(`✗ ${v.message}`);
  }
  throw new Error(violations.map((v) => v.message).join("\n"));
}

main();
