#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  ERA25_CHARTER_EXIT_GUARDRAILS,
  ERA25_CHARTER_EXIT_HUMAN_STEPS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
  ERA25_CHARTER_EXIT_REPORT_PATH,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import { evaluateEra25CharterExitOutsideLinearPathWithMilestones } from "@/scripts/ops/validate-era25-charter-exit-outside-linear-path";

export function buildEra25CharterExitOutsideLinearPathReportMarkdown(
  result: ReturnType<typeof evaluateEra25CharterExitOutsideLinearPathWithMilestones>,
): string {
  const lines: string[] = [
    "# era25+ Charter Exit — Outside Linear Path Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Outside linear catalog** — NOT Step 18 · human charter sign-off required.",
    "",
    "## Process status",
    "",
    `- era25 charter exit milestone: **${result.era25CharterExitMilestone}**`,
    `- Terminus guard milestone: **${result.evaluation.terminusGuard.linearChainTerminusGuardMilestone}**`,
    `- Guard passed: **${result.evaluation.terminusGuard.guard.guardPassed ? "yes" : "no"}**`,
    `- Charter checklist present: **${result.evaluation.charterChecklistPresent ? "yes" : "no"}**`,
    `- Signed charter present: **${result.evaluation.signedCharterPresent ? "yes" : "no"}**`,
    `- era25 charter docs: **${result.evaluation.era25CharterDocs.length}**`,
    `- Ready for terminus guard smokes: **${result.readyForTerminusGuardSmokes ? "yes" : "no"}**`,
    `- Ready for charter checklist smokes: **${result.readyForCharterChecklistSmokes ? "yes" : "no"}**`,
    "",
    "## Human steps",
    "",
  ];

  for (const step of ERA25_CHARTER_EXIT_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## era25 charter docs found");
  lines.push("");
  if (result.evaluation.era25CharterDocs.length === 0) {
    lines.push("- none — awaiting leadership sign-off and `docs/era25-*-charter-2026-*.md`");
  } else {
    for (const doc of result.evaluation.era25CharterDocs) {
      lines.push(`- [\`${doc}\`](../${doc})`);
    }
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of ERA25_CHARTER_EXIT_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Process doc: [\`${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC}\`](../${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC})`,
  );
  lines.push(`Checklist: [\`${ERA_CHARTER_READINESS_CHECKLIST_PATH}\`](../${ERA_CHARTER_READINESS_CHECKLIST_PATH})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateEra25CharterExitOutsideLinearPathWithMilestones();
  const markdown = buildEra25CharterExitOutsideLinearPathReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), ERA25_CHARTER_EXIT_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${ERA25_CHARTER_EXIT_REPORT_PATH}`);
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
