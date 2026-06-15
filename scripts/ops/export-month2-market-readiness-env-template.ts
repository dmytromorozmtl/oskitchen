#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS } from "@/lib/commercial/month2-market-readiness-phases-era21";

const PILOT_CASE_STUDY_VALID_APPROVAL_VALUES = ["signed", "anonymized_signed"] as const;

export const MONTH2_MARKET_READINESS_ENV_TEMPLATE_PATH =
  ".env.staging.month2-market-readiness.template" as const;

function buildTemplate(): string {
  const approvalValues = PILOT_CASE_STUDY_VALID_APPROVAL_VALUES.join("|");
  const lines = [
    "# Month 2 market readiness — safe template (Step 5, post Week 1 complete)",
    "# Prerequisite: npm run ops:validate-pilot-week1-env → week1Complete: true",
    "",
    "# Workstream A — Investor one-pager (after metrics PASSED + smoke)",
    "npm run smoke:investor-narrative-onepager",
    "export MONTH2_INVESTOR_FOUNDER_SIGNOFF=1",
    "",
    "# Workstream B — GTM ICP landing review",
    "npm run smoke:pilot-forbidden-claims-enforcement",
    "export MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED=1",
    "export MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED=1",
    "",
    "# Workstream C — Public API rate limits (optional P2)",
    "export MONTH2_API_RATE_LIMITS_DOC_REVIEWED=1",
    "",
    "# Workstream D — Case study publish (written permission required)",
    `export PILOT_CASE_STUDY_CUSTOMER_APPROVAL="${approvalValues.split("|")[0]}"`,
    "npm run smoke:pilot-case-study-draft",
    "",
    "# Workstream E — Second pilot pipeline (optional)",
    "export MONTH2_SECOND_PROSPECT_QUEUED=1",
    "# or: export MONTH2_SECOND_PROSPECT_SKIPPED=1",
    "",
    "# Tracked keys:",
  ];
  for (const key of MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();
  if (write) {
    writeFileSync(join(process.cwd(), MONTH2_MARKET_READINESS_ENV_TEMPLATE_PATH), content, "utf8");
    console.log(`Wrote ${MONTH2_MARKET_READINESS_ENV_TEMPLATE_PATH}`);
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
