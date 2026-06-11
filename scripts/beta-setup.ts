/**
 * Beta program setup wizard — env file, validation, phased checklist.
 *
 *   npm run beta:setup
 *   npm run beta:setup -- --init     # copy .env.beta.local.example if missing
 *   npm run beta:setup -- --fix-env  # run env-check --all (exit 1 on fail)
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { renderSetupChecklist, buildSetupPhases } from "@/lib/beta-ops/setup-checklist";
import { computeProgramReadiness } from "@/lib/beta-ops/readiness";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { loadProgramState } from "@/lib/beta-ops/program-state";
import { resolveNextAction } from "@/lib/beta-ops/next-action";
import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { logger } from "@/lib/logger";

const ENV_BETA = join(process.cwd(), ".env.beta.local");
const ENV_EXAMPLE = join(process.cwd(), ".env.beta.local.example");
const ARTIFACTS = join(process.cwd(), "docs", "artifacts");

function runNpm(script: string, args: string[] = []): number {
  return (
    spawnSync("npm", ["run", script, "--", ...args], {
      stdio: "inherit",
      shell: process.platform === "win32",
    }).status ?? 1
  );
}

function main() {
  const init = process.argv.includes("--init");
  const fixEnv = process.argv.includes("--fix-env");

  if (init || !existsSync(ENV_BETA)) {
    if (!existsSync(ENV_EXAMPLE)) {
      console.error("Missing .env.beta.local.example");
      process.exit(1);
    }
    if (!existsSync(ENV_BETA)) {
      copyFileSync(ENV_EXAMPLE, ENV_BETA);
      logger.cli("Created .env.beta.local — edit values before continuing.\n");
    }
  }

  const loaded = loadBetaEnv();
  logger.cli("=== OS Kitchen Beta Setup ===\n");
  if (loaded.length) logger.cli(`Env loaded: ${loaded.join(", ")}\n`);

  if (fixEnv) {
    const code = runNpm("beta:env-check", ["--all"]);
    if (code !== 0) process.exit(code);
  }

  const state = loadProgramState();
  const readiness = computeProgramReadiness(state);
  const phases = buildSetupPhases(state);
  const next = resolveNextAction(state);

  logger.cli(`Readiness: ${readiness.score}/100`);
  for (const d of readiness.details) logger.cli(`  • ${d}`);
  logger.cli("");

  logger.cli("Phases:");
  for (const p of phases) {
    const icon = p.done ? "✓" : "○";
    logger.cli(`  ${icon} ${p.title}`);
    if (!p.done) logger.cli(`      → ${p.command}`);
    if (p.note && !p.done) logger.cli(`      (${p.note})`);
  }

  logger.cli("\n--- Recommended next ---");
  logger.cli(`  ${next.command}`);
  logger.cli(`  ${next.reason}\n`);

  mkdirSync(ARTIFACTS, { recursive: true });
  const checklistPath = join(ARTIFACTS, "BETA_SETUP_CHECKLIST.md");
  writeFileSync(checklistPath, renderSetupChecklist(state), "utf8");
  writeFileSync(
    join(ARTIFACTS, "BETA_SETUP_STATUS.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        readiness,
        phases: phases.map((p) => ({ id: p.id, title: p.title, done: p.done, command: p.command })),
        nextAction: next,
      },
      null,
      2,
    ),
    "utf8",
  );
  writeFileSync(join(ARTIFACTS, "BETA_EXECUTIVE_SUMMARY.md"), renderExecutiveSummary(state), "utf8");

  logger.cli(`Artifacts: ${checklistPath}`);
  logger.cli(`           docs/artifacts/BETA_SETUP_STATUS.json`);
  logger.cli("\nStart here: docs/BETA_START_HERE.md");
}

main();
