#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  ERA25_ENGINEERING_GATES_GUARDRAILS,
  ERA25_ENGINEERING_GATES_HUMAN_STEPS,
  ERA25_ENGINEERING_GATES_REPORT_PATH,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import { evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones } from "@/scripts/ops/validate-era25-engineering-gates-require-signed-charter";

export function buildEra25EngineeringGatesRequireSignedCharterReportMarkdown(
  result: ReturnType<typeof evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Engineering Gates — Require Signed Charter Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Gate enforcement** — era25 product engineering blocked until readiness healthy.",
    "",
    "## Gate status",
    "",
    `- Gates milestone: **${result.era25EngineeringGatesMilestone}**`,
    `- Readiness milestone: **${result.evaluation.readiness.era25FirstCharterSliceReadinessMilestone}**`,
    `- Gates blocked: **${result.evaluation.gatesBlocked ? "yes" : "no"}**`,
    `- Terminus guard passed: **${result.evaluation.terminusGuardPassed ? "yes" : "no"}**`,
    `- Illegal era25 artifacts: **${result.evaluation.illegalArtifacts.length}**`,
    `- Ready for charter readiness smokes: **${result.readyForCharterReadinessSmokes ? "yes" : "no"}**`,
    `- Ready for illegal artifact smokes: **${result.readyForIllegalArtifactSmokes ? "yes" : "no"}**`,
    "",
    "## Illegal artifacts",
    "",
  ];

  if (result.evaluation.illegalArtifacts.length === 0) {
    lines.push("- none detected");
  } else {
    for (const artifact of result.evaluation.illegalArtifacts) {
      lines.push(`- \`${artifact.path}\` — ${artifact.reason}`);
    }
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of ERA25_ENGINEERING_GATES_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of ERA25_ENGINEERING_GATES_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Gates doc: [\`${ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC}\`](../${ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones();
  const markdown = buildEra25EngineeringGatesRequireSignedCharterReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), ERA25_ENGINEERING_GATES_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${ERA25_ENGINEERING_GATES_REPORT_PATH}`);
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
