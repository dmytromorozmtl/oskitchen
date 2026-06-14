import {
  buildNoHallucinationModeDemoReport,
  buildNoHallucinationModeReport,
  evaluateNoHallucinationClaim,
  type AiNoHallucinationModeReport,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-operations";
import { AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID } from "@/lib/ai/ai-no-hallucination-mode-p2-110-policy";
import { getCopilotSettings } from "@/services/ai/copilot-service";
import { listOpenInsights } from "@/services/ai/copilot-service";

export type AiNoHallucinationModeSnapshot = AiNoHallucinationModeReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadAiNoHallucinationModeSnapshot(
  scope: { userId: string; email: string | null; workspaceId?: string | null },
): Promise<AiNoHallucinationModeSnapshot> {
  try {
    const [settings, insights] = await Promise.all([
      getCopilotSettings(scope),
      listOpenInsights(scope, 10),
    ]);

    const tenantWorkspaceId = scope.workspaceId ?? "ws-default";
    const modeEnabled = settings.deterministicOnly || !settings.aiNarrativeEnabled;

    if (insights.length > 0) {
      const checks = insights.map((insight) =>
        evaluateNoHallucinationClaim({
          id: insight.id,
          claim: insight.title,
          sourceType: "copilot_draft",
          sourceId: insight.id,
          workspaceId: tenantWorkspaceId,
          tenantWorkspaceId,
        }),
      );

      const report = buildNoHallucinationModeReport({
        checks,
        modeEnabled,
      });

      return {
        ...report,
        policyId: AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildNoHallucinationModeDemoReport();

  return {
    ...report,
    policyId: AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
