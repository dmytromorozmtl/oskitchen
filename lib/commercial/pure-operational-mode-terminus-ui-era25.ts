/**
 * era25 Pure Operational Mode Terminus UI slice.
 */
import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_FOREVER_COMMANDS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_BACKLOG_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ERA22_REFERENCE_DOC,
} from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import {
  type PureOperationalModeTerminusEra25Milestone,
} from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import type { SustainedOperationalExcellenceConvergenceEra25Milestone } from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import type { ContinuousImprovementLoopTrackStatus } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR } from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import { evaluatePureOperationalModeTerminusEra25WithMilestones } from "@/scripts/ops/validate-pure-operational-mode-terminus-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UI_POLICY_ID =
  "era25-pure-operational-mode-terminus-ui-v1" as const;

export type PureOperationalModeTerminusEra25UiSlice = {
  policyId: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  pureOperationalModeTerminusEra25Milestone: PureOperationalModeTerminusEra25Milestone;
  sustainedOperationalExcellenceConvergenceEra25Milestone: SustainedOperationalExcellenceConvergenceEra25Milestone;
  terminusBlocked: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  goDecision: string | null;
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  tracks: readonly ContinuousImprovementLoopTrackStatus[];
  nextAttentionTrackLabel: string | null;
  convergenceTargets: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC;
  era22ReferenceDoc: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ERA22_REFERENCE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postSustainedOpsConvergenceOrchestratorCommand: string;
  syncReportCommand: string;
  validateSustainedOpsConvergenceCommand: string;
  validateImprovementLoopCommand: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
};

export function buildPureOperationalModeTerminusEra25UiSlice(input: {
  sustainedOpsConvergenceVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): PureOperationalModeTerminusEra25UiSlice | null {
  if (!input.sustainedOpsConvergenceVisible) return null;

  const result = evaluatePureOperationalModeTerminusEra25WithMilestones(input.env);

  const headline = result.evaluation.pureOperationalModeEra25Active
    ? "Pure operational mode active — era25 product convergence chain complete"
    : result.evaluation.sustainedOpsConvergenceReady
      ? `Improvement loop ${result.evaluation.terminusState.healthyCount}/${result.evaluation.terminusState.tracks.length} tracks fresh — ${result.pureOperationalModeTerminusEra25Milestone.replaceAll("_", " ")}`
      : "Awaiting sustained operational excellence convergence";

  return {
    policyId: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    pureOperationalModeTerminusEra25Milestone: result.pureOperationalModeTerminusEra25Milestone,
    sustainedOperationalExcellenceConvergenceEra25Milestone:
      result.evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone,
    terminusBlocked: result.evaluation.terminusBlocked,
    sustainedOpsConvergenceReady: result.evaluation.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: result.evaluation.pureOperationalModeEra25Active,
    goDecision: result.evaluation.terminusState.goDecision,
    healthyCount: result.evaluation.terminusState.healthyCount,
    dueSoonCount: result.evaluation.terminusState.dueSoonCount,
    overdueCount: result.evaluation.terminusState.overdueCount,
    guidanceCount: result.evaluation.terminusState.guidanceCount,
    tracks: result.evaluation.terminusState.tracks,
    nextAttentionTrackLabel: result.evaluation.terminusState.nextAttentionTrackLabel,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_BACKLOG_ID,
    guardrails: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
    humanSteps: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
    convergenceDoc: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
    era22ReferenceDoc: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ERA22_REFERENCE_DOC,
    foreverCommands: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
    postSustainedOpsConvergenceOrchestratorCommand:
      "npm run ops:run-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25 -- --write",
    syncReportCommand: "npm run ops:sync-pure-operational-mode-terminus-era25-report -- --write",
    validateSustainedOpsConvergenceCommand:
      "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
    validateImprovementLoopCommand: "npm run ops:validate-continuous-improvement-loop -- --json",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR}`,
    todayHref: "/dashboard/today",
    headline,
  };
}

/** When true, era25 convergence briefing actions and Launch Wizard gate strips are suppressed. */
export function shouldSuppressEra25ProductConvergenceSurfaces(input: {
  pureOperationalModeEra25Active: boolean;
}): boolean {
  return input.pureOperationalModeEra25Active;
}

/** When true, era21 commercial gate phase panels are hidden on steady-state surfaces. */
export function shouldSuppressEra21CommercialPilotGatePanels(input: {
  pureOperationalModeEra25Active: boolean;
}): boolean {
  return input.pureOperationalModeEra25Active;
}

export function formatPureOperationalModeTerminusEra25Label(
  slice: PureOperationalModeTerminusEra25UiSlice,
): string {
  const milestone = slice.pureOperationalModeTerminusEra25Milestone.replaceAll("_", " ");
  const status = slice.terminusBlocked ? "BLOCKED" : "ACTIVE";
  const health = `${slice.healthyCount}/${slice.tracks.length} tracks fresh`;
  return `era25 pure operational mode terminus · ${status} · ${health} · ${milestone}`;
}
