import Link from "next/link";

import { AiBriefingNarrativePanel } from "@/components/ai/ai-briefing-narrative-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import {
  AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID,
  AI_BRIEFING_NARRATIVE_P2_111_TODAY_ROUTE,
} from "@/lib/ai/ai-briefing-narrative-p2-111-policy";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { loadAiBriefingNarrativeSnapshot } from "@/services/ai/ai-briefing-narrative-p2-111-service";

/** Blueprint P2-111 — AI briefing narrative hub. */
export default async function AiBriefingNarrativePage() {
  const { scope } = await loadCopilotPageActor();
  if (!canUseCopilot(scope, "copilot.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="ai" />;
  }

  const snapshot = await loadAiBriefingNarrativeSnapshot(scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI briefing narrative</h1>
          <p className="text-sm text-muted-foreground">
            Yesterday · channel mix · next step — policy {AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={AI_BRIEFING_NARRATIVE_P2_111_TODAY_ROUTE}>Today</Link>
        </Button>
      </div>
      <AiBriefingNarrativePanel snapshot={snapshot} />
    </div>
  );
}
