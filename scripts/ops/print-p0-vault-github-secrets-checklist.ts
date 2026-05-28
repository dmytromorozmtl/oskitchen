#!/usr/bin/env npx tsx
/**
 * Prints GitHub Secrets setup checklist from P0 artifact (no secret values).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { buildP0OpsVaultPhaseStatuses } from "@/lib/commercial/p0-ops-vault-phases-era21";

function main() {
  const path = join(process.cwd(), P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) {
    console.error(`Missing ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT}`);
    console.error("Run: npm run smoke:p0-staging-proof-unblock -- --checklist-only");
    process.exit(1);
  }

  const parsed = JSON.parse(readFileSync(path, "utf8")) as {
    p0ProofStatus?: string;
    allMissingEnvVars?: string[];
  };

  const missing = parsed.allMissingEnvVars ?? [];
  const phases = buildP0OpsVaultPhaseStatuses({ missingEnvVars: missing });

  console.log("\nGitHub Actions Secrets checklist (P0 ops vault)\n");
  console.log(`Status: ${parsed.p0ProofStatus ?? "unknown"}`);
  console.log(`Missing vars: ${missing.length}\n`);

  for (const phase of phases) {
    console.log(`${phase.complete ? "[DONE]" : "[TODO]"} ${phase.label}`);
    for (const key of phase.missingKeys) {
      console.log(`  → Add secret: ${key}`);
    }
    if (phase.missingKeys.length === 0) {
      console.log("  → All vars for this phase present");
    }
    console.log("");
  }

  console.log("GitHub path: Repository → Settings → Secrets and variables → Actions → New repository secret");
  console.log("Local validation: npm run ops:validate-p0-vault-env");
  console.log("Playbook: docs/p0-ops-vault-execution-playbook-2026-05-28.md\n");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
