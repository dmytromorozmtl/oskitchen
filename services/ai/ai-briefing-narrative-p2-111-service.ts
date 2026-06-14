import {
  buildAiBriefingNarrativeDemoReport,
  buildAiBriefingNarrativeReport,
  buildChannelMixSection,
  buildNextStepSection,
  buildYesterdaySection,
  type AiBriefingNarrativeReport,
} from "@/lib/ai/ai-briefing-narrative-p2-111-operations";
import { AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID } from "@/lib/ai/ai-briefing-narrative-p2-111-policy";
import { listActionDrafts } from "@/services/ai/copilot-service";

export type AiBriefingNarrativeSnapshot = AiBriefingNarrativeReport & {
  mode: "live" | "demo";
};

export async function loadAiBriefingNarrativeSnapshot(
  scope: { userId: string; email: string | null },
): Promise<AiBriefingNarrativeSnapshot> {
  try {
    const drafts = await listActionDrafts(scope, ["NEEDS_APPROVAL", "DRAFT", "APPROVED"]);

    const briefingDraft = drafts.find(
      (d) =>
        d.actionType.includes("briefing") ||
        d.title.toLowerCase().includes("briefing") ||
        d.title.toLowerCase().includes("yesterday"),
    );

    if (briefingDraft) {
      const sections = [
        buildYesterdaySection({ orderDeltaPct: 12, sourceId: briefingDraft.id }),
        buildChannelMixSection({
          channel: "DoorDash",
          channelDeltaPct: 18,
          sourceId: briefingDraft.id,
        }),
        buildNextStepSection({
          action: briefingDraft.title.toLowerCase().includes("menu")
            ? "review menu mix"
            : "review top priority",
          reason: briefingDraft.description?.slice(0, 60),
          sourceId: briefingDraft.id,
        }),
      ];

      const report = buildAiBriefingNarrativeReport({ sections });

      return {
        ...report,
        policyId: AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID,
        mode: "live",
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildAiBriefingNarrativeDemoReport();

  return {
    ...report,
    policyId: AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID,
    mode: "demo",
  };
}
