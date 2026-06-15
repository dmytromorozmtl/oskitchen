/**
 * Registry of era25 commercial pilot convergence integrity baselines (era47–era54).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";
import { PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";
import { MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";
import { SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/scale-readiness-convergence-integrity-era50";
import { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";
import { MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";
import { PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT } from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54";

export type Era25ConvergenceIntegrityBaselineRegistryEntry = {
  era: number;
  phaseLabel: string;
  artifactPath: string;
  executionHonestKey: string;
  syncBaselineCommand: string;
  validateIntegrityCommand: string;
};

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES: readonly Era25ConvergenceIntegrityBaselineRegistryEntry[] =
  [
    {
      era: 47,
      phaseLabel: "Phase W paid pilot GO",
      artifactPath: PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "paidPilotGoConvergenceExecutionHonest",
      syncBaselineCommand: "npm run ops:sync-paid-pilot-go-convergence-integrity-baseline -- --write",
      validateIntegrityCommand: "npm run ops:validate-paid-pilot-go-convergence-integrity -- --json",
    },
    {
      era: 48,
      phaseLabel: "Phase X pilot week 1",
      artifactPath: PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "pilotWeek1ExecutionConvergenceExecutionHonest",
      syncBaselineCommand:
        "npm run ops:sync-pilot-week1-execution-convergence-integrity-baseline -- --write",
      validateIntegrityCommand:
        "npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json",
    },
    {
      era: 49,
      phaseLabel: "Phase Y month 2",
      artifactPath: MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "month2MarketReadinessConvergenceExecutionHonest",
      syncBaselineCommand:
        "npm run ops:sync-month2-market-readiness-convergence-integrity-baseline -- --write",
      validateIntegrityCommand:
        "npm run ops:validate-month2-market-readiness-convergence-integrity -- --json",
    },
    {
      era: 50,
      phaseLabel: "Phase Z scale",
      artifactPath: SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "scaleReadinessConvergenceExecutionHonest",
      syncBaselineCommand: "npm run ops:sync-scale-readiness-convergence-integrity-baseline -- --write",
      validateIntegrityCommand: "npm run ops:validate-scale-readiness-convergence-integrity -- --json",
    },
    {
      era: 51,
      phaseLabel: "Phase AA Series A",
      artifactPath: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "seriesAPartnerExpansionConvergenceExecutionHonest",
      syncBaselineCommand:
        "npm run ops:sync-series-a-partner-expansion-convergence-integrity-baseline -- --write",
      validateIntegrityCommand:
        "npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json",
    },
    {
      era: 52,
      phaseLabel: "Phase AB market leader",
      artifactPath: MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "marketLeaderPositioningConvergenceExecutionHonest",
      syncBaselineCommand:
        "npm run ops:sync-market-leader-positioning-convergence-integrity-baseline -- --write",
      validateIntegrityCommand:
        "npm run ops:validate-market-leader-positioning-convergence-integrity -- --json",
    },
    {
      era: 53,
      phaseLabel: "Phase AC sustained ops",
      artifactPath: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "sustainedOperationalExcellenceConvergenceExecutionHonest",
      syncBaselineCommand:
        "npm run ops:sync-sustained-operational-excellence-convergence-integrity-baseline -- --write",
      validateIntegrityCommand:
        "npm run ops:validate-sustained-operational-excellence-convergence-integrity -- --json",
    },
    {
      era: 54,
      phaseLabel: "Phase AD pure ops terminus",
      artifactPath: PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
      executionHonestKey: "pureOperationalModeTerminusConvergenceExecutionHonest",
      syncBaselineCommand:
        "npm run ops:sync-pure-operational-mode-terminus-convergence-integrity-baseline -- --write",
      validateIntegrityCommand:
        "npm run ops:validate-pure-operational-mode-terminus-convergence-integrity -- --json",
    },
  ] as const;

export type ParsedConvergenceIntegrityBaseline = {
  artifactPath: string;
  present: boolean;
  honest: boolean;
  goDecision: string | null;
  recordedAt: string | null;
};

export function readConvergenceIntegrityBaseline(
  root: string,
  entry: Era25ConvergenceIntegrityBaselineRegistryEntry,
): ParsedConvergenceIntegrityBaseline {
  const path = join(root, entry.artifactPath);

  if (!existsSync(path)) {
    return {
      artifactPath: entry.artifactPath,
      present: false,
      honest: false,
      goDecision: null,
      recordedAt: null,
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    const executionHonest = parsed[entry.executionHonestKey] === true;
    const goDecision = typeof parsed.goDecision === "string" ? parsed.goDecision : null;
    const recordedAt = typeof parsed.recordedAt === "string" ? parsed.recordedAt : null;
    return {
      artifactPath: entry.artifactPath,
      present: true,
      honest: executionHonest && goDecision === "GO",
      goDecision,
      recordedAt,
    };
  } catch {
    return {
      artifactPath: entry.artifactPath,
      present: true,
      honest: false,
      goDecision: null,
      recordedAt: null,
    };
  }
}
