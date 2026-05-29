/**
 * Linear path permanently closed UI slice — terminal platform panel section.
 */
import {
  LINEAR_PATH_PERMANENTLY_CLOSED_PLATFORM_ANCHOR,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
  TERMINAL_ERA25_EXIT,
  TERMINAL_FORBIDDEN_ACTIONS,
  TERMINAL_FOREVER_COMMANDS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import {
  type LinearPathPermanentlyClosedMilestone,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import {
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  buildLinearChainTerminusGuardUiSlice,
  type LinearChainTerminusGuardUiSlice,
} from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";
import { evaluateLinearPathPermanentlyClosedWithMilestones } from "@/scripts/ops/validate-linear-path-permanently-closed";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID =
  "era24-linear-path-permanently-closed-ui-v1" as const;

export type LinearPathPermanentlyClosedUiSlice = {
  policyId: typeof LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID;
  visible: boolean;
  terminalClosureActive: boolean;
  linearPathPermanentlyClosed: boolean;
  docChainSteps: number;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  forbiddenActions: readonly string[];
  era25ExitSteps: readonly string[];
  foreverCommands: readonly string[];
  step16Doc: typeof LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC;
  validateCommand: string;
  postAbsoluteEndOrchestratorCommand: string;
  syncReportCommand: string;
  platformOpsHref: string;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  missingDocChainDocCount: number;
  terminusGuardPassed: boolean;
  step17ForbiddenDoc: typeof LINEAR_CHAIN_STEP17_FORBIDDEN_DOC;
  terminusGuardValidateCommand: string;
  step17Forbidden: LinearChainTerminusGuardUiSlice | null;
};

export function buildLinearPathPermanentlyClosedUiSlice(input: {
  absoluteEndActive: boolean;
  env?: NodeJS.ProcessEnv;
}): LinearPathPermanentlyClosedUiSlice | null {
  if (!input.absoluteEndActive) return null;

  const result = evaluateLinearPathPermanentlyClosedWithMilestones(input.env);
  const step17Forbidden = buildLinearChainTerminusGuardUiSlice({
    terminalClosureActive: result.evaluation.terminalClosureActive,
    env: input.env,
  });

  return {
    policyId: LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID,
    visible: true,
    terminalClosureActive: result.evaluation.terminalClosureActive,
    linearPathPermanentlyClosed: result.evaluation.linearPathPermanentlyClosed,
    docChainSteps: result.evaluation.docChainSteps,
    goDecision: result.evaluation.goDecision,
    completedSteps: result.evaluation.completedSteps,
    totalSteps: result.evaluation.totalSteps,
    forbiddenActions: TERMINAL_FORBIDDEN_ACTIONS,
    era25ExitSteps: TERMINAL_ERA25_EXIT,
    foreverCommands: TERMINAL_FOREVER_COMMANDS,
    step16Doc: LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
    validateCommand: "npm run ops:validate-linear-path-permanently-closed -- --json",
    postAbsoluteEndOrchestratorCommand:
      "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
    syncReportCommand: "npm run ops:sync-linear-path-permanently-closed-report -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${LINEAR_PATH_PERMANENTLY_CLOSED_PLATFORM_ANCHOR}`,
    linearPathPermanentlyClosedMilestone: result.linearPathPermanentlyClosedMilestone,
    missingDocChainDocCount: result.missingDocChainDocs.length,
    terminusGuardPassed: result.guard.guardPassed,
    step17ForbiddenDoc: LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
    terminusGuardValidateCommand: "npm run ops:validate-linear-chain-terminus-guard -- --json",
    step17Forbidden,
  };
}

export function formatLinearPathPermanentlyClosedLabel(
  slice: LinearPathPermanentlyClosedUiSlice,
): string {
  const milestone = slice.linearPathPermanentlyClosedMilestone.replaceAll("_", " ");
  return `Linear path permanently closed · ${slice.docChainSteps}-step doc chain · ${milestone} · Step 17+ forbidden`;
}
