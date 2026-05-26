/**
 * Run named operational phases (A–F) from BETA_START_HERE.
 *
 *   npm run beta:run-phase -- --phase=A
 *   npm run beta:run-phase -- --list
 */
import { spawnSync } from "node:child_process";

import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";

type Phase = {
  id: string;
  title: string;
  command: string[];
  note: string;
};

const PHASES: Phase[] = [
  {
    id: "A",
    title: "Setup — env file + validation",
    command: ["npm", "run", "beta:setup", "--", "--init"],
    note: "Then edit .env.beta.local and: npm run beta:setup -- --fix-env",
  },
  {
    id: "B",
    title: "Staging prep (on staging host)",
    command: ["npm", "run", "beta:staging-prep"],
    note: "Requires DATABASE_URL on staging",
  },
  {
    id: "C",
    title: "Day 1 complete",
    command: ["npm", "run", "beta:preflight"],
    note: "Then: npm run beta:day1-complete",
  },
  {
    id: "D",
    title: "Go live cohort",
    command: ["npm", "run", "beta:go-live"],
    note: "Pass --emails= or set BETA_COHORT_EMAILS",
  },
  {
    id: "E",
    title: "Week 1 daily ops",
    command: ["npm", "run", "beta:support-setup"],
    note: "Then daily: npm run beta:daily-ops",
  },
  {
    id: "F",
    title: "Track program",
    command: ["npm", "run", "beta:program"],
    note: "Or: npm run beta:program -- --next",
  },
];

function run(args: string[]): number {
  console.log(`\n>>> ${args.join(" ")}\n`);
  return spawnSync(args[0]!, args.slice(1), {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  }).status ?? 1;
}

function main() {
  loadBetaEnv();

  if (process.argv.includes("--list")) {
    console.log("Phases:\n");
    for (const p of PHASES) {
      console.log(`  ${p.id}) ${p.title}`);
      console.log(`     ${p.command.join(" ")}`);
      console.log(`     ${p.note}\n`);
    }
    return;
  }

  const phaseId = process.argv.find((a) => a.startsWith("--phase="))?.split("=")[1]?.toUpperCase();
  if (!phaseId) {
    console.error("Usage: npm run beta:run-phase -- --phase=A  |  --list");
    process.exit(1);
  }

  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) {
    console.error(`Unknown phase ${phaseId}. Use --list`);
    process.exit(1);
  }

  console.log(`=== Phase ${phase.id}: ${phase.title} ===\n${phase.note}\n`);

  if (phaseId === "A") {
    if (run(["npm", "run", "beta:setup", "--", "--init"]) !== 0) process.exit(1);
    console.log("\n→ Edit .env.beta.local then run: npm run beta:setup -- --fix-env");
    return;
  }

  if (phaseId === "C") {
    if (run(["npm", "run", "beta:preflight"]) !== 0) process.exit(1);
    if (run(["npm", "run", "beta:day1-complete"]) !== 0) process.exit(1);
    return;
  }

  if (phaseId === "D") {
    const emails = process.env.BETA_COHORT_EMAILS;
    const args = emails
      ? ["npm", "run", "beta:go-live", "--", `--emails=${emails}`]
      : ["npm", "run", "beta:go-live"];
    if (!emails) console.warn("WARN: set BETA_COHORT_EMAILS or pass --emails=\n");
    process.exit(run(args));
  }

  if (phaseId === "E") {
    if (run(["npm", "run", "beta:support-setup"]) !== 0) process.exit(1);
    process.exit(run(["npm", "run", "beta:daily-ops"]));
  }

  process.exit(run(phase.command));
}

main();
