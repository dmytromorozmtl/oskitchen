#!/usr/bin/env npx tsx
/**
 * Sync P0 ops vault Day 0 progress report from artifact + local env (no secret values).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildP0VaultDay0OrchestratorSummary,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import {
  P0_OPS_VAULT_ERA21_DAY0_DOC,
  P0_OPS_VAULT_ERA21_PLAYBOOK_DOC,
} from "@/lib/commercial/p0-ops-vault-era21-policy";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { buildP0OpsVaultPhaseStatuses } from "@/lib/commercial/p0-ops-vault-phases-era21";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

export const P0_OPS_VAULT_PROGRESS_REPORT_PATH =
  "artifacts/p0-ops-vault-progress-report.md" as const;

export function buildP0OpsVaultProgressReportMarkdown(input: {
  artifact: {
    p0ProofStatus?: string;
    overall?: string;
    allMissingEnvVars?: string[];
    runAt?: string;
  } | null;
  localEnv: ReturnType<typeof evaluateP0VaultEnv>;
}): string {
  const artifactMissing = input.artifact?.allMissingEnvVars ?? [];
  const artifactPhases = buildP0OpsVaultPhaseStatuses({ missingEnvVars: artifactMissing });
  const localPhases = input.localEnv.phases;
  const day0Summary = buildP0VaultDay0OrchestratorSummary({
    env: input.localEnv,
    artifact: input.artifact,
    stagingHealth: {
      checked: false,
      ok: false,
      url: null,
      statusCode: null,
      error: "not checked in sync report",
    },
  });

  const lines: string[] = [
    "# P0 Ops Vault — Day 0 Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Day 0 milestone",
    "",
    `- milestone: **${day0Summary.milestone}**`,
    `- day0PartialComplete (Phase 1+2): ${day0Summary.day0PartialComplete ? "yes" : "no"}`,
    `- next phase: ${day0Summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Artifact state",
    "",
    `- Summary: \`${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT}\``,
    `- p0ProofStatus: **${input.artifact?.p0ProofStatus ?? "missing artifact"}**`,
    `- aggregate: ${input.artifact?.overall ?? "n/a"}`,
    `- artifact missing vars: ${artifactMissing.length}/11`,
    "",
    "## Local shell env (ops workstation)",
    "",
    `- present: ${input.localEnv.present.length}/11`,
    `- allPresent: ${input.localEnv.allPresent ? "yes" : "no"}`,
    "",
    "## Phase checklist (artifact-driven — product UI uses same phases)",
    "",
  ];

  for (const phase of artifactPhases) {
    lines.push(`### ${phase.complete ? "✅" : "⬜"} ${phase.label}`);
    if (phase.missingKeys.length > 0) {
      lines.push("");
      lines.push("Missing GitHub Secrets / env:");
      for (const key of phase.missingKeys) {
        lines.push(`- \`${key}\``);
      }
    } else {
      lines.push("");
      lines.push("All vars for this phase present in artifact.");
    }
    lines.push("");
  }

  lines.push("## Local env phase delta");
  lines.push("");
  for (const phase of localPhases) {
    const marker = phase.complete ? "✅" : "⬜";
    lines.push(`- ${marker} ${phase.label} (${phase.present.length}/${phase.keys.length} in shell)`);
  }

  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:run-p0-vault-day0-orchestrator -- --write");
  lines.push("npm run ops:export-p0-vault-env-template -- --write");
  lines.push("npm run ops:validate-p0-vault-env");
  lines.push("npm run ops:check-p0-staging-health");
  lines.push("npm run ops:print-p0-github-secrets-checklist");
  lines.push("npm run smoke:p0-staging-proof-unblock");
  lines.push("```");
  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- `/dashboard/integration-health` — P0 phased panel");
  lines.push("- `/dashboard/today` — Owner Briefing top action + compact ops vault");
  lines.push("- `/dashboard/launch-wizard` — commercial blockers + Tier 2 (blocked until P0 PASS)");
  lines.push("");
  lines.push(`Playbook: [\`${P0_OPS_VAULT_ERA21_PLAYBOOK_DOC}\`](../${P0_OPS_VAULT_ERA21_PLAYBOOK_DOC})`);
  lines.push(`Day 0: [\`${P0_OPS_VAULT_ERA21_DAY0_DOC}\`](../${P0_OPS_VAULT_ERA21_DAY0_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function loadArtifact(): Record<string, unknown> | null {
  const path = join(process.cwd(), P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function main() {
  const write = process.argv.includes("--write");
  const artifact = loadArtifact();
  const localEnv = evaluateP0VaultEnv();
  const markdown = buildP0OpsVaultProgressReportMarkdown({
    artifact: artifact as {
      p0ProofStatus?: string;
      overall?: string;
      allMissingEnvVars?: string[];
      runAt?: string;
    } | null,
    localEnv,
  });

  if (write) {
    const outPath = join(process.cwd(), P0_OPS_VAULT_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${P0_OPS_VAULT_PROGRESS_REPORT_PATH}`);
  } else {
    console.log(markdown);
  }
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
