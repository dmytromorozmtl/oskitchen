#!/usr/bin/env npx tsx
/**
 * Sync Tier 2 golden path progress report from artifacts + local env.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC } from "@/lib/commercial/tier2-staging-golden-path-era21-policy";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import {
  evaluateTier2GoldenPathEnv,
  readTier2GoldenPathArtifacts,
} from "@/scripts/ops/validate-tier2-golden-path-env";

export const TIER2_GOLDEN_PATH_PROGRESS_REPORT_PATH =
  "artifacts/tier2-golden-path-progress-report.md" as const;

export function buildTier2GoldenPathProgressReportMarkdown(
  result: ReturnType<typeof evaluateTier2GoldenPathEnv>,
): string {
  const lines: string[] = [
    "# Tier 2 Golden Path — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Milestone",
    "",
    `- tier2Milestone: **${result.tier2Milestone}**`,
    "",
    "## Gate status",
    "",
    `- P0: **${result.p0ProofStatus ?? "missing"}** (${result.p0GatePassed ? "unlocked" : "blocked"})`,
    `- Tier 2 artifact: **${result.tier2ProofStatus ?? "missing"}**`,
    `- Env vars in shell: ${result.present.length}/${result.missing.length + result.present.length} tracked`,
    "",
    "## Phase checklist",
    "",
  ];

  for (const phase of result.phases) {
    lines.push(`### ${phase.complete ? "✅" : "⬜"} ${phase.label}`);
    lines.push("");
    lines.push(phase.detail);
    if (phase.routes.length > 0) {
      lines.push("");
      lines.push(`Routes: ${phase.routes.map((r) => `\`${r}\``).join(", ")}`);
    }
    lines.push("");
  }

  lines.push("## Manual sign-off env vars");
  lines.push("");
  if (result.missing.length === 0) {
    lines.push("All tracked env vars present in local shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write");
  lines.push("npm run ops:validate-tier2-golden-path-env -- --json");
  lines.push("npm run smoke:tier2-staging-golden-path -- --checklist-only");
  lines.push("npm run smoke:tier2-staging-golden-path");
  lines.push("```");
  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- `/dashboard/launch-wizard` — Tier 2 panel + commercial blockers");
  lines.push("- `/dashboard/today` — Tier 2 top action (when P0 PASS)");
  lines.push("- `/dashboard/integration-health` — Tier 2 golden path banner");
  lines.push("");
  lines.push(`Artifact: \`${TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT}\``);
  lines.push(`Playbook: [\`${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC}\`](../${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC})`);
  lines.push(`Step 2 doc: [\`${TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC}\`](../${TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  readTier2GoldenPathArtifacts();
  const result = evaluateTier2GoldenPathEnv();
  const markdown = buildTier2GoldenPathProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), TIER2_GOLDEN_PATH_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${TIER2_GOLDEN_PATH_PROGRESS_REPORT_PATH}`);
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
