import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { checkEnvForStep } from "@/lib/beta-ops/env-requirements";
import { loadLaunchReportFromDisk } from "@/lib/beta-ops/launch-bridge";
import type { ProgramState, ProgramStepId } from "@/lib/beta-ops/program-state";

export type StepGuardResult = {
  ok: boolean;
  blockers: string[];
  warnings: string[];
};

const STAGING_PREP = join(process.cwd(), "docs", "artifacts", "BETA_STAGING_PREP.json");
const LAUNCH_REPORT = join(process.cwd(), "docs", "artifacts", "BETA_LAUNCH_REPORT.json");

function stepOk(state: ProgramState, step: ProgramStepId): boolean {
  return state.steps[String(step)]?.ok === true;
}

export function guardStep(step: ProgramStepId, state: ProgramState): StepGuardResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const env = checkEnvForStep(step);
  if (!env.ok) {
    blockers.push(`Env: ${env.missing.join(", ")}`);
  }

  switch (step) {
    case 0: {
      if (!existsSync(STAGING_PREP)) {
        warnings.push("BETA_STAGING_PREP.json missing — run npm run beta:staging-prep on staging host");
      } else {
        try {
          const prep = JSON.parse(readFileSync(STAGING_PREP, "utf8")) as { ok?: boolean };
          if (!prep.ok) blockers.push("Staging prep artifact not green");
        } catch {
          warnings.push("BETA_STAGING_PREP.json unreadable");
        }
      }
      break;
    }
    case 1: {
      if (!stepOk(state, 0)) {
        const launch = loadLaunchReportFromDisk();
        if (!launch?.summary.readyForBeta) {
          blockers.push("Step 0 (Day 1) must be green — npm run beta:day1-complete");
        } else {
          warnings.push("Program step 0 not marked OK — re-run beta:day1-complete");
        }
      }
      break;
    }
    case 2: {
      if (!stepOk(state, 1)) {
        blockers.push("Step 1 (go-live) must succeed first — npm run beta:go-live");
      }
      if (!process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()) {
        blockers.push("NEXT_PUBLIC_SUPPORT_EMAIL required — npm run beta:support-setup");
      }
      break;
    }
    case 3: {
      if (!existsSync(join(process.cwd(), "docs", "artifacts"))) {
        warnings.push("No daily ops artifacts yet");
      }
      break;
    }
    case 4:
      break;
    case 5:
      break;
    default:
      break;
  }

  if (step >= 1 && !existsSync(LAUNCH_REPORT)) {
    warnings.push("BETA_LAUNCH_REPORT.json missing — Day 1 may not have run");
  }

  return { ok: blockers.length === 0, blockers, warnings };
}
