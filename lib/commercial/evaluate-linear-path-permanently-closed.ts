/**
 * Linear path permanently closed evaluation — Step 16 terminal orchestration.
 */
import {
  LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  resolveLinearPathPermanentlyClosedPrerequisites,
  TERMINAL_FORBIDDEN_ACTIONS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";

export function evaluateLinearPathPermanentlyClosed(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveLinearPathPermanentlyClosedPrerequisites>;
  terminalClosureActive: boolean;
  linearPathPermanentlyClosed: boolean;
  docChainSteps: number;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  absoluteEnd: ReturnType<typeof evaluateCommercialPilotPathAbsoluteEnd>;
  forbiddenActions: typeof TERMINAL_FORBIDDEN_ACTIONS;
  docChain: typeof LINEAR_PATH_DOC_CHAIN_STEP_DOCS;
} {
  const absoluteEnd = evaluateCommercialPilotPathAbsoluteEnd(env);
  const prerequisites = resolveLinearPathPermanentlyClosedPrerequisites({
    absoluteEndActive: absoluteEnd.absoluteEndActive,
  });

  return {
    prerequisites,
    terminalClosureActive: prerequisites.terminalClosureActive,
    linearPathPermanentlyClosed: prerequisites.linearPathPermanentlyClosed,
    docChainSteps: prerequisites.docChainSteps,
    goDecision: absoluteEnd.goDecision,
    completedSteps: absoluteEnd.completedSteps,
    totalSteps: absoluteEnd.totalSteps,
    absoluteEnd,
    forbiddenActions: TERMINAL_FORBIDDEN_ACTIONS,
    docChain: LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  };
}
