import { buildPurchasingAiDashboardPayload } from "@/lib/ai/ai-purchasing-dashboard-builders";
import type { PurchasingAiDashboardPayload } from "@/lib/ai/ai-purchasing-dashboard-types";
import { loadAiPurchasingUiState } from "@/lib/ai/ai-purchasing-ui-storage";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { generatePurchaseRecommendations } from "@/services/ai/ai-purchasing";

export type { PurchasingAiDashboardPayload } from "@/lib/ai/ai-purchasing-dashboard-types";

/** Server bundle for AI Purchasing dashboard UI. */
export async function loadPurchasingAiDashboard(
  workspaceId: string,
): Promise<PurchasingAiDashboardPayload> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const [result, uiState] = await Promise.all([
    generatePurchaseRecommendations(workspaceId),
    loadAiPurchasingUiState(ownerUserId),
  ]);

  return buildPurchasingAiDashboardPayload(result, uiState);
}
