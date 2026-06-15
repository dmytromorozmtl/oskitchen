import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSustainedProductEvolutionTrackDetail,
  resolveNextSustainedProductEvolutionAttentionTrack,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import {
  formatSustainedProductEvolutionProgressLabel,
  type SustainedProductEvolutionUiSlice,
} from "@/lib/commercial/sustained-product-evolution-ui-era23";

export const OWNER_DAILY_BRIEFING_SUSTAINED_PRODUCT_EVOLUTION_ERA35_POLICY_ID =
  "era35-owner-daily-briefing-sustained-product-evolution-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_BRIEFING_ACTION_PRIORITY = 10 as const;

export function buildOwnerDailyBriefingSustainedProductEvolutionAction(
  slice: SustainedProductEvolutionUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const nextTrack = resolveNextSustainedProductEvolutionAttentionTrack(slice.tracks);
  const trackDetail = nextTrack
    ? formatSustainedProductEvolutionTrackDetail(nextTrack)
    : formatSustainedProductEvolutionProgressLabel(slice);

  const href =
    nextTrack?.id === "customer_feedback_backlog"
      ? slice.reportsHref
      : nextTrack?.id === "competitor_leapfrog_roadmap"
        ? slice.implementationHref
        : nextTrack?.id === "gtm_landing_alignment"
          ? slice.ghostKitchenLandingHref
          : nextTrack?.id === "implementation_hub_rollout"
            ? slice.implementationHref
            : nextTrack?.id === "ownership_matrix_review"
              ? slice.platformOpsHref
              : slice.todayHref;

  return {
    id: "sustained-product-evolution",
    title: nextTrack
      ? `Product evolution — ${nextTrack.label.replace(/^(Product|Marketing|Engineering|Leadership) — /, "")}`
      : "Sustained product evolution — product-led growth",
    reason: `${formatSustainedProductEvolutionProgressLabel(slice)}. ${trackDetail}`,
    severity: slice.overdueCount > 0 ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Maintain product-led growth tracks with honest artifact freshness — never hand-edit PASS in artifacts.",
    priority: SUSTAINED_PRODUCT_EVOLUTION_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open product evolution",
    tone: slice.overdueCount > 0 ? "urgent" : "normal",
  };
}

export function mergeBriefingSustainedProductEvolutionTopActions(
  productEvolutionAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!productEvolutionAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [productEvolutionAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
