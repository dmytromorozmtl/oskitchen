import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { LaunchReport } from "@/lib/beta-launch/types";
import { checkEnvForStep } from "@/lib/beta-ops/env-requirements";
import type { ProgramState } from "@/lib/beta-ops/program-state";
import { signoffSummary } from "@/lib/beta-ops/signoffs";

const LAUNCH_REPORT_PATH = join(process.cwd(), "docs", "artifacts", "BETA_LAUNCH_REPORT.json");

export function loadLaunchReport(): LaunchReport | null {
  if (!existsSync(LAUNCH_REPORT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(LAUNCH_REPORT_PATH, "utf8")) as LaunchReport;
  } catch {
    return null;
  }
}

export type ProgramReadiness = {
  score: number;
  launchScore: number;
  programScore: number;
  envScore: number;
  signoffScore: number;
  readyForBeta: boolean;
  details: string[];
};

/** Composite 0–100 score across env, launch report, program steps, signoffs. */
export function computeProgramReadiness(
  programState: ProgramState | null,
  launchReport: LaunchReport | null = loadLaunchReport(),
): ProgramReadiness {
  const details: string[] = [];

  const env0 = checkEnvForStep(0);
  const envScore = env0.ok ? 15 : Math.max(0, 15 - env0.missing.length * 3);
  if (!env0.ok) details.push(`Env step 0: missing ${env0.missing.join(", ")}`);

  const launchScore = launchReport?.summary.readinessScore ?? 0;
  if (launchReport?.summary.readyForBeta) details.push("Launch: readyForBeta");
  else if (launchReport) details.push(`Launch: ${launchReport.summary.fail} fail, ${launchReport.summary.manual} manual`);

  let programScore = 0;
  if (programState) {
    const steps = Object.values(programState.steps);
    const ok = steps.filter((s) => s.ok === true).length;
    programScore = Math.round((ok / 6) * 20);
    details.push(`Program steps OK: ${ok}/6`);
  }

  const signoffs = signoffSummary();
  const signoffScore = (signoffs.dba ? 5 : 0) + (signoffs.product ? 5 : 0);
  if (!signoffs.dba) details.push("DBA signoff pending");
  if (!signoffs.product) details.push("Product signoff pending");

  const score = Math.min(
    100,
    Math.round(envScore + launchScore * 0.55 + programScore + signoffScore),
  );

  return {
    score,
    launchScore,
    programScore,
    envScore,
    signoffScore,
    readyForBeta: launchReport?.summary.readyForBeta === true && env0.ok,
    details,
  };
}
