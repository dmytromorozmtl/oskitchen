import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25BandAMarketProofExecutionSolePathEra25Label,
  type Era25BandAMarketProofExecutionSolePathEra25UiSlice,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA61_POLICY_ID =
  "era61-owner-daily-briefing-era25-band-a-market-proof-execution-sole-path-v1" as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BRIEFING_META_ACTION_PRIORITY = 36 as const;

export function buildOwnerDailyBriefingEra25BandAMarketProofExecutionSolePathAction(
  slice: Era25BandAMarketProofExecutionSolePathEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.solePathBlocked;
  const href = slice.p0OpsVaultHref;

  return {
    id: "era25-band-a-market-proof-execution-sole-path",
    title: blocked
      ? slice.frozenEnvMutationDetected
        ? "Band A sole-path blocked: era25 governance env keys still mutable"
        : slice.p0ProofReferencedInSolePath && slice.p0ProofStatus !== "proof_passed"
          ? "Band A sole-path blocked: P0 proof_passed not honest in artifact"
          : "Band A market proof sole-path: attest after governance terminus freeze"
      : "Band A sole-path locked · execute P0 ops vault until proof_passed",
    reason: `${formatEra25BandAMarketProofExecutionSolePathEra25Label(slice)}. ${blocked ? "Complete governance terminus freeze (era60), validate sole-path + P0 artifact honesty, then dual-cert. Sole-path does not fake proof_passed." : "Only improvement loop + P0 ops vault remain operator-mutable — run smoke:p0-staging-proof-unblock after vault credentials."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest Band A sole-path after honest governance terminus freeze; sustain P0 ops vault execution until artifacts/p0-staging-proof-unblock-summary.json is proof_passed.",
    priority: ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open sole-path checklist" : "Open P0 ops vault",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25BandAMarketProofExecutionSolePathTopActions(
  solePathAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!solePathAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [solePathAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
