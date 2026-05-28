#!/usr/bin/env npx tsx
/**
 * Validates Month 2 market readiness env + artifact gates (Step 5).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  buildMonth2MarketReadinessPhaseStatuses,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  resolveMonth2MarketReadinessComplete,
  resolveMonth2MarketReadinessPrerequisites,
  resolveWeek1CompleteForMonth2,
} from "@/lib/commercial/month2-market-readiness-phases-era21";

function readJson<T>(path: string): T | null {
  const full = join(process.cwd(), path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readMonth2MarketReadinessArtifacts(): {
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
} {
  return {
    goNoGoSummary: readJson<PilotGoNoGoSummary>(PILOT_GONOGO_SUMMARY_ARTIFACT_PATH),
    metricsBaseline: readJson<PilotMetricsBaselineSummary>(PILOT_METRICS_BASELINE_ARTIFACT_PATH),
    caseStudyDraft: readJson<PilotCaseStudyDraftSummary>(PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH),
    investorOnepager: readJson<InvestorNarrativeOnepagerSummary>(
      INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
    ),
  };
}

export function evaluateMonth2MarketReadinessEnv(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveMonth2MarketReadinessPrerequisites>;
  week1Complete: boolean;
  present: string[];
  missing: string[];
  phases: ReturnType<typeof buildMonth2MarketReadinessPhaseStatuses>;
  goDecision: string | null;
  month2Complete: boolean;
} {
  const artifacts = readMonth2MarketReadinessArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const week1Complete = resolveWeek1CompleteForMonth2({
    goNoGoSummary: artifacts.goNoGoSummary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    env,
  });
  const prerequisites = resolveMonth2MarketReadinessPrerequisites({
    goDecision,
    week1Complete,
  });
  const present = MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS.filter((key) =>
    Boolean(env[key]?.trim()),
  );
  const missing = MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS.filter((key) => !env[key]?.trim());
  const phases = buildMonth2MarketReadinessPhaseStatuses({
    prerequisites,
    goNoGoSummary: artifacts.goNoGoSummary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    investorOnepager: artifacts.investorOnepager,
    env,
  });
  const month2Complete = resolveMonth2MarketReadinessComplete(phases);

  return {
    prerequisites,
    week1Complete,
    present,
    missing,
    phases,
    goDecision,
    month2Complete,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMonth2MarketReadinessEnv();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era21-month2-market-readiness-v1",
          prerequisitesComplete: result.prerequisites.prerequisitesComplete,
          week1Complete: result.week1Complete,
          goDecision: result.goDecision,
          month2Complete: result.month2Complete,
          presentCount: result.present.length,
          missing: result.missing,
          phases: result.phases.map((phase) => ({
            id: phase.id,
            label: phase.label,
            complete: phase.complete,
            optional: phase.optional,
            detail: phase.detail,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(result.prerequisites.prerequisitesComplete ? 0 : 2);
  }

  console.log(`\nMonth 2 market readiness validation (era21-month2-market-readiness-v1)\n`);

  if (!result.week1Complete) {
    console.log("Blocked — complete Pilot Week 1 (Step 4) first.\n");
    process.exit(2);
  }

  if (!result.prerequisites.prerequisitesComplete) {
    console.log("Blocked — decision must be GO in artifacts/pilot-gono-go-summary.json.\n");
    process.exit(2);
  }

  for (const phase of result.phases) {
    const marker = phase.complete ? "✓" : phase.optional ? "○ (optional)" : "○";
    console.log(`${marker} ${phase.label}`);
    console.log(`  ${phase.detail}\n`);
  }

  console.log(`Month 2 complete: ${result.month2Complete ? "yes" : "no"}\n`);
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
