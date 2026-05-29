/**
 * Linear chain terminus guard UI slice — Step 17 FORBIDDEN platform panel section.
 */
import {
  LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
  LINEAR_CHAIN_MAX_STEP,
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS,
  LINEAR_CHAIN_TERMINUS_GUARD_PLATFORM_ANCHOR,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  type LinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import {
  type LinearPathPermanentlyClosedMilestone,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import { evaluateLinearChainTerminusGuardWithMilestones } from "@/scripts/ops/validate-linear-chain-terminus-guard";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID =
  "era24-linear-chain-terminus-guard-ui-v1" as const;

export type LinearChainTerminusGuardUiSlice = {
  policyId: typeof LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID;
  visible: boolean;
  step17Forbidden: boolean;
  guardPassed: boolean;
  maxLinearStep: typeof LINEAR_CHAIN_MAX_STEP;
  catalogStepCount: number;
  violationCount: number;
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  forbiddenProposals: readonly string[];
  foreverCommands: readonly string[];
  step17ForbiddenDoc: typeof LINEAR_CHAIN_STEP17_FORBIDDEN_DOC;
  validateCommand: string;
  postLinearPathClosedOrchestratorCommand: string;
  syncReportCommand: string;
  exportEraCharterChecklistCommand: string;
  platformOpsHref: string;
};

export function buildLinearChainTerminusGuardUiSlice(input: {
  terminalClosureActive: boolean;
  env?: NodeJS.ProcessEnv;
}): LinearChainTerminusGuardUiSlice | null {
  if (!input.terminalClosureActive) return null;

  const result = evaluateLinearChainTerminusGuardWithMilestones(input.env);

  return {
    policyId: LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID,
    visible: true,
    step17Forbidden: true,
    guardPassed: result.guard.guardPassed,
    maxLinearStep: LINEAR_CHAIN_MAX_STEP,
    catalogStepCount: result.guard.catalogStepCount,
    violationCount: result.guard.violations.length,
    linearChainTerminusGuardMilestone: result.linearChainTerminusGuardMilestone,
    linearPathPermanentlyClosedMilestone: result.linearPathPermanentlyClosedMilestone,
    forbiddenProposals: LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
    foreverCommands: LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS,
    step17ForbiddenDoc: LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
    validateCommand: "npm run ops:validate-linear-chain-terminus-guard -- --json",
    postLinearPathClosedOrchestratorCommand:
      "npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write",
    syncReportCommand: "npm run ops:sync-linear-chain-terminus-guard-report -- --write",
    exportEraCharterChecklistCommand:
      "npm run ops:export-era-charter-readiness-checklist -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${LINEAR_CHAIN_TERMINUS_GUARD_PLATFORM_ANCHOR}`,
  };
}

export function formatLinearChainTerminusGuardLabel(slice: LinearChainTerminusGuardUiSlice): string {
  const milestone = slice.linearChainTerminusGuardMilestone.replaceAll("_", " ");
  return `Step 17 FORBIDDEN · max step ${slice.maxLinearStep} · guard ${slice.guardPassed ? "PASS" : "FAIL"} · ${milestone}`;
}
