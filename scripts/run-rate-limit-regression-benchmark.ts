/**
 * P1-18 — Rate-limit regression benchmark (mutation routes → N+1 → 429).
 *
 * Requires in-memory rate limit adapter (default in test/dev).
 *
 * Usage:
 *   npm run benchmark:rate-limit-regression
 *   npm run test:ci -- rate-limit-regression
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  RATE_LIMIT_REGRESSION_ARTIFACT,
  RATE_LIMIT_REGRESSION_BURST_COUNT,
  RATE_LIMIT_REGRESSION_POLICY_ID,
  RATE_LIMIT_REGRESSION_SIMULATED_MAX,
} from "@/lib/qa/rate-limit-regression-policy";
import { runRateLimitRegressionBenchmark } from "@/lib/qa/rate-limit-regression-scoring";

const ROOT = process.cwd();

async function main(): Promise<void> {
  process.env.RATE_LIMIT_SIMULATED_MAX = String(RATE_LIMIT_REGRESSION_SIMULATED_MAX);

  const result = await runRateLimitRegressionBenchmark(
    undefined,
    RATE_LIMIT_REGRESSION_BURST_COUNT,
  );

  const summary = {
    policyId: RATE_LIMIT_REGRESSION_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "mutation-burst-regression",
    simulatedMax: RATE_LIMIT_REGRESSION_SIMULATED_MAX,
    burstCount: RATE_LIMIT_REGRESSION_BURST_COUNT,
    ...result,
  };

  mkdirSync(dirname(join(ROOT, RATE_LIMIT_REGRESSION_ARTIFACT)), { recursive: true });
  writeFileSync(
    join(ROOT, RATE_LIMIT_REGRESSION_ARTIFACT),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `[rate-limit-regression] ${result.passedCount}/${result.scenarioCount} scenarios PASS (${result.passPct}%)`,
  );
  console.log(`[rate-limit-regression] artifact → ${RATE_LIMIT_REGRESSION_ARTIFACT}`);

  if (!result.passed) {
    for (const row of result.scenarios.filter((s) => !s.passed)) {
      console.error(`  FAIL ${row.id}: ${row.detail}`);
    }
    process.exit(1);
  }

  console.log("[rate-limit-regression] PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
