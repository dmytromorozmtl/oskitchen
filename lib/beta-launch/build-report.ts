import { LAUNCH_STEPS, type GateResult, type LaunchReport, type LaunchStepId } from "@/lib/beta-launch/types";

export type BuildReportOptions = {
  /** When true, any manual gate blocks readyForBeta. */
  strictSignoffs?: boolean;
  environment?: string;
};

export function buildLaunchReport(allGates: GateResult[], opts: BuildReportOptions = {}): LaunchReport {
  const steps: LaunchReport["steps"] = {};
  for (const [id, meta] of Object.entries(LAUNCH_STEPS)) {
    steps[id] = {
      title: meta.title,
      gates: allGates.filter((g) => g.step === Number(id)),
    };
  }

  const pass = allGates.filter((g) => g.status === "pass").length;
  const fail = allGates.filter((g) => g.status === "fail").length;
  const skip = allGates.filter((g) => g.status === "skip").length;
  const manual = allGates.filter((g) => g.status === "manual").length;
  const automated = allGates.filter((g) => g.status !== "manual" && g.status !== "skip");
  const allAutomatedPass = automated.length > 0 && automated.every((g) => g.status === "pass");

  const readyForBeta =
    fail === 0 && (opts.strictSignoffs ? manual === 0 : true) && allAutomatedPass;

  const readinessScore = computeLaunchReadinessScore(pass, fail, skip, manual, readyForBeta, allAutomatedPass);

  return {
    generatedAt: new Date().toISOString(),
    environment: opts.environment ?? process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "unknown",
    steps,
    summary: {
      pass,
      fail,
      skip,
      manual,
      readyForBeta,
      readinessScore,
      allAutomatedPass,
      blockingManual: opts.strictSignoffs ? manual : 0,
    },
  };
}

export function computeLaunchReadinessScore(
  pass: number,
  fail: number,
  skip: number,
  manual: number,
  readyForBeta: boolean,
  allAutomatedPass: boolean,
): number {
  const total = pass + fail + manual + skip;
  if (total === 0) return 0;
  let score = Math.round((pass / total) * 70);
  score -= fail * 12;
  score -= manual * 4;
  if (readyForBeta) score += 15;
  if (allAutomatedPass) score += 10;
  return Math.max(0, Math.min(100, score));
}
