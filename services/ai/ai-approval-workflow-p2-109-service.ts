import {
  buildApprovalAuditEntry,
  buildApprovalWorkflowDemoReport,
  buildApprovalWorkflowReport,
  buildApprovalWorkflowStepsFromDrafts,
  type AiApprovalWorkflowReport,
} from "@/lib/ai/ai-approval-workflow-p2-109-operations";
import { AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID } from "@/lib/ai/ai-approval-workflow-p2-109-policy";
import { listActionDrafts, listAuditEvents } from "@/services/ai/copilot-service";

export type AiApprovalWorkflowSnapshot = AiApprovalWorkflowReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadAiApprovalWorkflowSnapshot(
  scope: { userId: string; email: string | null },
): Promise<AiApprovalWorkflowSnapshot> {
  try {
    const [drafts, auditEvents] = await Promise.all([
      listActionDrafts(scope),
      listAuditEvents(scope, 25),
    ]);

    if (drafts.length > 0) {
      const steps = buildApprovalWorkflowStepsFromDrafts(
        drafts.map((draft) => ({
          id: draft.id,
          title: draft.title,
          status: draft.status,
          actor: draft.createdBy,
          timestamp: draft.createdAt.toISOString(),
        })),
      );

      const auditTrail = auditEvents.map((event) =>
        buildApprovalAuditEntry({
          id: event.id,
          eventType: event.eventType,
          draftId:
            typeof event.metadataJson === "object" &&
            event.metadataJson !== null &&
            "draftId" in event.metadataJson
              ? String((event.metadataJson as { draftId?: string }).draftId ?? "")
              : typeof event.metadataJson === "object" &&
                  event.metadataJson !== null &&
                  "id" in event.metadataJson
                ? String((event.metadataJson as { id?: string }).id ?? "")
                : null,
          actor: event.performedBy ?? "system",
          timestamp: event.createdAt.toISOString(),
          summary: event.eventType.replace(/_/g, " "),
        }),
      );

      const report = buildApprovalWorkflowReport({ steps, auditTrail });

      return {
        ...report,
        policyId: AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildApprovalWorkflowDemoReport();

  return {
    ...report,
    policyId: AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
