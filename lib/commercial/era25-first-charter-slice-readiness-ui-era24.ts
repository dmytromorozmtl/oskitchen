/**
 * era25 first charter slice readiness UI slice — charter section validation panel.
 */
import {
  buildEra25EngineeringGatesUiSlice,
  type Era25EngineeringGatesUiSlice,
} from "@/lib/commercial/era25-engineering-gates-ui-era24";
import {
  ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN,
  ERA25_FIRST_CHARTER_SLICE_FOREVER_COMMANDS,
  ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
  ERA25_FIRST_CHARTER_SLICE_READINESS_PLATFORM_ANCHOR,
  ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
  ERA25_CHARTER_REQUIRED_SECTIONS,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import {
  type Era25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import {
  type Era25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import { evaluateEra25FirstCharterSliceReadinessWithMilestones } from "@/scripts/ops/validate-era25-first-charter-slice-readiness";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID =
  "era24-era25-first-charter-slice-readiness-ui-v1" as const;

export type Era25FirstCharterSliceReadinessUiSlice = {
  policyId: typeof ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  era25FirstCharterSliceReadinessMilestone: Era25FirstCharterSliceReadinessMilestone;
  era25CharterExitMilestone: Era25CharterExitMilestone;
  charterDocPath: string | null;
  sectionsValid: boolean;
  missingSectionCount: number;
  requiredSectionCount: number;
  requiredSections: typeof ERA25_CHARTER_REQUIRED_SECTIONS;
  engineeringPattern: typeof ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN;
  guardrails: readonly string[];
  templateDoc: typeof ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postCharterExitOrchestratorCommand: string;
  syncReportCommand: string;
  validateCharterExitCommand: string;
  platformOpsHref: string;
  engineeringGates: Era25EngineeringGatesUiSlice | null;
};

export function buildEra25FirstCharterSliceReadinessUiSlice(input: {
  charterExitVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): Era25FirstCharterSliceReadinessUiSlice | null {
  if (!input.charterExitVisible) return null;

  const result = evaluateEra25FirstCharterSliceReadinessWithMilestones(input.env);
  const engineeringGates = buildEra25EngineeringGatesUiSlice({
    readinessVisible: true,
    env: input.env,
  });

  return {
    policyId: ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    era25FirstCharterSliceReadinessMilestone: result.era25FirstCharterSliceReadinessMilestone,
    era25CharterExitMilestone: result.era25CharterExitMilestone,
    charterDocPath: result.evaluation.charterValidation.charterDocPath,
    sectionsValid: result.evaluation.charterValidation.sectionsValid,
    missingSectionCount: result.evaluation.charterValidation.missingSectionIds.length,
    requiredSectionCount: result.evaluation.requiredSectionCount,
    requiredSections: ERA25_CHARTER_REQUIRED_SECTIONS,
    engineeringPattern: ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN,
    guardrails: ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
    templateDoc: ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
    foreverCommands: ERA25_FIRST_CHARTER_SLICE_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
    postCharterExitOrchestratorCommand:
      "npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --write",
    syncReportCommand:
      "npm run ops:sync-era25-first-charter-slice-readiness-report -- --write",
    validateCharterExitCommand:
      "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_FIRST_CHARTER_SLICE_READINESS_PLATFORM_ANCHOR}`,
    engineeringGates,
  };
}

export function formatEra25FirstCharterSliceReadinessLabel(
  slice: Era25FirstCharterSliceReadinessUiSlice,
): string {
  const milestone = slice.era25FirstCharterSliceReadinessMilestone.replaceAll("_", " ");
  return `era25 first charter slice · ${milestone} · ${slice.missingSectionCount}/${slice.requiredSectionCount} sections missing`;
}
