/**
 * era25 charter exit UI slice — outside linear catalog platform panel section.
 */
import {
  buildEra25FirstCharterSliceReadinessUiSlice,
  type Era25FirstCharterSliceReadinessUiSlice,
} from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import {
  ERA25_CHARTER_EXIT_FOREVER_COMMANDS,
  ERA25_CHARTER_EXIT_GUARDRAILS,
  ERA25_CHARTER_EXIT_HUMAN_STEPS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
  ERA25_CHARTER_EXIT_PLATFORM_ANCHOR,
  ERA25_CHARTER_DOC_GLOB_HINT,
  ERA_CHARTER_CRITERIA,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import {
  type Era25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import {
  type LinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import { evaluateEra25CharterExitOutsideLinearPathWithMilestones } from "@/scripts/ops/validate-era25-charter-exit-outside-linear-path";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID =
  "era24-era25-charter-exit-outside-linear-path-ui-v1" as const;

export type Era25CharterExitUiSlice = {
  policyId: typeof ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  guardPassed: boolean;
  charterChecklistPresent: boolean;
  signedCharterPresent: boolean;
  era25CharterDocCount: number;
  era25CharterExitMilestone: Era25CharterExitMilestone;
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  criteriaCount: number;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  criteria: typeof ERA_CHARTER_CRITERIA;
  processDoc: typeof ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC;
  charterDocGlobHint: typeof ERA25_CHARTER_DOC_GLOB_HINT;
  charterChecklistPath: typeof ERA_CHARTER_READINESS_CHECKLIST_PATH;
  foreverCommands: readonly string[];
  validateCommand: string;
  postTerminusGuardOrchestratorCommand: string;
  syncReportCommand: string;
  exportCharterChecklistCommand: string;
  platformOpsHref: string;
  firstCharterSliceReadiness: Era25FirstCharterSliceReadinessUiSlice | null;
};

export function buildEra25CharterExitUiSlice(input: {
  guardPassed: boolean;
  env?: NodeJS.ProcessEnv;
}): Era25CharterExitUiSlice | null {
  if (!input.guardPassed) return null;

  const result = evaluateEra25CharterExitOutsideLinearPathWithMilestones(input.env);
  const firstCharterSliceReadiness = buildEra25FirstCharterSliceReadinessUiSlice({
    charterExitVisible: true,
    env: input.env,
  });

  return {
    policyId: ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    guardPassed: result.evaluation.terminusGuard.guard.guardPassed,
    charterChecklistPresent: result.evaluation.charterChecklistPresent,
    signedCharterPresent: result.evaluation.signedCharterPresent,
    era25CharterDocCount: result.evaluation.era25CharterDocs.length,
    era25CharterExitMilestone: result.era25CharterExitMilestone,
    linearChainTerminusGuardMilestone:
      result.evaluation.terminusGuard.linearChainTerminusGuardMilestone,
    criteriaCount: result.evaluation.criteriaCount,
    guardrails: ERA25_CHARTER_EXIT_GUARDRAILS,
    humanSteps: ERA25_CHARTER_EXIT_HUMAN_STEPS,
    criteria: ERA_CHARTER_CRITERIA,
    processDoc: ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
    charterDocGlobHint: ERA25_CHARTER_DOC_GLOB_HINT,
    charterChecklistPath: ERA_CHARTER_READINESS_CHECKLIST_PATH,
    foreverCommands: ERA25_CHARTER_EXIT_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
    postTerminusGuardOrchestratorCommand:
      "npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write",
    syncReportCommand: "npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write",
    exportCharterChecklistCommand:
      "npm run ops:export-era-charter-readiness-checklist -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_CHARTER_EXIT_PLATFORM_ANCHOR}`,
    firstCharterSliceReadiness,
  };
}

export function formatEra25CharterExitLabel(slice: Era25CharterExitUiSlice): string {
  const milestone = slice.era25CharterExitMilestone.replaceAll("_", " ");
  return `era25+ charter exit · outside linear path · ${milestone} · ${slice.era25CharterDocCount} charter docs`;
}
