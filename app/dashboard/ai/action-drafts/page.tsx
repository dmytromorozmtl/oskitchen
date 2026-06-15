import Link from "next/link";

import { AiActionDraftsPanel } from "@/components/ai/ai-action-drafts-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import {
  AI_ACTION_DRAFTS_P2_106_DRAFTS_ROUTE,
  AI_ACTION_DRAFTS_P2_106_POLICY_ID,
} from "@/lib/ai/ai-action-drafts-p2-106-policy";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { loadAiActionDraftsSnapshot } from "@/services/ai/ai-action-drafts-p2-106-service";

/** Blueprint P2-106 — AI action drafts hub. */
export default async function AiActionDraftsPage() {
  const { scope } = await loadCopilotPageActor();
  if (!canUseCopilot(scope, "copilot.actions.draft")) {
    return <PermissionDeniedSurfaceCard surfaceId="ai" />;
  }

  const snapshot = await loadAiActionDraftsSnapshot(scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI action drafts</h1>
          <p className="text-sm text-muted-foreground">
            Create PO, Flag low margin, Draft schedule, Daily briefing, Commission spike — policy{" "}
            {AI_ACTION_DRAFTS_P2_106_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={AI_ACTION_DRAFTS_P2_106_DRAFTS_ROUTE}>Drafts queue</Link>
        </Button>
      </div>
      <AiActionDraftsPanel snapshot={snapshot} />
    </div>
  );
}
