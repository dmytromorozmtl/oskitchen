/**
 * era25 charter exit evaluation — process orchestration outside linear catalog.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  ERA25_CHARTER_EXIT_GUARDRAILS,
  ERA25_CHARTER_EXIT_HUMAN_STEPS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
  ERA25_CHARTER_DOC_GLOB_HINT,
  ERA_CHARTER_CRITERIA,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import { resolveLinearGuardMilestonesLightweight } from "@/lib/commercial/resolve-era25-linear-guard-milestones-lightweight-era24";

const ERA25_CHARTER_DOC_PATTERN = /^era25-.+-charter-2026-.+\.md$/;

export function discoverEra25CharterDocs(root: string = process.cwd()): readonly string[] {
  const docsDir = join(root, "docs");
  if (!existsSync(docsDir)) return [];

  return readdirSync(docsDir)
    .filter((name) => ERA25_CHARTER_DOC_PATTERN.test(name))
    .map((name) => `docs/${name}`)
    .sort();
}

export function evaluateEra25CharterExitOutsideLinearPath(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  terminusGuard: ReturnType<typeof evaluateLinearChainTerminusGuardWithMilestones>;
  charterChecklistPresent: boolean;
  era25CharterDocs: readonly string[];
  signedCharterPresent: boolean;
  criteriaCount: number;
  guardrails: typeof ERA25_CHARTER_EXIT_GUARDRAILS;
  humanSteps: typeof ERA25_CHARTER_EXIT_HUMAN_STEPS;
  processDoc: typeof ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC;
  charterDocGlobHint: typeof ERA25_CHARTER_DOC_GLOB_HINT;
  criteria: typeof ERA_CHARTER_CRITERIA;
} {
  const linearGuard = resolveLinearGuardMilestonesLightweight(env, root);
  const terminusGuard = {
    guard: linearGuard.guard,
    linearPath: {
      linearPathPermanentlyClosedMilestone: linearGuard.linearPathPermanentlyClosedMilestone,
    },
    linearChainTerminusGuardMilestone: linearGuard.linearChainTerminusGuardMilestone,
    linearPathPermanentlyClosedMilestone: linearGuard.linearPathPermanentlyClosedMilestone,
    readyForLinearPathClosureSmokes:
      linearGuard.linearPathPermanentlyClosedMilestone !== "linear_path_permanently_closed_healthy",
    readyForCatalogIntegritySmokes: !linearGuard.guard.guardPassed,
  };
  const era25CharterDocs = discoverEra25CharterDocs(root);

  return {
    terminusGuard,
    charterChecklistPresent: existsSync(join(root, ERA_CHARTER_READINESS_CHECKLIST_PATH)),
    era25CharterDocs,
    signedCharterPresent: era25CharterDocs.length > 0,
    criteriaCount: ERA_CHARTER_CRITERIA.length,
    guardrails: ERA25_CHARTER_EXIT_GUARDRAILS,
    humanSteps: ERA25_CHARTER_EXIT_HUMAN_STEPS,
    processDoc: ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
    charterDocGlobHint: ERA25_CHARTER_DOC_GLOB_HINT,
    criteria: ERA_CHARTER_CRITERIA,
  };
}
