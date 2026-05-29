#!/usr/bin/env npx tsx
/**
 * Validates era25 first charter slice readiness (charter doc sections — informational).
 */
import {
  resolveEra25FirstCharterSliceReadinessMilestone,
  type Era25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import { ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_POLICY_ID } from "@/lib/commercial/era25-first-charter-slice-readiness-era24-policy";
import {
  ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
  ERA25_CHARTER_REQUIRED_SECTIONS,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import { evaluateEra25FirstCharterSliceReadiness } from "@/lib/commercial/evaluate-era25-first-charter-slice-readiness";
import { evaluateEra25CharterExitOutsideLinearPathWithMilestones } from "@/scripts/ops/validate-era25-charter-exit-outside-linear-path";

export { evaluateEra25FirstCharterSliceReadiness };

export function evaluateEra25FirstCharterSliceReadinessWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateEra25FirstCharterSliceReadiness>;
  era25CharterExitMilestone: ReturnType<
    typeof evaluateEra25CharterExitOutsideLinearPathWithMilestones
  >["era25CharterExitMilestone"];
  era25FirstCharterSliceReadinessMilestone: Era25FirstCharterSliceReadinessMilestone;
  readyForCharterExitSmokes: boolean;
  readyForCharterSectionSmokes: boolean;
} {
  const evaluation = evaluateEra25FirstCharterSliceReadiness(env);
  const charterExit = evaluateEra25CharterExitOutsideLinearPathWithMilestones(env);
  const era25FirstCharterSliceReadinessMilestone = resolveEra25FirstCharterSliceReadinessMilestone({
    era25CharterExitMilestone: charterExit.era25CharterExitMilestone,
    signedCharterPresent: evaluation.charterExit.signedCharterPresent,
    sectionsValid: evaluation.charterValidation.sectionsValid,
  });

  const readyForCharterExitSmokes =
    charterExit.era25CharterExitMilestone === "terminus_guard_blocked" ||
    charterExit.era25CharterExitMilestone === "attention_charter_checklist";
  const readyForCharterSectionSmokes =
    evaluation.charterExit.signedCharterPresent && !evaluation.charterValidation.sectionsValid;

  return {
    evaluation,
    era25CharterExitMilestone: charterExit.era25CharterExitMilestone,
    era25FirstCharterSliceReadinessMilestone,
    readyForCharterExitSmokes,
    readyForCharterSectionSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25FirstCharterSliceReadinessWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_POLICY_ID,
          outsideLinearCatalog: true,
          era25FirstCharterSliceReadinessMilestone: result.era25FirstCharterSliceReadinessMilestone,
          era25CharterExitMilestone: result.era25CharterExitMilestone,
          readyForCharterExitSmokes: result.readyForCharterExitSmokes,
          readyForCharterSectionSmokes: result.readyForCharterSectionSmokes,
          charterDocPath: result.evaluation.charterValidation.charterDocPath,
          sectionsValid: result.evaluation.charterValidation.sectionsValid,
          missingSectionIds: result.evaluation.charterValidation.missingSectionIds,
          missingSectionLabels: result.evaluation.charterValidation.missingSectionLabels,
          sectionResults: result.evaluation.charterValidation.sectionResults,
          requiredSections: ERA25_CHARTER_REQUIRED_SECTIONS.map((section) => ({
            id: section.id,
            label: section.label,
          })),
          guardrails: ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 first charter slice readiness (${ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.era25FirstCharterSliceReadinessMilestone}`);
  console.log(`Charter exit milestone: ${result.era25CharterExitMilestone}`);
  console.log(`Charter doc: ${result.evaluation.charterValidation.charterDocPath ?? "none"}`);
  console.log(
    `Sections valid: ${result.evaluation.charterValidation.sectionsValid ? "yes" : "no"} (${result.evaluation.charterValidation.missingSectionIds.length} missing)\n`,
  );
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
