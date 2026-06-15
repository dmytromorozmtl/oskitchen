import Link from "next/link";

import { AiApprovalWorkflowPanel } from "@/components/ai/ai-approval-workflow-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import {
  AI_APPROVAL_WORKFLOW_P2_109_COPILOT_DRAFTS_ROUTE,
  AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID,
} from "@/lib/ai/ai-approval-workflow-p2-109-policy";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { loadAiApprovalWorkflowSnapshot } from "@/services/ai/ai-approval-workflow-p2-109-service";

/** Blueprint P2-109 — AI approval workflow hub. */
export default async function AiApprovalWorkflowPage() {
  const { scope } = await loadCopilotPageActor();
  if (!canUseCopilot(scope, "copilot.actions.approve")) {
    return <PermissionDeniedSurfaceCard surfaceId="ai" />;
  }

  const snapshot = await loadAiApprovalWorkflowSnapshot(scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI approval workflow</h1>
          <p className="text-sm text-muted-foreground">
            Suggest → approve → execute → audit log — policy {AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={AI_APPROVAL_WORKFLOW_P2_109_COPILOT_DRAFTS_ROUTE}>Drafts queue</Link>
        </Button>
      </div>
      <AiApprovalWorkflowPanel snapshot={snapshot} />
    </div>
  );
}
