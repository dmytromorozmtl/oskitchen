#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { MARKET_LEADER_POSITIONING_TRACKED_ENV_KEYS } from "@/lib/commercial/market-leader-positioning-phases-era21";

export const MARKET_LEADER_POSITIONING_ENV_TEMPLATE_PATH =
  ".env.staging.market-leader-positioning.template" as const;

function buildTemplate(): string {
  const lines = [
    "# Market leader positioning — safe template (Step 8, post Series A complete)",
    "# Prerequisite: npm run ops:validate-series-a-partner-expansion-env → seriesAComplete: true",
    "",
    "# Pillar 1 — Category narrative",
    "npm run smoke:pilot-case-study-draft",
    "export PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed",
    "export MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED=1",
    "",
    "# Pillar 2 — Competitive moat deck",
    "npm run smoke:pilot-rollback-drill",
    "npm run smoke:commerce-webhook-drill",
    "export PILOT_WEEK1_TTV_HOURS=6",
    "export PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass",
    "export MARKET_LEADER_MOAT_DECK_REVIEWED=1",
    "",
    "# Pillar 3 — Analyst / press kit",
    "npm run smoke:pilot-forbidden-claims-enforcement",
    "npm run smoke:investor-narrative-onepager",
    "export MARKET_LEADER_ANALYST_KIT_PUBLISHED=1",
    "",
    "# Pillar 4 — Expansion revenue motion",
    "export MARKET_LEADER_EXPANSION_MOTION_REVIEWED=1",
    "",
    "# Tracked keys:",
  ];
  for (const key of MARKET_LEADER_POSITIONING_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();
  if (write) {
    writeFileSync(join(process.cwd(), MARKET_LEADER_POSITIONING_ENV_TEMPLATE_PATH), content, "utf8");
    console.log(`Wrote ${MARKET_LEADER_POSITIONING_ENV_TEMPLATE_PATH}`);
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
