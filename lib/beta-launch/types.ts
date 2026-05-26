export type GateStatus = "pass" | "fail" | "skip" | "manual";

export type LaunchStepId = 1 | 2 | 3 | 4 | 5 | 6;

export type GateResult = {
  id: string;
  step: LaunchStepId;
  name: string;
  status: GateStatus;
  message: string;
  durationMs: number;
  command?: string;
};

export type LaunchReport = {
  generatedAt: string;
  environment: string;
  steps: Record<string, { title: string; gates: GateResult[] }>;
  summary: {
    pass: number;
    fail: number;
    skip: number;
    manual: number;
    readyForBeta: boolean;
    readinessScore: number;
    allAutomatedPass: boolean;
    blockingManual: number;
  };
};

export const LAUNCH_STEPS: Record<LaunchStepId, { title: string; owner: string }> = {
  1: { title: "DBA approve migrations", owner: "DBA / You" },
  2: { title: "Migrate + backfill", owner: "DevOps" },
  3: { title: "Env staging (Upstash + TOTP)", owner: "DevOps" },
  4: { title: "QA bundle", owner: "QA" },
  5: { title: "Staff visibility", owner: "Product" },
  6: { title: "Onboard 1–3 kitchens", owner: "You" },
};
