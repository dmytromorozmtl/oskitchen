/**
 * era25 engineering gates evaluation — enforcement before product engineering.
 */
import {
  ERA25_ENGINEERING_GATES_GUARDRAILS,
  ERA25_ENGINEERING_GATES_HUMAN_STEPS,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
  ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import {
  resolveEra25EngineeringGatesMilestone,
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import { discoverIllegalEra25ProductArtifacts } from "@/lib/commercial/detect-illegal-era25-product-artifacts-era24";
import {
  resolveEra25CharterExitMilestoneFromEnv,
  resolveEra25FirstCharterSliceReadinessMilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import { evaluateEra25FirstCharterSliceReadiness } from "@/lib/commercial/evaluate-era25-first-charter-slice-readiness";

export type Era25FirstCharterSliceReadinessWithMilestones = {
  evaluation: ReturnType<typeof evaluateEra25FirstCharterSliceReadiness>;
  era25CharterExitMilestone: ReturnType<typeof resolveEra25CharterExitMilestoneFromEnv>;
  era25FirstCharterSliceReadinessMilestone: ReturnType<
    typeof resolveEra25FirstCharterSliceReadinessMilestoneFromEnv
  >;
  readyForCharterExitSmokes: boolean;
  readyForCharterSectionSmokes: boolean;
};

export function evaluateEra25FirstCharterSliceReadinessWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): Era25FirstCharterSliceReadinessWithMilestones {
  const evaluation = evaluateEra25FirstCharterSliceReadiness(env, root);
  const era25CharterExitMilestone = resolveEra25CharterExitMilestoneFromEnv(env, root);
  const era25FirstCharterSliceReadinessMilestone =
    resolveEra25FirstCharterSliceReadinessMilestoneFromEnv(env, root);

  return {
    evaluation,
    era25CharterExitMilestone,
    era25FirstCharterSliceReadinessMilestone,
    readyForCharterExitSmokes:
      era25CharterExitMilestone === "terminus_guard_blocked" ||
      era25CharterExitMilestone === "attention_charter_checklist",
    readyForCharterSectionSmokes:
      evaluation.charterExit.signedCharterPresent && !evaluation.charterValidation.sectionsValid,
  };
}

export function evaluateEra25EngineeringGatesRequireSignedCharter(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  readiness: Era25FirstCharterSliceReadinessWithMilestones;
  era25EngineeringGatesMilestone: Era25EngineeringGatesMilestone;
  illegalArtifacts: ReturnType<typeof discoverIllegalEra25ProductArtifacts>;
  gatesBlocked: boolean;
  terminusGuardPassed: boolean;
  guardrails: typeof ERA25_ENGINEERING_GATES_GUARDRAILS;
  humanSteps: typeof ERA25_ENGINEERING_GATES_HUMAN_STEPS;
  gatesDoc: typeof ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC;
  firstProductSliceRequirements: typeof ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS;
} {
  const readiness = evaluateEra25FirstCharterSliceReadinessWithMilestones(env, root);
  const illegalArtifacts = discoverIllegalEra25ProductArtifacts(root);
  const era25EngineeringGatesMilestone = resolveEra25EngineeringGatesMilestone({
    era25FirstCharterSliceReadinessMilestone: readiness.era25FirstCharterSliceReadinessMilestone,
    illegalArtifactCount: illegalArtifacts.length,
  });
  const gatesBlocked =
    readiness.era25FirstCharterSliceReadinessMilestone !== "era25_first_charter_slice_ready" ||
    illegalArtifacts.length > 0;

  return {
    readiness,
    era25EngineeringGatesMilestone,
    illegalArtifacts,
    gatesBlocked,
    terminusGuardPassed: readiness.evaluation.charterExit.terminusGuard.guard.guardPassed,
    guardrails: ERA25_ENGINEERING_GATES_GUARDRAILS,
    humanSteps: ERA25_ENGINEERING_GATES_HUMAN_STEPS,
    gatesDoc: ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
    firstProductSliceRequirements: ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
  };
}
