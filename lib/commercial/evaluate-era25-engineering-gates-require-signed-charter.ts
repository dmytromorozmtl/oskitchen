/**
 * era25 engineering gates evaluation — enforcement before product engineering.
 */
import {
  ERA25_ENGINEERING_GATES_GUARDRAILS,
  ERA25_ENGINEERING_GATES_HUMAN_STEPS,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
  ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import { discoverIllegalEra25ProductArtifacts } from "@/lib/commercial/detect-illegal-era25-product-artifacts-era24";
import { evaluateEra25FirstCharterSliceReadinessWithMilestones } from "@/scripts/ops/validate-era25-first-charter-slice-readiness";

export function evaluateEra25EngineeringGatesRequireSignedCharter(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  readiness: ReturnType<typeof evaluateEra25FirstCharterSliceReadinessWithMilestones>;
  illegalArtifacts: ReturnType<typeof discoverIllegalEra25ProductArtifacts>;
  gatesBlocked: boolean;
  terminusGuardPassed: boolean;
  guardrails: typeof ERA25_ENGINEERING_GATES_GUARDRAILS;
  humanSteps: typeof ERA25_ENGINEERING_GATES_HUMAN_STEPS;
  gatesDoc: typeof ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC;
  firstProductSliceRequirements: typeof ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS;
} {
  const readiness = evaluateEra25FirstCharterSliceReadinessWithMilestones(env);
  const illegalArtifacts = discoverIllegalEra25ProductArtifacts(root);
  const gatesBlocked =
    readiness.era25FirstCharterSliceReadinessMilestone !== "era25_first_charter_slice_ready" ||
    illegalArtifacts.length > 0;

  return {
    readiness,
    illegalArtifacts,
    gatesBlocked,
    terminusGuardPassed: readiness.evaluation.charterExit.terminusGuard.guard.guardPassed,
    guardrails: ERA25_ENGINEERING_GATES_GUARDRAILS,
    humanSteps: ERA25_ENGINEERING_GATES_HUMAN_STEPS,
    gatesDoc: ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
    firstProductSliceRequirements: ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
  };
}
