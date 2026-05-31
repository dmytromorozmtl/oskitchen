#!/usr/bin/env npx tsx
/**
 * Prints a safe .env.staging template for P0 ops vault (no secret values).
 * Policy: era17-p0-staging-proof-unblock-v1
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { P0_OPS_VAULT_PHASES } from "@/lib/commercial/p0-ops-vault-phases-era21";

function buildTemplate(): string {
  const lines: string[] = [
    "# OS Kitchen P0 ops vault template — NEVER commit real values",
    "# Policy: era17-p0-staging-proof-unblock-v1",
    "# Playbook: docs/p0-ops-vault-execution-playbook-2026-05-28.md",
    "",
  ];

  for (const phase of P0_OPS_VAULT_PHASES) {
    lines.push(`# ${phase.label}`);
    for (const key of phase.keys) {
      const catalog = P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG.find((e) => e.key === key);
      const hint = catalog ? ` (${catalog.configureIn})` : "";
      lines.push(`${key}=${hint}`);
    }
    lines.push("");
  }

  lines.push("# Optional — after P0 PASS, Tier 2 manual sign-off:");
  lines.push("# PILOT_GOLDEN_PATH_STAGING_URL=");
  lines.push("# PILOT_GOLDEN_PATH_OPERATOR_EMAIL=");
  lines.push("# PILOT_GOLDEN_PATH_ORDERS_MANUAL=PASSED");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const template = buildTemplate();
  const writePath = process.argv.includes("--write")
    ? join(process.cwd(), ".env.staging.p0.template")
    : null;

  if (writePath) {
    writeFileSync(writePath, template, "utf8");
    console.log(`Wrote ${writePath}`);
    console.log("Copy to local shell or GitHub Secrets — do not commit filled values.");
    return;
  }

  process.stdout.write(template);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
