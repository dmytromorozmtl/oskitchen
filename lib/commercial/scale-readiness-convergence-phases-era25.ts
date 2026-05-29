/**
 * era25 Scale Readiness Convergence — phases and convergence requirements.
 * Policy: era25-scale-readiness-convergence-v1
 */
export const SCALE_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID =
  "era25-scale-readiness-convergence-phases-v1" as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_DOC =
  "docs/next-era25-scale-readiness-convergence-2026-05-28.md" as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH =
  "artifacts/scale-readiness-convergence-era25-report.md" as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR =
  "#era25-scale-readiness-convergence" as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_BACKLOG_ID = "KOS-E25-005-SCALE" as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC =
  "docs/next-step-6-scale-readiness-2026-05-28.md" as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS: readonly {
  id: string;
  label: string;
  surface: string;
}[] = [
  {
    id: "scale_gates_panel",
    label: "Scale gates 1–5 on platform ops",
    surface: "Commercial pilot ops",
  },
  {
    id: "briefing_action",
    label: "Briefing ranked action on blocked gate",
    surface: "Owner Daily Briefing hero",
  },
  {
    id: "launch_wizard",
    label: "Launch Wizard inline scale gates progress",
    surface: "/dashboard/launch-wizard",
  },
  {
    id: "integration_health_sso",
    label: "Enterprise SSO production status",
    surface: "/dashboard/integration-health",
  },
] as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS: readonly string[] = [
  "Never fake scale PASS in artifacts or SCALE_* env vars",
  "Never ship before month2_market_readiness_convergence_era25_ready",
  "Never claim SOC2 certification without honest readiness track",
  "Never re-open era21 gate chain for steady-state customers",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-scale-readiness-convergence-era25",
  "ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25",
  "ops:validate-month2-market-readiness-convergence-era25",
  "ops:validate-scale-readiness-env",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve month2_market_readiness_convergence_era25_ready",
  "SCALE_PER_CUSTOMER_GO_ISOLATION=1 — separate GO per customer",
  "SCALE_SOC2_READINESS_TRACK_REVIEWED=1 — honest SOC2 readiness track",
  "Enterprise SSO production cutover or documented deferral",
  "Rollback + webhook resilience drills attested",
  "Investor/partner data room artifact chain published",
] as const;
