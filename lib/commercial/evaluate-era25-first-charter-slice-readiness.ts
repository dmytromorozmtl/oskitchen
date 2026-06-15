/**
 * era25 first charter slice readiness evaluation — charter doc section gate.
 */
import {
  ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN,
  ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
  ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
  ERA25_CHARTER_REQUIRED_SECTIONS,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import { validateFirstEra25CharterDocSections } from "@/lib/commercial/validate-era25-charter-doc-sections-era24";
import { evaluateEra25CharterExitOutsideLinearPath } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";

export function evaluateEra25FirstCharterSliceReadiness(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  charterExit: ReturnType<typeof evaluateEra25CharterExitOutsideLinearPath>;
  charterValidation: ReturnType<typeof validateFirstEra25CharterDocSections>;
  requiredSectionCount: number;
  guardrails: typeof ERA25_FIRST_CHARTER_SLICE_GUARDRAILS;
  engineeringPattern: typeof ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN;
  templateDoc: typeof ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC;
  requiredSections: typeof ERA25_CHARTER_REQUIRED_SECTIONS;
} {
  const charterExit = evaluateEra25CharterExitOutsideLinearPath(env, root);
  const charterValidation = validateFirstEra25CharterDocSections(root);

  return {
    charterExit,
    charterValidation,
    requiredSectionCount: ERA25_CHARTER_REQUIRED_SECTIONS.length,
    guardrails: ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
    engineeringPattern: ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN,
    templateDoc: ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
    requiredSections: ERA25_CHARTER_REQUIRED_SECTIONS,
  };
}
