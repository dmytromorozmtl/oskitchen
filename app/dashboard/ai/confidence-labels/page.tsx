import Link from "next/link";

import { AiConfidenceLabelsPanel } from "@/components/ai/ai-confidence-labels-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import {
  AI_CONFIDENCE_LABELS_P2_107_ACTION_DRAFTS_ROUTE,
  AI_CONFIDENCE_LABELS_P2_107_POLICY_ID,
} from "@/lib/ai/ai-confidence-labels-p2-107-policy";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { loadAiConfidenceLabelsSnapshot } from "@/services/ai/ai-confidence-labels-p2-107-service";

/** Blueprint P2-107 — AI confidence labels hub. */
export default async function AiConfidenceLabelsPage() {
  const { scope } = await loadCopilotPageActor();
  if (!canUseCopilot(scope, "copilot.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="ai" />;
  }

  const snapshot = await loadAiConfidenceLabelsSnapshot(scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI confidence labels</h1>
          <p className="text-sm text-muted-foreground">
            High / medium / low · Needs approval · Source references — policy{" "}
            {AI_CONFIDENCE_LABELS_P2_107_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={AI_CONFIDENCE_LABELS_P2_107_ACTION_DRAFTS_ROUTE}>Action drafts</Link>
        </Button>
      </div>
      <AiConfidenceLabelsPanel snapshot={snapshot} />
    </div>
  );
}
