/**
 * P1-22 — Webhook signature regression benchmark (59 routes → invalid signature → 401).
 *
 * Usage:
 *   npm run benchmark:webhook-signature-regression
 *   npm run test:ci -- webhook-signature-regression
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  WEBHOOK_SIGNATURE_REGRESSION_ARTIFACT,
  WEBHOOK_SIGNATURE_REGRESSION_POLICY_ID,
} from "@/lib/qa/webhook-signature-regression-policy";
import { runWebhookSignatureRegressionBenchmark } from "@/lib/qa/webhook-signature-regression-scoring";

const ROOT = process.cwd();

function main(): void {
  const result = runWebhookSignatureRegressionBenchmark(ROOT);

  const summary = {
    policyId: WEBHOOK_SIGNATURE_REGRESSION_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "invalid-signature-fail-closed-regression",
    ...result,
    failedRoutes: result.scenarios.filter((row) => !row.passed).map((row) => ({
      apiPath: row.apiPath,
      detail: row.detail,
    })),
  };

  mkdirSync(dirname(join(ROOT, WEBHOOK_SIGNATURE_REGRESSION_ARTIFACT)), { recursive: true });
  writeFileSync(
    join(ROOT, WEBHOOK_SIGNATURE_REGRESSION_ARTIFACT),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `[webhook-signature-regression] ${result.passedCount}/${result.routeCount} routes PASS (${result.passPct}%)`,
  );
  console.log(`[webhook-signature-regression] artifact → ${WEBHOOK_SIGNATURE_REGRESSION_ARTIFACT}`);

  if (!result.passed) {
    for (const row of result.scenarios.filter((s) => !s.passed)) {
      console.error(`  FAIL ${row.apiPath}: ${row.detail}`);
    }
    process.exit(1);
  }

  console.log("[webhook-signature-regression] PASS");
}

main();
