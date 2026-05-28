#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH } from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20-policy";
import { COMMERCIAL_GO_CLOSURE_TRACKED_ENV_KEYS } from "@/lib/commercial/commercial-go-closure-phases-era21";

export const COMMERCIAL_GO_CLOSURE_ENV_TEMPLATE_PATH =
  ".env.staging.commercial-go.template" as const;

function buildTemplate(): string {
  const lines = [
    "# Commercial GO closure — safe template (Step 3, no real values)",
    "# Prerequisite: tier2ProofStatus: proof_passed",
    "",
    "# Phase 2 — ICP (export from filled prospect draft)",
    'export PILOT_GONOGO_ICP_INPUT_JSON="$(cat ' + ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH + ')"',
    "",
    "# Phase 3 — Sales / legal attestation (after review)",
    "export PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT=1",
    "export PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE=1",
    "",
    "# Phase 4 — Signed LOI (after signature only)",
    'export PILOT_GONOGO_CUSTOMER_NAME="REPLACE — legal entity name"',
    'export PILOT_GONOGO_LOI_SIGNED_DATE="YYYY-MM-DD"',
    "",
    "# Phase 5 — Orchestrator",
    "npm run smoke:pilot-forbidden-claims-enforcement",
    "npm run smoke:pilot-gono-go",
    "",
    "# Tracked keys:",
  ];
  for (const key of COMMERCIAL_GO_CLOSURE_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();
  if (write) {
    writeFileSync(join(process.cwd(), COMMERCIAL_GO_CLOSURE_ENV_TEMPLATE_PATH), content, "utf8");
    console.log(`Wrote ${COMMERCIAL_GO_CLOSURE_ENV_TEMPLATE_PATH}`);
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
