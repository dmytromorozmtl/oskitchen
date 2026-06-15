#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
  ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH,
  ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import { evaluateEra25FirstCharterSliceReadinessWithMilestones } from "@/scripts/ops/validate-era25-first-charter-slice-readiness";

export function buildEra25FirstCharterSliceReadinessReportMarkdown(
  result: ReturnType<typeof evaluateEra25FirstCharterSliceReadinessWithMilestones>,
): string {
  const lines: string[] = [
    "# era25 First Charter Slice — Readiness Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Outside linear catalog** — charter section validation before era25 engineering.",
    "",
    "## Readiness status",
    "",
    `- Milestone: **${result.era25FirstCharterSliceReadinessMilestone}**`,
    `- era25 charter exit milestone: **${result.era25CharterExitMilestone}**`,
    `- Charter doc: **${result.evaluation.charterValidation.charterDocPath ?? "none"}**`,
    `- Sections valid: **${result.evaluation.charterValidation.sectionsValid ? "yes" : "no"}**`,
    `- Missing sections: **${result.evaluation.charterValidation.missingSectionIds.length}/${result.evaluation.requiredSectionCount}**`,
    `- Ready for charter exit smokes: **${result.readyForCharterExitSmokes ? "yes" : "no"}**`,
    `- Ready for charter section smokes: **${result.readyForCharterSectionSmokes ? "yes" : "no"}**`,
    "",
    "## Section checklist",
    "",
  ];

  for (const section of result.evaluation.charterValidation.sectionResults) {
    lines.push(`- [${section.present ? "x" : " "}] **${section.label}** (\`${section.sectionId}\`)`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of ERA25_FIRST_CHARTER_SLICE_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Template doc: [\`${ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC}\`](../${ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateEra25FirstCharterSliceReadinessWithMilestones();
  const markdown = buildEra25FirstCharterSliceReadinessReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH}`);
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
