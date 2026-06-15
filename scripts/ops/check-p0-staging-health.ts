#!/usr/bin/env npx tsx
/**
 * Checks staging /api/health using E2E_STAGING_BASE_URL (no secret values printed).
 */
import {
  checkP0StagingHealth,
  P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";

export { checkP0StagingHealth };

async function main() {
  const jsonOutput = process.argv.includes("--json");
  const baseUrl = process.env.E2E_STAGING_BASE_URL;
  const result = await checkP0StagingHealth(baseUrl);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID,
          ...result,
        },
        null,
        2,
      ),
    );
    process.exit(result.checked && result.ok ? 0 : 1);
  }

  console.log(`\nP0 staging health (${P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID})\n`);

  if (!result.checked) {
    console.log("SKIPPED — set E2E_STAGING_BASE_URL in ops shell or GitHub Secrets.\n");
    process.exit(1);
  }

  if (result.ok) {
    console.log(`PASS — ${result.url} (${result.statusCode})\n`);
    process.exit(0);
  }

  console.log(`FAIL — ${result.url ?? "unknown URL"}`);
  console.log(`Error: ${result.error ?? "unknown"}\n`);
  process.exit(1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  void main();
}
