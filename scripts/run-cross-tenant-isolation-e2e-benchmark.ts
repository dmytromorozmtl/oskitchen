/**
 * Cross-tenant isolation E2E contract benchmark — Tenant A must not access Tenant B (403/404).
 *
 * Usage:
 *   npm run benchmark:cross-tenant-isolation-e2e
 *   npm run test:ci:cross-tenant-isolation-e2e
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  runCrossTenantIsolationContract,
  scoreCrossTenantIsolationContract,
} from "@/lib/qa/cross-tenant-isolation-contract";
import {
  CROSS_TENANT_ISOLATION_BENCHMARK_ARTIFACT,
  CROSS_TENANT_ISOLATION_E2E_POLICY_ID,
  CROSS_TENANT_ISOLATION_MIN_SCENARIOS,
} from "@/lib/qa/cross-tenant-isolation-e2e-policy";

const ROOT = process.cwd();
const artifactPath = join(ROOT, CROSS_TENANT_ISOLATION_BENCHMARK_ARTIFACT);

function main(): void {
  const scenarios = runCrossTenantIsolationContract();
  const result = scoreCrossTenantIsolationContract(
    scenarios,
    CROSS_TENANT_ISOLATION_MIN_SCENARIOS,
  );

  const summary = {
    policyId: CROSS_TENANT_ISOLATION_E2E_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "contract-regression",
    ...result,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[cross-tenant-isolation-e2e] ${result.passedCount}/${result.scenarioCount} scenarios PASS (${result.passPct}%)`,
  );
  console.log(
    `[cross-tenant-isolation-e2e] artifact → ${CROSS_TENANT_ISOLATION_BENCHMARK_ARTIFACT}`,
  );

  if (!result.passed) {
    for (const scenario of scenarios.filter((row) => !row.passed)) {
      console.error(`  FAIL ${scenario.scenarioId}: ${scenario.detail}`);
    }
    process.exit(1);
  }

  console.log("[cross-tenant-isolation-e2e] PASS");
}

main();
