/**
 * era25 Month 2 Market Readiness Convergence — phases and convergence requirements.
 * Policy: era25-month2-market-readiness-convergence-v1
 */
export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID =
  "era25-month2-market-readiness-convergence-phases-v1" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC =
  "docs/next-era25-month2-market-readiness-convergence-2026-05-28.md" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH =
  "artifacts/month2-market-readiness-convergence-era25-report.md" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR =
  "#era25-month2-market-readiness-convergence" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_TRACKED_ENV_KEYS = [
  "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED",
  "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED",
] as const;

export function detectMonth2MarketReadinessConvergenceEra25Started(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_BACKLOG_ID = "KOS-E25-004-MONTH2" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC =
  "docs/next-step-5-month2-market-readiness-2026-05-28.md" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS: readonly {
  id: string;
  label: string;
  surface: string;
}[] = [
  {
    id: "month2_workstreams_panel",
    label: "Month 2 workstreams A–E on platform ops",
    surface: "Commercial pilot ops",
  },
  {
    id: "briefing_action",
    label: "Briefing ranked action on blocked workstream",
    surface: "Owner Daily Briefing hero",
  },
  {
    id: "launch_wizard",
    label: "Launch Wizard inline month 2 progress",
    surface: "/dashboard/launch-wizard",
  },
  {
    id: "icp_landings",
    label: "ICP landing review convergence",
    surface: "/solutions/ghost-kitchens + /solutions/meal-prep",
  },
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS: readonly string[] = [
  "Never fake month 2 PASS in artifacts or env vars",
  "Never ship before pilot_week1_execution_convergence_era25_ready",
  "Never publish case study without customer approval artifact",
  "Never re-open era21 gate chain for steady-state customers",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-month2-market-readiness-convergence-era25",
  "ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25",
  "ops:validate-pilot-week1-execution-convergence-era25",
  "ops:validate-month2-market-readiness-env",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve pilot_week1_execution_convergence_era25_ready",
  "Metrics baseline artifact overall PASSED",
  "Investor one-pager smoke + MONTH2_INVESTOR_FOUNDER_SIGNOFF=1",
  "Review ICP landings — MONTH2_GTM_*_LANDING_REVIEWED=1",
  "Case study customer approval + publish gate smokes",
] as const;
