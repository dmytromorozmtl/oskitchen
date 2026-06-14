import {
  buildPurchaseSuggestionsReport,
  PURCHASE_SUGGESTIONS_DEMO_FIXTURE,
  type PurchaseSuggestionsReport,
} from "@/lib/inventory/purchase-suggestions-p2-98-operations";
import { PURCHASE_SUGGESTIONS_P2_98_POLICY_ID } from "@/lib/inventory/purchase-suggestions-p2-98-policy";
import { generatePurchaseRecommendations } from "@/services/ai/ai-purchasing";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export type PurchaseSuggestionsSnapshot = PurchaseSuggestionsReport & {
  policyId: typeof PURCHASE_SUGGESTIONS_P2_98_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadPurchaseSuggestionsSnapshot(
  userId: string,
): Promise<PurchaseSuggestionsSnapshot> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  if (workspaceId) {
    try {
      const result = await generatePurchaseRecommendations(workspaceId);
      if (result.recommendations.length > 0) {
        const report = buildPurchaseSuggestionsReport(result.recommendations);
        return {
          policyId: PURCHASE_SUGGESTIONS_P2_98_POLICY_ID,
          mode: "live",
          analyzedAt: result.analyzedAt,
          ...report,
        };
      }
    } catch {
      // Fall through to demo fixture
    }
  }

  const report = buildPurchaseSuggestionsReport(PURCHASE_SUGGESTIONS_DEMO_FIXTURE);

  return {
    policyId: PURCHASE_SUGGESTIONS_P2_98_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
