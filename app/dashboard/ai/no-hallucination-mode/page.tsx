import Link from "next/link";

import { AiNoHallucinationModePanel } from "@/components/ai/ai-no-hallucination-mode-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import {
  AI_NO_HALLUCINATION_MODE_P2_110_APPROVAL_ROUTE,
  AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-policy";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { loadAiNoHallucinationModeSnapshot } from "@/services/ai/ai-no-hallucination-mode-p2-110-service";

/** Blueprint P2-110 — AI no hallucination mode hub. */
export default async function AiNoHallucinationModePage() {
  const { scope } = await loadCopilotPageActor();
  if (!canUseCopilot(scope, "copilot.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="ai" />;
  }

  const snapshot = await loadAiNoHallucinationModeSnapshot(scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI no hallucination mode</h1>
          <p className="text-sm text-muted-foreground">
            Tenant data only · source-backed · no unsupported claims — policy{" "}
            {AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={AI_NO_HALLUCINATION_MODE_P2_110_APPROVAL_ROUTE}>Approval workflow</Link>
        </Button>
      </div>
      <AiNoHallucinationModePanel snapshot={snapshot} />
    </div>
  );
}
