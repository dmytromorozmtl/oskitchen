#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import { evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones } from "@/scripts/ops/validate-owner-daily-briefing-breakthrough-era25";

export function buildOwnerDailyBriefingBreakthroughEra25ReportMarkdown(
  result: ReturnType<typeof evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Owner Daily Briefing Breakthrough Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **First era25 product slice** — breakthrough briefing on Today.",
    "",
    "## Product slice status",
    "",
    `- Milestone: **${result.ownerDailyBriefingBreakthroughEra25Milestone}**`,
    `- Blueprint milestone: **${result.evaluation.blueprint.era25FirstProductSliceBlueprintMilestone}**`,
    `- Slice blocked: **${result.evaluation.sliceBlocked ? "yes" : "no"}**`,
    `- P0 proof status: **${result.evaluation.p0ProofStatus}**`,
    `- Briefing tiles wired: **${result.evaluation.wiredBriefingTileCount}/${result.evaluation.briefingSchemeCount}**`,
    `- Ready for blueprint regression smokes: **${result.readyForBlueprintRegressionSmokes ? "yes" : "no"}**`,
    `- Ready for staging proof smokes: **${result.readyForStagingProofSmokes ? "yes" : "no"}**`,
    `- Ready for briefing gap smokes: **${result.readyForBriefingGapSmokes ? "yes" : "no"}**`,
    "",
    "## Briefing tiles B0–B4",
    "",
  ];

  for (const tile of result.evaluation.briefingTiles) {
    lines.push(
      `- **${tile.schemeId}** ${tile.label} — ${tile.wired ? "wired" : "gap"} · ${tile.headline}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Product doc: [\`${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC}\`](../${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones();
  const markdown = buildOwnerDailyBriefingBreakthroughEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH}`);
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
