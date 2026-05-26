import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { LaunchReport } from "@/lib/beta-launch/types";
import {
  loadProgramState,
  markStep,
  saveProgramState,
  type ProgramState,
} from "@/lib/beta-ops/program-state";

const LAUNCH_REPORT_PATH = join(process.cwd(), "docs", "artifacts", "BETA_LAUNCH_REPORT.json");

export function loadLaunchReportFromDisk(): LaunchReport | null {
  if (!existsSync(LAUNCH_REPORT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(LAUNCH_REPORT_PATH, "utf8")) as LaunchReport;
  } catch {
    return null;
  }
}

/** Sync program step 0 from latest launch report (after beta:launch / beta:day1-complete). */
export function syncLaunchReportToProgramState(
  report: LaunchReport | null = loadLaunchReportFromDisk(),
  state: ProgramState = loadProgramState(),
): ProgramState {
  if (!report) return state;

  markStep(state, 0, {
    ok: report.summary.readyForBeta,
    notes: report.summary.readyForBeta
      ? `readyForBeta; score ${report.summary.readinessScore}/100`
      : `fail=${report.summary.fail} manual=${report.summary.manual}`,
    artifact: "docs/artifacts/BETA_LAUNCH_REPORT.json",
  });
  saveProgramState(state);
  return state;
}
