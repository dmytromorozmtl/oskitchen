/**
 * era25 first product slice blueprint post-gates orchestrator — blueprint readiness milestones.
 * Policy: era24-era25-first-product-slice-blueprint-post-gates-orchestrator-v1
 */
import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_FOREVER_COMMANDS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PLATFORM_ANCHOR,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH,
  ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
  ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX,
  ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES,
  ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import {
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import { ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC } from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateEra25FirstProductSliceBlueprint } from "@/lib/commercial/evaluate-era25-first-product-slice-blueprint";

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-era25-first-product-slice-blueprint-post-gates-orchestrator-v1" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_COMMAND =
  "npm run ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator" as const;

export type Era25FirstProductSliceBlueprintMilestone =
  | "engineering_gates_blocked"
  | "awaiting_canonical_charter_doc"
  | "attention_charter_sections_for_slice"
  | "attention_staging_checklist_gaps"
  | "attention_premature_era25_product"
  | "era25_first_product_slice_blueprint_ready";

export type Era25FirstProductSliceBlueprintPostGatesOrchestratorSummary = {
  policyId: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: Era25FirstProductSliceBlueprintMilestone;
  era25EngineeringGatesMilestone: Era25EngineeringGatesMilestone;
  blueprintBlocked: boolean;
  gatesBlocked: boolean;
  canonicalSliceName: typeof ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME;
  canonicalCharterDocPath: string | null;
  charterSectionsValid: boolean;
  stagingChecklistPresent: boolean;
  stagingChecklistSectionsValid: boolean;
  illegalArtifactCount: number;
  readyForEngineeringGatesSmokes: boolean;
  readyForCharterSectionSmokes: boolean;
  readyForStagingChecklistSmokes: boolean;
  readyForPrematureProductSmokes: boolean;
  blueprintReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const GATES_BLOCKED_MILESTONES: readonly Era25EngineeringGatesMilestone[] = [
  "charter_readiness_blocked",
  "awaiting_human_charter_signoff",
  "attention_illegal_era25_artifacts",
] as const;

export function resolveEra25FirstProductSliceBlueprintMilestone(input: {
  era25EngineeringGatesMilestone: Era25EngineeringGatesMilestone;
  gatesBlocked: boolean;
  illegalArtifactCount: number;
  canonicalCharterDocPath: string | null;
  charterSectionsValid: boolean;
  stagingChecklistSectionsValid: boolean;
}): Era25FirstProductSliceBlueprintMilestone {
  if (
    input.gatesBlocked ||
    input.era25EngineeringGatesMilestone !== "era25_engineering_gates_open"
  ) {
    return "engineering_gates_blocked";
  }

  if (input.illegalArtifactCount > 0) {
    return "attention_premature_era25_product";
  }

  if (!input.canonicalCharterDocPath) {
    return "awaiting_canonical_charter_doc";
  }

  if (!input.charterSectionsValid) {
    return "attention_charter_sections_for_slice";
  }

  if (!input.stagingChecklistSectionsValid) {
    return "attention_staging_checklist_gaps";
  }

  return "era25_first_product_slice_blueprint_ready";
}

export function buildEra25FirstProductSliceBlueprintPostGatesOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateEra25FirstProductSliceBlueprint>;
  artifacts: { blueprintReportPresent: boolean };
}): Era25FirstProductSliceBlueprintPostGatesOrchestratorSummary {
  const milestone = resolveEra25FirstProductSliceBlueprintMilestone({
    era25EngineeringGatesMilestone: input.evaluation.gates.era25EngineeringGatesMilestone,
    gatesBlocked: input.evaluation.gates.gatesBlocked,
    illegalArtifactCount: input.evaluation.illegalArtifacts.length,
    canonicalCharterDocPath: input.evaluation.canonicalCharterDocPath,
    charterSectionsValid: input.evaluation.charterSectionsValid,
    stagingChecklistSectionsValid: input.evaluation.stagingChecklist.sectionsValid,
  });

  const readyForEngineeringGatesSmokes = GATES_BLOCKED_MILESTONES.includes(
    input.evaluation.gates.era25EngineeringGatesMilestone,
  );
  const readyForCharterSectionSmokes =
    input.evaluation.canonicalCharterDocPath !== null && !input.evaluation.charterSectionsValid;
  const readyForStagingChecklistSmokes =
    input.evaluation.stagingChecklist.checklistPresent &&
    !input.evaluation.stagingChecklist.sectionsValid;
  const readyForPrematureProductSmokes = input.evaluation.illegalArtifacts.length > 0;

  const recommendedCommands =
    milestone === "engineering_gates_blocked"
      ? ([
          "npm run ops:run-era25-engineering-gates-post-readiness-orchestrator -- --write",
          "npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json",
          "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
        ] as const)
      : ([
          "npm run ops:validate-era25-first-product-slice-blueprint -- --json",
          ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_COMMAND + " -- --write",
          "npm run ops:sync-era25-first-product-slice-blueprint-report -- --write",
          ...(milestone === "awaiting_canonical_charter_doc"
            ? ([
                `Write ${ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX}*.md with all 10 sections`,
                "npm run ops:export-era-charter-readiness-checklist -- --write",
              ] as const)
            : ([] as const)),
          ...(milestone === "attention_staging_checklist_gaps"
            ? ([
                `Complete ${ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC}`,
                "npm run smoke:p0-staging-proof-unblock -- --checklist-only",
              ] as const)
            : ([] as const)),
          ...(milestone === "era25_first_product_slice_blueprint_ready"
            ? ([
                `Begin era25 product slice ${ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME} on ${input.evaluation.productPlatformAnchor}`,
                `See ${ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC}`,
              ] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    era25EngineeringGatesMilestone: input.evaluation.gates.era25EngineeringGatesMilestone,
    blueprintBlocked: input.evaluation.blueprintBlocked,
    gatesBlocked: input.evaluation.gates.gatesBlocked,
    canonicalSliceName: input.evaluation.canonicalSliceName,
    canonicalCharterDocPath: input.evaluation.canonicalCharterDocPath,
    charterSectionsValid: input.evaluation.charterSectionsValid,
    stagingChecklistPresent: input.evaluation.stagingChecklist.checklistPresent,
    stagingChecklistSectionsValid: input.evaluation.stagingChecklist.sectionsValid,
    illegalArtifactCount: input.evaluation.illegalArtifacts.length,
    readyForEngineeringGatesSmokes,
    readyForCharterSectionSmokes,
    readyForStagingChecklistSmokes,
    readyForPrematureProductSmokes,
    blueprintReportPresent: input.artifacts.blueprintReportPresent,
    recommendedCommands,
  };
}

export function buildEra25FirstProductSliceBlueprintOrchestratorReportMarkdown(input: {
  summary: Era25FirstProductSliceBlueprintPostGatesOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateEra25FirstProductSliceBlueprint>;
}): string {
  const lines: string[] = [
    "# era25 First Product Slice Blueprint — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Blueprint orchestration only** — era25 product engineering blocked until blueprint ready.",
    "",
    `Policy: \`${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Gates milestone: ${input.summary.era25EngineeringGatesMilestone}`,
    `- Canonical slice: **${input.summary.canonicalSliceName}**`,
    `- Blueprint blocked: ${input.summary.blueprintBlocked ? "yes" : "no"}`,
    `- Gates blocked: ${input.summary.gatesBlocked ? "yes" : "no"}`,
    `- Canonical charter doc: ${input.summary.canonicalCharterDocPath ?? "missing"}`,
    `- Charter sections valid: ${input.summary.charterSectionsValid ? "yes" : "no"}`,
    `- Staging checklist present: ${input.summary.stagingChecklistPresent ? "yes" : "no"}`,
    `- Staging checklist sections valid: ${input.summary.stagingChecklistSectionsValid ? "yes" : "no"}`,
    `- Illegal era25 artifacts: ${input.summary.illegalArtifactCount}`,
    "",
    "## Engineering deliverables (when blueprint ready)",
    "",
  ];

  for (const deliverable of ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES) {
    lines.push(`- **${deliverable.label}** — e.g. ${deliverable.example}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Blueprint report: \`${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH}\``);
  lines.push(
    `Blueprint doc: [\`${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC}\`](../${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC})`,
  );
  lines.push(
    `Gates doc: [\`${ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC}\`](../${ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC})`,
  );
  lines.push(
    `Product slice preview: [\`${ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC}\`](../${ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PLATFORM_ANCHOR}\``,
  );
  lines.push("");

  return lines.join("\n");
}
