#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import { evaluateEra25FirstProductSliceBlueprintWithMilestones } from "@/scripts/ops/validate-era25-first-product-slice-blueprint";

export function buildEra25FirstProductSliceBlueprintReportMarkdown(
  result: ReturnType<typeof evaluateEra25FirstProductSliceBlueprintWithMilestones>,
): string {
  const lines: string[] = [
    "# era25 First Product Slice Blueprint Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Blueprint orchestration** — era25 product engineering blocked until blueprint ready.",
    "",
    "## Blueprint status",
    "",
    `- Blueprint milestone: **${result.era25FirstProductSliceBlueprintMilestone}**`,
    `- Gates milestone: **${result.evaluation.gates.era25EngineeringGatesMilestone}**`,
    `- Canonical slice: **${ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME}**`,
    `- Blueprint blocked: **${result.evaluation.blueprintBlocked ? "yes" : "no"}**`,
    `- Gates blocked: **${result.evaluation.gates.gatesBlocked ? "yes" : "no"}**`,
    `- Canonical charter doc: **${result.evaluation.canonicalCharterDocPath ?? "missing"}**`,
    `- Charter sections valid: **${result.evaluation.charterSectionsValid ? "yes" : "no"}**`,
    `- Staging checklist present: **${result.evaluation.stagingChecklist.checklistPresent ? "yes" : "no"}**`,
    `- Staging checklist sections valid: **${result.evaluation.stagingChecklist.sectionsValid ? "yes" : "no"}**`,
    `- Illegal era25 artifacts: **${result.evaluation.illegalArtifacts.length}**`,
    `- Ready for engineering gates smokes: **${result.readyForEngineeringGatesSmokes ? "yes" : "no"}**`,
    `- Ready for charter section smokes: **${result.readyForCharterSectionSmokes ? "yes" : "no"}**`,
    `- Ready for staging checklist smokes: **${result.readyForStagingChecklistSmokes ? "yes" : "no"}**`,
    `- Ready for premature product smokes: **${result.readyForPrematureProductSmokes ? "yes" : "no"}**`,
    "",
    "## Human steps",
    "",
  ];

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
  lines.push(
    `Blueprint doc: [\`${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC}\`](../${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateEra25FirstProductSliceBlueprintWithMilestones();
  const markdown = buildEra25FirstProductSliceBlueprintReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH}`);
  } else {
    console.log(markdown);
  }
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
