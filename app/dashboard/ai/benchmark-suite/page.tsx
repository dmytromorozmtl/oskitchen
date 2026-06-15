import Link from "next/link";

import { AiBenchmarkSuitePanel } from "@/components/ai/ai-benchmark-suite-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import {
  AI_BENCHMARK_SUITE_P2_108_CONFIDENCE_LABELS_ROUTE,
  AI_BENCHMARK_SUITE_P2_108_POLICY_ID,
} from "@/lib/ai/ai-benchmark-suite-p2-108-policy";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { loadAiBenchmarkSuiteSnapshot } from "@/services/ai/ai-benchmark-suite-p2-108-service";

/** Blueprint P2-108 — AI benchmark suite hub. */
export default async function AiBenchmarkSuitePage() {
  const { scope } = await loadCopilotPageActor();
  if (!canUseCopilot(scope, "copilot.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="ai" />;
  }

  const snapshot = await loadAiBenchmarkSuiteSnapshot();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI benchmark suite</h1>
          <p className="text-sm text-muted-foreground">
            Invoice · forecast · food cost anomaly · labor quality — policy{" "}
            {AI_BENCHMARK_SUITE_P2_108_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={AI_BENCHMARK_SUITE_P2_108_CONFIDENCE_LABELS_ROUTE}>Confidence labels</Link>
        </Button>
      </div>
      <AiBenchmarkSuitePanel snapshot={snapshot} />
    </div>
  );
}
