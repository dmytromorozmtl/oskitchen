import {
  runAiBenchmarkSuiteP2_108,
  type AiBenchmarkSuiteReport,
} from "@/lib/ai/ai-benchmark-suite-p2-108-operations";
import { AI_BENCHMARK_SUITE_P2_108_POLICY_ID } from "@/lib/ai/ai-benchmark-suite-p2-108-policy";

export type AiBenchmarkSuiteSnapshot = AiBenchmarkSuiteReport & {
  mode: "live";
};

export async function loadAiBenchmarkSuiteSnapshot(): Promise<AiBenchmarkSuiteSnapshot> {
  const report = runAiBenchmarkSuiteP2_108();

  return {
    ...report,
    policyId: AI_BENCHMARK_SUITE_P2_108_POLICY_ID,
    mode: "live",
  };
}
