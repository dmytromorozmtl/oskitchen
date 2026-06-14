import {
  buildAiConfidenceLabelRow,
  buildAiConfidenceLabelsDemoReport,
  buildAiConfidenceLabelsReport,
  type AiConfidenceLabelsReport,
} from "@/lib/ai/ai-confidence-labels-p2-107-operations";
import { AI_CONFIDENCE_LABELS_P2_107_POLICY_ID } from "@/lib/ai/ai-confidence-labels-p2-107-policy";
import { listInvoiceScanHistory } from "@/services/ai/invoice-scanner-service";
import { listActionDrafts } from "@/services/ai/copilot-service";

export type AiConfidenceLabelsSnapshot = AiConfidenceLabelsReport & {
  policyId: typeof AI_CONFIDENCE_LABELS_P2_107_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadAiConfidenceLabelsSnapshot(
  scope: { userId: string; email: string | null; workspaceId?: string | null },
): Promise<AiConfidenceLabelsSnapshot> {
  try {
    const [scans, drafts] = await Promise.all([
      listInvoiceScanHistory(scope.userId),
      listActionDrafts(scope),
    ]);

    const labels = [
      ...scans.slice(0, 5).map((scan) =>
        buildAiConfidenceLabelRow({
          id: `scan-${scan.id}`,
          module: "Invoice scanner",
          outputLabel: `${scan.supplier} — ${scan.invoiceNumber}`,
          confidenceScore: scan.confidence,
          sourceType: "invoice",
          sourceId: scan.id,
          sourceLabel: `Scanned ${scan.scannedAt}`,
        }),
      ),
      ...drafts.slice(0, 5).map((draft) =>
        buildAiConfidenceLabelRow({
          id: `draft-${draft.id}`,
          module: "Co-Pilot draft",
          outputLabel: draft.title,
          confidenceScore: draft.status === "NEEDS_APPROVAL" ? 0.65 : 0.85,
          sourceType: "copilot_draft",
          sourceId: draft.id,
          sourceLabel: `Action type: ${draft.actionType}`,
          isActionDraft: true,
        }),
      ),
    ];

    if (labels.length > 0) {
      const report = buildAiConfidenceLabelsReport(labels);
      return {
        policyId: AI_CONFIDENCE_LABELS_P2_107_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildAiConfidenceLabelsDemoReport();

  return {
    policyId: AI_CONFIDENCE_LABELS_P2_107_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
