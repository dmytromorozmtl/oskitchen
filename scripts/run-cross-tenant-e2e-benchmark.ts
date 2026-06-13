/**
 * P1-14 — Cross-tenant E2E IDOR benchmark (2 workspaces, all key API routes).
 *
 * Usage:
 *   npm run benchmark:cross-tenant-e2e
 *   npm run test:ci:cross-tenant-e2e
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { runCrossTenantE2eContract } from "@/lib/qa/cross-tenant-e2e-contract";
import {
  CROSS_TENANT_E2E_ARTIFACT,
  CROSS_TENANT_E2E_MIN_KEY_ROUTE_SCENARIOS,
  CROSS_TENANT_E2E_POLICY_ID,
  CROSS_TENANT_E2E_WORKSPACE_COUNT,
} from "@/lib/qa/cross-tenant-e2e-policy";
import { scoreCrossTenantIsolationContract } from "@/lib/qa/cross-tenant-isolation-contract";

const ROOT = process.cwd();
const artifactPath = join(ROOT, CROSS_TENANT_E2E_ARTIFACT);

function main(): void {
  const scenarios = runCrossTenantE2eContract();
  const result = scoreCrossTenantIsolationContract(
    scenarios,
    CROSS_TENANT_E2E_MIN_KEY_ROUTE_SCENARIOS,
  );

  const summary = {
    policyId: CROSS_TENANT_E2E_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "contract-regression",
    workspaceCount: CROSS_TENANT_E2E_WORKSPACE_COUNT,
    keyRouteScenarioCount: scenarios.length,
    ...result,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[cross-tenant-e2e] ${result.passedCount}/${result.scenarioCount} scenarios PASS (${result.passPct}%)`,
  );
  console.log(`[cross-tenant-e2e] artifact → ${CROSS_TENANT_E2E_ARTIFACT}`);

  if (!result.passed) {
    for (const scenario of scenarios.filter((row) => !row.passed)) {
      console.error(`  FAIL ${scenario.scenarioId}: ${scenario.detail}`);
    }
    process.exit(1);
  }

  console.log("[cross-tenant-e2e] PASS");
}

main();
