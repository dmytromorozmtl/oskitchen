#!/usr/bin/env npx tsx
/**
 * Exports P0 ops vault Day 0 readiness checklist (honest env + artifact state).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildP0VaultDay0OrchestratorSummary,
  buildP0VaultDay0ReadinessChecklistMarkdown,
  checkP0StagingHealth,
  loadP0StagingProofArtifact,
  P0_OPS_VAULT_DAY0_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

export { buildP0VaultDay0ReadinessChecklistMarkdown };

async function main() {
  const write = process.argv.includes("--write");
  const env = evaluateP0VaultEnv();
  const artifact = loadP0StagingProofArtifact();
  const stagingHealth = await checkP0StagingHealth(process.env.E2E_STAGING_BASE_URL);
  const summary = buildP0VaultDay0OrchestratorSummary({ env, artifact, stagingHealth });
  const markdown = buildP0VaultDay0ReadinessChecklistMarkdown({ summary, env });

  if (write) {
    const outPath = join(process.cwd(), P0_OPS_VAULT_DAY0_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${P0_OPS_VAULT_DAY0_READINESS_CHECKLIST_PATH}`);
    return;
  }

  console.log(markdown);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  void main();
}
