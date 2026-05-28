/**
 * Linear path permanently closed UI slice — terminal platform panel section.
 */
import {
  LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  LINEAR_PATH_PERMANENTLY_CLOSED_PLATFORM_ANCHOR,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
  TERMINAL_ERA25_EXIT,
  TERMINAL_FORBIDDEN_ACTIONS,
  TERMINAL_FOREVER_COMMANDS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";
import {
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  evaluateLinearChainTerminusGuard,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
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
  syncReportCommand: string;
  platformOpsHref: string;
  terminusGuardPassed: boolean;
  step17ForbiddenDoc: typeof LINEAR_CHAIN_STEP17_FORBIDDEN_DOC;
  terminusGuardValidateCommand: string;
};

export function buildLinearPathPermanentlyClosedUiSlice(input: {
  absoluteEndActive: boolean;
  env?: NodeJS.ProcessEnv;
}): LinearPathPermanentlyClosedUiSlice | null {
  if (!input.absoluteEndActive) return null;

  const evaluation = evaluateLinearPathPermanentlyClosed(input.env);
  const guard = evaluateLinearChainTerminusGuard();

  return {
    policyId: LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID,
    visible: true,
    terminalClosureActive: evaluation.terminalClosureActive,
    linearPathPermanentlyClosed: evaluation.linearPathPermanentlyClosed,
    docChainSteps: evaluation.docChainSteps,
    goDecision: evaluation.goDecision,
    completedSteps: evaluation.completedSteps,
    totalSteps: evaluation.totalSteps,
    forbiddenActions: TERMINAL_FORBIDDEN_ACTIONS,
    era25ExitSteps: TERMINAL_ERA25_EXIT,
    foreverCommands: TERMINAL_FOREVER_COMMANDS,
    step16Doc: LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
    validateCommand: "npm run ops:validate-linear-path-permanently-closed",
    syncReportCommand: "npm run ops:sync-linear-path-permanently-closed-report -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${LINEAR_PATH_PERMANENTLY_CLOSED_PLATFORM_ANCHOR}`,
    terminusGuardPassed: guard.guardPassed,
    step17ForbiddenDoc: LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
    terminusGuardValidateCommand: "npm run ops:validate-linear-chain-terminus-guard",
  };
}

export function formatLinearPathPermanentlyClosedLabel(
  slice: LinearPathPermanentlyClosedUiSlice,
): string {
  return `Linear path permanently closed · ${slice.docChainSteps}-step doc chain · Step 17+ forbidden`;
}
