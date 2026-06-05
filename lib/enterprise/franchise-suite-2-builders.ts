import {
  FRANCHISE_COMPLIANCE_CHECK_IDS,
  FRANCHISE_ROLLOUT_CERTIFIED_COMPLIANCE_PCT,
  FRANCHISE_ROLLOUT_GO_LIVE_COMPLIANCE_PCT,
  FRANCHISE_ROLLOUT_PHASES,
  FRANCHISE_SUITE_2_POLICY_ID,
} from "@/lib/enterprise/franchise-suite-2-policy";
import type {
  FranchiseComplianceCheck,
  FranchiseRolloutPhase,
  FranchiseRoyaltyInsights,
  FranchiseSuiteDashboardV2,
  FranchiseSuiteV2Input,
  FranchiseUnitRollout,
} from "@/lib/enterprise/franchise-suite-2-types";
import type { FranchiseUnitRow } from "@/lib/enterprise/franchise-types";

const ROLLOUT_PHASE_LABEL: Record<FranchiseRolloutPhase, string> = {
  discovery: "Discovery",
  training: "Training",
  go_live: "Go-live",
  certified: "Certified",
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildFranchiseComplianceChecks(input: {
  unit: FranchiseUnitRow;
  hasBrandKit: boolean;
}): FranchiseComplianceCheck[] {
  const { unit, hasBrandKit } = input;
  return [
    {
      id: "menu_standards",
      label: "Menu standards",
      passed: unit.menuCompliancePercent >= FRANCHISE_ROLLOUT_GO_LIVE_COMPLIANCE_PCT,
      detail: `${unit.menuCompliancePercent}% of required items on menu`,
    },
    {
      id: "brand_kit",
      label: "Brand kit",
      passed: hasBrandKit && unit.brandStatus !== "non_compliant",
      detail: hasBrandKit ? "Franchisor brand kit configured" : "Configure brand kit in brand control",
    },
    {
      id: "royalty_reporting",
      label: "Royalty reporting",
      passed: unit.totalRevenue > 0,
      detail:
        unit.totalRevenue > 0
          ? `${unit.royaltyRate}% on ${unit.totalRevenue.toLocaleString()} revenue`
          : "No qualifying revenue in period",
    },
    {
      id: "ops_active",
      label: "Operations active",
      passed: unit.status === "ACTIVE",
      detail: unit.status === "ACTIVE" ? "Franchise record active" : `Status: ${unit.status}`,
    },
  ];
}

export function resolveFranchiseRolloutPhase(input: {
  unit: FranchiseUnitRow;
  checks: FranchiseComplianceCheck[];
}): FranchiseRolloutPhase {
  const passed = input.checks.filter((c) => c.passed).length;
  if (
    input.unit.menuCompliancePercent >= FRANCHISE_ROLLOUT_CERTIFIED_COMPLIANCE_PCT &&
    passed === FRANCHISE_COMPLIANCE_CHECK_IDS.length
  ) {
    return "certified";
  }
  if (input.unit.menuCompliancePercent >= FRANCHISE_ROLLOUT_GO_LIVE_COMPLIANCE_PCT && input.unit.totalRevenue > 0) {
    return "go_live";
  }
  if (passed >= 2 || input.unit.menuCompliancePercent > 0) {
    return "training";
  }
  return "discovery";
}

export function rolloutProgressPercent(phase: FranchiseRolloutPhase): number {
  switch (phase) {
    case "discovery":
      return 25;
    case "training":
      return 50;
    case "go_live":
      return 75;
    case "certified":
      return 100;
  }
}

export function rolloutNextStep(phase: FranchiseRolloutPhase, unit: FranchiseUnitRow): string {
  switch (phase) {
    case "discovery":
      return "Import master menu and assign franchisee workspace";
    case "training":
      return unit.missingMenuItems.length > 0
        ? `Add missing items: ${unit.missingMenuItems.slice(0, 3).join(", ")}`
        : "Complete brand kit review with franchisee";
    case "go_live":
      return "Reach 95% menu compliance for certified status";
    case "certified":
      return "Maintain compliance — next royalty cycle auto-calculated";
  }
}

export function buildFranchiseRoyaltyInsights(input: {
  units: FranchiseUnitRow[];
  totalRoyalties: number;
}): FranchiseRoyaltyInsights {
  const totalRevenue = input.units.reduce((sum, unit) => sum + unit.totalRevenue, 0);
  const unitsWithRevenue = input.units.filter((unit) => unit.totalRevenue > 0).length;
  const top = [...input.units].sort((a, b) => b.royaltyAmount - a.royaltyAmount)[0] ?? null;

  return {
    totalRevenue: round1(totalRevenue),
    totalRoyalties: round1(input.totalRoyalties),
    effectiveRoyaltyRatePct:
      totalRevenue > 0 ? round1((input.totalRoyalties / totalRevenue) * 100) : null,
    averageRoyaltyPerUnit:
      input.units.length > 0 ? round1(input.totalRoyalties / input.units.length) : 0,
    unitsWithRevenue,
    topRoyaltyUnitId: top?.franchiseId ?? null,
    topRoyaltyUnitName: top?.franchiseName ?? null,
    topRoyaltyAmount: top?.royaltyAmount ?? 0,
  };
}

export function buildFranchiseUnitRollout(input: {
  unit: FranchiseUnitRow;
  hasBrandKit: boolean;
}): FranchiseUnitRollout {
  const complianceChecks = buildFranchiseComplianceChecks(input);
  const phase = resolveFranchiseRolloutPhase({ unit: input.unit, checks: complianceChecks });
  const passedCheckCount = complianceChecks.filter((c) => c.passed).length;

  return {
    franchiseId: input.unit.franchiseId,
    franchiseName: input.unit.franchiseName,
    phase,
    phaseLabel: ROLLOUT_PHASE_LABEL[phase],
    progressPercent: rolloutProgressPercent(phase),
    nextStep: rolloutNextStep(phase, input.unit),
    complianceChecks,
    passedCheckCount,
    totalCheckCount: complianceChecks.length,
  };
}

export function buildFranchiseSuiteDashboardV2(input: FranchiseSuiteV2Input): FranchiseSuiteDashboardV2 {
  const unitRollouts = input.units.map((unit) =>
    buildFranchiseUnitRollout({ unit, hasBrandKit: input.hasBrandKit }),
  );

  const rolloutByPhase = FRANCHISE_ROLLOUT_PHASES.reduce(
    (acc, phase) => {
      acc[phase] = unitRollouts.filter((row) => row.phase === phase).length;
      return acc;
    },
    {} as Record<FranchiseRolloutPhase, number>,
  );

  const totalChecks = unitRollouts.reduce((sum, row) => sum + row.totalCheckCount, 0);
  const passedChecks = unitRollouts.reduce((sum, row) => sum + row.passedCheckCount, 0);
  const compliancePassRate =
    totalChecks === 0 ? 100 : Math.round((passedChecks / totalChecks) * 100);

  return {
    policyId: FRANCHISE_SUITE_2_POLICY_ID,
    royaltyInsights: buildFranchiseRoyaltyInsights({
      units: input.units,
      totalRoyalties: input.totalRoyalties,
    }),
    rolloutByPhase,
    unitRollouts,
    compliancePassRate,
    certifiedUnitCount: rolloutByPhase.certified,
  };
}
