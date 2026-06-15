#!/usr/bin/env npx tsx
/**
 * Exports safe Tier 2 golden path env template (no secret values).
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS,
  TIER2_GOLDEN_PATH_MANUAL_ENV_KEYS,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";

export const TIER2_GOLDEN_PATH_ENV_TEMPLATE_PATH =
  ".env.staging.tier2.template" as const;

function buildTemplate(): string {
  const lines: string[] = [
    "# Tier 2 staging golden path — safe template (no real values)",
    `# Playbook: ${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC}`,
    "# Prerequisite: P0 proof_passed",
    "",
    "# Phase 2 — Manual golden path (set PASSED after staging execution)",
  ];

  for (const key of TIER2_GOLDEN_PATH_MANUAL_ENV_KEYS) {
    lines.push(`${key}=PASSED`);
  }

  lines.push("", "# Phase 3 — GitHub KDS Playwright evidence");
  lines.push("GITHUB_KDS_STAGING_RUN_URL=https://github.com/ORG/REPO/actions/runs/123456");
  lines.push("GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED");

  lines.push("", "# Phase 4 — Operator metadata");
  lines.push("PILOT_GOLDEN_PATH_STAGING_URL=https://YOUR-STAGING.example.com");
  lines.push("PILOT_GOLDEN_PATH_OPERATOR_EMAIL=owner@pilot.example.com");
  lines.push("PILOT_GOLDEN_PATH_COMMIT_SHA=abc123");
  lines.push("PILOT_GOLDEN_PATH_DURATION_MINUTES=45");
  lines.push("");
  lines.push(`# Tracked keys (${TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS.length} total):`);
  for (const key of TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();

  if (write) {
    const path = join(process.cwd(), TIER2_GOLDEN_PATH_ENV_TEMPLATE_PATH);
    writeFileSync(path, content, "utf8");
    console.log(`Wrote ${TIER2_GOLDEN_PATH_ENV_TEMPLATE_PATH}`);
  } else {
    console.log(content);
  }
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
