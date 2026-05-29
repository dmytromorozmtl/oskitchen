/**
 * era25 Pilot Week 1 Execution Convergence — phases and convergence requirements.
 * Policy: era25-pilot-week1-execution-convergence-v1
 */
export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PHASES_POLICY_ID =
  "era25-pilot-week1-execution-convergence-phases-v1" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC =
  "docs/next-era25-pilot-week1-execution-convergence-2026-05-28.md" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH =
  "artifacts/pilot-week1-execution-convergence-era25-report.md" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR =
  "#era25-pilot-week1-execution-convergence" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_TRACKED_ENV_KEYS = [
  "PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED",
  "PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_REVIEWED",
] as const;

export function detectPilotWeek1ExecutionConvergenceEra25Started(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_BACKLOG_ID = "KOS-E25-003-PILOT-W1" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC =
  "docs/next-step-4-pilot-week1-execution-2026-05-28.md" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS: readonly {
  id: string;
  label: string;
  surface: string;
}[] = [
  {
    id: "week1_phases_panel",
    label: "Week 1 day phases on platform ops",
    surface: "Commercial pilot ops",
  },
  {
    id: "briefing_action",
    label: "Briefing ranked action on blocked day",
    surface: "Owner Daily Briefing hero",
  },
  {
    id: "launch_wizard",
    label: "Launch Wizard inline week 1 progress",
    surface: "/dashboard/launch-wizard",
  },
  {
    id: "integration_health",
    label: "Integration Health week 1 cadence",
    surface: "/dashboard/integration-health",
  },
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS: readonly string[] = [
  "Never fake Day 1–5 PASS in artifacts or env vars",
  "Never ship before paid_pilot_go_convergence_era25_ready",
  "Never skip metrics baseline artifact on Day 5",
  "Never re-open era21 gate chain for steady-state customers",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-pilot-week1-execution-convergence-era25",
  "ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25",
  "ops:validate-paid-pilot-go-convergence-era25",
  "ops:validate-pilot-week1-env",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve paid_pilot_go_convergence_era25_ready",
  "Day 1 — record PILOT_WEEK1_TTV_HOURS + PILOT_WEEK1_FIRST_ORDER_ID after Launch Wizard",
  "Day 2 — review Integration Health, set PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED=1",
  "Day 3 — POS shift closeout, set PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass",
  "Day 4 — reports export, set PILOT_WEEK1_REPORTS_WEEKLY_EXPORT=1",
  "Day 5 — smoke:pilot-metrics-baseline + case study + GO re-run",
] as const;
