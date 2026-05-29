/**
 * era25 Owner Daily Briefing Breakthrough — briefing scheme B0–B4 tiles.
 */
import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import type { Era25FirstProductSliceBlueprintMilestone } from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import type { Era25EngineeringGatesMilestone } from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_POLICY_ID =
  "era25-owner-daily-briefing-breakthrough-briefing-v1" as const;

export type OwnerDailyBriefingBreakthroughEra25Tile = {
  schemeId: string;
  label: string;
  headline: string;
  detail: string;
  href: string;
  tone: "default" | "attention" | "success";
  wired: boolean;
};

export function buildOwnerDailyBriefingBreakthroughEra25Tiles(input: {
  blueprintMilestone: Era25FirstProductSliceBlueprintMilestone;
  gatesMilestone: Era25EngineeringGatesMilestone;
  blueprintBlocked: boolean;
  p0ProofStatus: string | null;
  briefingSchemeCount: number;
}): readonly OwnerDailyBriefingBreakthroughEra25Tile[] {
  const blueprintReady = input.blueprintMilestone === "era25_first_product_slice_blueprint_ready";
  const p0Passed = input.p0ProofStatus === "proof_passed";

  return OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME.map((scheme) => {
    switch (scheme.id) {
      case "B0":
        return {
          schemeId: scheme.id,
          label: scheme.label,
          headline: blueprintReady
            ? "Blueprint ready — breakthrough ring open"
            : `Blueprint blocked — ${input.blueprintMilestone.replaceAll("_", " ")}`,
          detail: `Gates: ${input.gatesMilestone.replaceAll("_", " ")}`,
          href: "/platform/commercial-pilot-ops#era25-first-product-slice-blueprint",
          tone: blueprintReady ? "success" : "attention",
          wired: true,
        };
      case "B1":
        return {
          schemeId: scheme.id,
          label: scheme.label,
          headline: "Owner priorities — orders, KDS, go-live",
          detail: "Deep links from era19 briefing tiles + Today command center",
          href: "/dashboard/today",
          tone: "default",
          wired: input.briefingSchemeCount >= 5,
        };
      case "B2":
        return {
          schemeId: scheme.id,
          label: scheme.label,
          headline: "Integration recovery convergence",
          detail: "era19 recovery checklist + smoke next action",
          href: "/dashboard/integration-health#integration-recovery-checklist",
          tone: "default",
          wired: true,
        };
      case "B3":
        return {
          schemeId: scheme.id,
          label: scheme.label,
          headline: "Pilot GO/NO-GO — honest commercial status",
          detail: "Never fake GO — evaluator artifact required",
          href: "/platform/commercial-pilot-ops",
          tone: "attention",
          wired: true,
        };
      case "B4":
        return {
          schemeId: scheme.id,
          label: scheme.label,
          headline: p0Passed
            ? "P0 staging proof passed"
            : `P0 staging — ${input.p0ProofStatus ?? "awaiting_ops_credentials"}`,
          detail: "11 ops vault env vars — no fake PASS",
          href: "/platform/commercial-pilot-ops#p0-ops-vault-day0",
          tone: p0Passed ? "success" : "attention",
          wired: true,
        };
      default:
        return {
          schemeId: scheme.id,
          label: scheme.label,
          headline: scheme.description,
          detail: "",
          href: "/dashboard/today",
          tone: "default" as const,
          wired: false,
        };
    }
  });
}

export function countWiredBreakthroughBriefingTiles(
  tiles: readonly OwnerDailyBriefingBreakthroughEra25Tile[],
): number {
  return tiles.filter((tile) => tile.wired).length;
}

export function allBreakthroughBriefingTilesWired(
  tiles: readonly OwnerDailyBriefingBreakthroughEra25Tile[],
): boolean {
  return countWiredBreakthroughBriefingTiles(tiles) === tiles.length;
}
