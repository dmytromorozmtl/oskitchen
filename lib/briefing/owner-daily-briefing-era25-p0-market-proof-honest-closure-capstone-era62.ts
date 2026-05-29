import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25P0MarketProofHonestClosureCapstoneEra25Label,
  type Era25P0MarketProofHonestClosureCapstoneEra25UiSlice,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA62_POLICY_ID =
  "era62-owner-daily-briefing-era25-p0-market-proof-honest-closure-capstone-v1" as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BRIEFING_META_ACTION_PRIORITY = 37 as const;

export function buildOwnerDailyBriefingEra25P0MarketProofHonestClosureCapstoneAction(
  slice: Era25P0MarketProofHonestClosureCapstoneEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.closureCapstoneBlocked;
  const href = slice.p0OpsVaultHref;

  return {
    id: "era25-p0-market-proof-honest-closure-capstone",
    title: blocked
      ? slice.frozenEnvMutationDetected
        ? "P0 closure capstone blocked: era25 governance env keys still mutable"
        : !slice.p0ArtifactProofPassed
          ? "P0 closure capstone blocked: artifact not proof_passed"
          : "P0 market proof closure capstone: attest after sole-path lock + honest artifact"
      : "Era25 P0 market proof closure complete · Band A governance chain closed",
    reason: `${formatEra25P0MarketProofHonestClosureCapstoneEra25Label(slice)}. ${blocked ? "Complete Band A sole-path (era61), achieve honest proof_passed on P0 artifact, then dual-cert. Closure capstone is artifact-driven — never fake proof_passed via env." : "Era25 era47–AK governance train closed for market proof — sustain improvement loop and commercial ops on honest artifacts only."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest P0 market proof honest closure capstone only when Band A sole-path is locked and artifacts/p0-staging-proof-unblock-summary.json is proof_passed.",
    priority: ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open P0 ops vault" : "View closure capstone",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25P0MarketProofHonestClosureCapstoneTopActions(
  closureAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!closureAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [closureAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
