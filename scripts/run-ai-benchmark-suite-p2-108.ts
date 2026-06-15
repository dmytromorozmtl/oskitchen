/**
 * Run AI benchmark suite and write summary artifact (Blueprint P2-108).
 *
 * Usage:
 *   npm run benchmark:ai-benchmark-suite-p2-108
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { runAiBenchmarkSuiteP2_108 } from "@/lib/ai/ai-benchmark-suite-p2-108-operations";
import { AI_BENCHMARK_SUITE_P2_108_ARTIFACT } from "@/lib/ai/ai-benchmark-suite-p2-108-policy";

function main(): void {
  const report = runAiBenchmarkSuiteP2_108();
  const artifactPath = join(process.cwd(), AI_BENCHMARK_SUITE_P2_108_ARTIFACT);

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("");
  console.log(`AI benchmark suite (${report.policyId})`);
  console.log(`Passed: ${report.passedCount}/${report.benchmarkCount}`);
  for (const benchmark of report.benchmarks) {
    console.log(
      `  ${benchmark.label}: ${benchmark.scorePct}% — ${benchmark.passed ? "PASS" : "FAIL"} (${benchmark.detail})`,
    );
  }
  console.log(`Artifact → ${AI_BENCHMARK_SUITE_P2_108_ARTIFACT}`);
  console.log("");

  if (!report.passed) {
    console.error("FAIL — one or more benchmarks below threshold");
    process.exit(1);
  }

  console.log("✓ AI benchmark suite PASS");
}

main();
