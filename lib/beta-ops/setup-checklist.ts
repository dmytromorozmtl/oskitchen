import { existsSync } from "node:fs";
import { join } from "node:path";

import { checkEnvForStep, ENV_BY_STEP } from "@/lib/beta-ops/env-requirements";
import { hasCohortEmails } from "@/lib/beta-ops/cohort-emails";
import { computeProgramReadiness } from "@/lib/beta-ops/readiness";
import type { ProgramState } from "@/lib/beta-ops/program-state";
import { signoffSummary } from "@/lib/beta-ops/signoffs";

export type SetupPhase = {
  id: string;
  title: string;
  done: boolean;
  command: string;
  note?: string;
};

export function buildSetupPhases(state: ProgramState | null): SetupPhase[] {
  const envBeta = existsSync(join(process.cwd(), ".env.beta.local"));
  const env0 = checkEnvForStep(0);
  const signoffs = signoffSummary();
  const readiness = computeProgramReadiness(state);
  const step0 = state?.steps["0"];

  return [
    {
      id: "env-file",
      title: "Create .env.beta.local from template",
      done: envBeta,
      command: "cp .env.beta.local.example .env.beta.local",
      note: envBeta ? "File exists" : "Never commit this file",
    },
    {
      id: "env-step0",
      title: "Fill Step 0 smoke + E2E credentials",
      done: env0.ok,
      command: "npm run beta:env-check -- --step=0 --validate",
      note: env0.missing.length ? `Missing: ${env0.missing.join(", ")}` : undefined,
    },
    {
      id: "preflight",
      title: "Preflight (format + HTTP reachability)",
      done: existsSync(join(process.cwd(), "docs", "artifacts", "BETA_PREFLIGHT.json")),
      command: "npm run beta:preflight",
    },
    {
      id: "staging-prep",
      title: "Staging: remediation + backfill + verify --strict",
      done: existsSync(join(process.cwd(), "docs", "artifacts", "BETA_STAGING_PREP.json")),
      command: "npm run beta:staging-prep",
      note: "Run on staging host with DATABASE_URL",
    },
    {
      id: "dba-signoff",
      title: "DBA migration approval recorded",
      done: signoffs.dba,
      command: 'npm run dba:record-signoff -- --by="DBA" --ticket=INFRA-123',
    },
    {
      id: "day1",
      title: "Day 1 launch gates green (HTML report)",
      done: step0?.ok === true && readiness.readyForBeta,
      command: "npm run beta:day1-complete",
    },
    {
      id: "cohort",
      title: "Cohort emails configured (1–3 kitchens)",
      done: hasCohortEmails(),
      command: "npm run beta:cohort -- --emails=owner1@,owner2@",
    },
    {
      id: "go-live",
      title: "Kitchens marked LIVE in registry",
      done: state?.steps["1"]?.ok === true,
      command: "npm run beta:go-live -- --emails=...",
    },
    {
      id: "support",
      title: "Support channel + Slack webhook",
      done: Boolean(process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()),
      command: "npm run beta:support-setup",
    },
    {
      id: "daily-ops",
      title: "Week 1 daily ops running",
      done: state?.steps["2"]?.ok === true,
      command: "npm run beta:daily-ops",
    },
  ];
}

export function renderSetupChecklist(state: ProgramState | null): string {
  const phases = buildSetupPhases(state);
  const readiness = computeProgramReadiness(state);
  const lines = [
    "# OS Kitchen Beta — Setup Checklist",
    "",
    `Readiness: **${readiness.score}/100** (launch ${readiness.launchScore}, env ${readiness.envScore}, program ${readiness.programScore})`,
    "",
    "| Phase | Status | Command |",
    "|-------|--------|---------|",
  ];

  for (const p of phases) {
    lines.push(`| ${p.title} | ${p.done ? "DONE" : "TODO"} | \`${p.command}\` |`);
    if (p.note && !p.done) lines.push(`| | _${p.note}_ | |`);
  }

  lines.push("", "## Env keys reference (Step 0)", "");
  for (const r of ENV_BY_STEP[0]) {
    lines.push(`- \`${r.key}\`${r.required ? " (required)" : ""} — ${r.description}`);
  }

  return lines.join("\n");
}
