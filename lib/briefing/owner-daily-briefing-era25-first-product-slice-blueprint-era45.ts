import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25FirstProductSliceBlueprintLabel,
  type Era25FirstProductSliceBlueprintUiSlice,
} from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";

export const OWNER_DAILY_BRIEFING_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA45_POLICY_ID =
  "era45-owner-daily-briefing-era25-first-product-slice-blueprint-v1" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_BRIEFING_ACTION_PRIORITY = 20 as const;

export function buildOwnerDailyBriefingEra25FirstProductSliceBlueprintAction(
  slice: Era25FirstProductSliceBlueprintUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.blueprintBlocked ||
    slice.era25FirstProductSliceBlueprintMilestone !== "era25_first_product_slice_blueprint_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-first-product-slice-blueprint",
    title: blocked
      ? `Blueprint blocked: ${slice.era25FirstProductSliceBlueprintMilestone.replaceAll("_", " ")}`
      : `Era25 blueprint ready — ${slice.canonicalSliceName}`,
    reason: `${formatEra25FirstProductSliceBlueprintLabel(slice)}. ${blocked ? "Open engineering gates with signed charter, then validate canonical charter + staging checklist before era25 product code." : "Blueprint ready — begin owner-daily-briefing-breakthrough on #era25-owner-daily-briefing-breakthrough only."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete blueprint readiness with honest gates integrity — never hand-edit PASS in artifacts.",
    priority: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open slice blueprint",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25FirstProductSliceBlueprintTopActions(
  era25FirstProductSliceBlueprintAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!era25FirstProductSliceBlueprintAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [era25FirstProductSliceBlueprintAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
