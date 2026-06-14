import {
  buildAiActionDraftRows,
  buildAiActionDraftsDemoReport,
  buildAiActionDraftsReport,
  type AiActionDraftType,
  type AiActionDraftsReport,
} from "@/lib/ai/ai-action-drafts-p2-106-operations";
import { AI_ACTION_DRAFTS_P2_106_POLICY_ID } from "@/lib/ai/ai-action-drafts-p2-106-policy";
import { listActionDrafts } from "@/services/ai/copilot-service";

export type AiActionDraftsSnapshot = AiActionDraftsReport & {
  policyId: typeof AI_ACTION_DRAFTS_P2_106_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

function inferDraftType(title: string, description: string | null): AiActionDraftType {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  if (text.includes("purchase") || text.includes(" po") || text.includes("po ")) return "create_po";
  if (text.includes("schedule") || text.includes("shift") || text.includes("labor"))
    return "draft_schedule";
  if (text.includes("margin") || text.includes("food cost")) return "flag_low_margin";
  if (text.includes("commission") || text.includes("doordash") || text.includes("uber"))
    return "commission_spike";
  if (text.includes("briefing") || text.includes("yesterday")) return "daily_briefing";
  return "create_po";
}

export async function loadAiActionDraftsSnapshot(
  scope: { userId: string; email: string | null; workspaceId?: string | null },
): Promise<AiActionDraftsSnapshot> {
  try {
    const drafts = await listActionDrafts(scope);

    if (drafts.length > 0) {
      const rows = buildAiActionDraftRows(
        drafts.map((draft) => ({
          id: draft.id,
          draftType: inferDraftType(draft.title, draft.description),
          title: draft.title,
          summary: draft.description ?? draft.title,
          status: draft.status,
          sourceReference: draft.actionType,
          createdAt: draft.createdAt.toISOString(),
        })),
      );

      const report = buildAiActionDraftsReport({ rows });

      return {
        policyId: AI_ACTION_DRAFTS_P2_106_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildAiActionDraftsDemoReport();

  return {
    policyId: AI_ACTION_DRAFTS_P2_106_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
