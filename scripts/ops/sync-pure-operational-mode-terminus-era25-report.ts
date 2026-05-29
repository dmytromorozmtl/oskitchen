#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_PATH,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
} from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { evaluatePureOperationalModeTerminusEra25WithMilestones } from "@/scripts/ops/validate-pure-operational-mode-terminus-era25";

export function buildPureOperationalModeTerminusEra25ReportMarkdown(
  result: ReturnType<typeof evaluatePureOperationalModeTerminusEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Pure Operational Mode Terminus Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Final era25 slice** — informational improvement loop only; no new env attestation keys.",
    "",
    "## Terminus status",
    "",
    `- Milestone: **${result.pureOperationalModeTerminusEra25Milestone}**`,
    `- Sustained ops convergence milestone: **${result.evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone}**`,
    `- Terminus blocked: **${result.evaluation.terminusBlocked ? "yes" : "no"}**`,
    `- Pure operational mode era25 active: **${result.evaluation.pureOperationalModeEra25Active ? "yes" : "no"}**`,
    `- Track health: **${result.evaluation.terminusState.healthyCount}/${result.evaluation.terminusState.tracks.length} fresh**`,
    `- Overdue / due soon: **${result.evaluation.terminusState.overdueCount} / ${result.evaluation.terminusState.dueSoonCount}**`,
    `- Next attention: **${result.evaluation.terminusState.nextAttentionTrackLabel ?? "none"}**`,
    "",
    "## Improvement loop tracks",
    "",
  ];

  for (const track of result.evaluation.terminusState.tracks) {
    lines.push(
      `- [${track.status === "healthy" ? "x" : " "}] **${track.label}** (${track.frequency}) — ${track.status}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Terminus doc: [\`${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC}\`](../${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluatePureOperationalModeTerminusEra25WithMilestones();
  const markdown = buildPureOperationalModeTerminusEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_PATH}`);
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
