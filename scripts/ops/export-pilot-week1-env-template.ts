#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { PILOT_WEEK1_TRACKED_ENV_KEYS } from "@/lib/commercial/pilot-week1-execution-phases-era21";

export const PILOT_WEEK1_ENV_TEMPLATE_PATH = ".env.staging.pilot-week1.template" as const;

function buildTemplate(): string {
  const lines = [
    "# Pilot Week 1 — safe template (Step 4, post-GO decision)",
    "# Prerequisite: artifacts/pilot-gono-go-summary.json → decision: GO",
    "",
    "# Day 1 — TTV + first order (after real onboarding)",
    'export PILOT_WEEK1_TTV_HOURS="8.5"',
    'export PILOT_WEEK1_FIRST_ORDER_ID="ord_REPLACE_WITH_REAL_ID"',
    "",
    "# Day 2 — Integration Health owner review",
    "export PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED=1",
    "",
    "# Day 3 — POS shift closeout drill",
    "export PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass",
    "",
    "# Day 4 — Reports weekly export attestation",
    "export PILOT_WEEK1_REPORTS_WEEKLY_EXPORT=1",
    "",
    "# Day 5 — Orchestrator smokes (real KPIs required)",
    "npm run smoke:pilot-metrics-baseline",
    "npm run smoke:pilot-case-study-draft",
    "npm run smoke:pilot-gono-go",
    "",
    "# Tracked keys:",
  ];
  for (const key of PILOT_WEEK1_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();
  if (write) {
    writeFileSync(join(process.cwd(), PILOT_WEEK1_ENV_TEMPLATE_PATH), content, "utf8");
    console.log(`Wrote ${PILOT_WEEK1_ENV_TEMPLATE_PATH}`);
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
