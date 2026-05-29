import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSustainedProductEvolutionReentrantEra25Label,
  type SustainedProductEvolutionReentrantEra25UiSlice,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA56_POLICY_ID =
  "era56-owner-daily-briefing-era25-sustained-product-evolution-re-entrant-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BRIEFING_META_ACTION_PRIORITY = 31 as const;

export function buildOwnerDailyBriefingEra25SustainedProductEvolutionReentrantAction(
  slice: SustainedProductEvolutionReentrantEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.reentrantBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-sustained-product-evolution-re-entrant",
    title: blocked
      ? slice.linearConvergenceSurfaceReopened
        ? "Re-entrant blocked: linear era25 convergence env detected"
        : "Re-entrant product evolution: train closure + improvement loop required"
      : "Era25 product evolution re-entrant · improvement loop path active",
    reason: `${formatSustainedProductEvolutionReentrantEra25Label(slice)}. ${blocked ? "Close train closure (era55), run improvement loop orchestrator + product evolution integrity, clear illegal era25 linear convergence env keys." : "Maintain product evolution only via improvement loop; era25 convergence surfaces stay suppressed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest sustained product evolution re-entrant path with honest train closure, improvement loop, and product evolution integrity PASS.",
    priority: SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open re-entrant evolution",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25SustainedProductEvolutionReentrantTopActions(
  sustainedProductEvolutionReentrantAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!sustainedProductEvolutionReentrantAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [sustainedProductEvolutionReentrantAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
