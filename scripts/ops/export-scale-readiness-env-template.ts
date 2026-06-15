#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { SCALE_READINESS_TRACKED_ENV_KEYS } from "@/lib/commercial/scale-readiness-phases-era21";

export const SCALE_READINESS_ENV_TEMPLATE_PATH = ".env.staging.scale-readiness.template" as const;

function buildTemplate(): string {
  const lines = [
    "# Scale readiness — safe template (Step 6, post Month 2 complete)",
    "# Prerequisite: npm run ops:validate-month2-market-readiness-env → month2Complete: true",
    "",
    "# Gate 1 — Per-customer GO isolation",
    "export SCALE_PER_CUSTOMER_GO_ISOLATION=1",
    "",
    "# Gate 2 — SOC2 readiness track (no false certification claims)",
    "export SCALE_SOC2_READINESS_TRACK_REVIEWED=1",
    "",
    "# Gate 3 — Enterprise SSO production (or honest deferral)",
    "export SCALE_SSO_PRODUCTION_STATUS=pass",
    "# export SCALE_SSO_PRODUCTION_STATUS=deferred_honest",
    "# export SCALE_SSO_PRODUCTION_DEFERRED_REASON=\"Production IdP cutover scheduled Q3 — staging PASS recorded\"",
    "",
    "# Gate 4 — Resilience drills",
    "npm run smoke:pilot-rollback-drill",
    "npm run smoke:commerce-webhook-drill",
    "export SCALE_RESILIENCE_DRILLS_ATTESTED=1",
    "",
    "# Gate 5 — Data room artifact chain",
    "export SCALE_DATA_ROOM_INDEX_PUBLISHED=1",
    "",
    "# Gate 6 — Second paid pilot (optional)",
    "export SCALE_SECOND_PAID_PILOT_QUEUED=1",
    "# or: export SCALE_SECOND_PAID_PILOT_SKIPPED=1",
    "",
    "# Tracked keys:",
  ];
  for (const key of SCALE_READINESS_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();
  if (write) {
    writeFileSync(join(process.cwd(), SCALE_READINESS_ENV_TEMPLATE_PATH), content, "utf8");
    console.log(`Wrote ${SCALE_READINESS_ENV_TEMPLATE_PATH}`);
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
