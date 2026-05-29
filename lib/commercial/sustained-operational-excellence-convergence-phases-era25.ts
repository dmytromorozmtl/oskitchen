/**
 * era25 Sustained Operational Excellence Convergence — phases and convergence requirements.
 * Policy: era25-sustained-operational-excellence-convergence-v1
 */
export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PHASES_POLICY_ID =
  "era25-sustained-operational-excellence-convergence-phases-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC =
  "docs/next-era25-sustained-operational-excellence-convergence-2026-05-28.md" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH =
  "artifacts/sustained-operational-excellence-convergence-era25-report.md" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR =
  "#era25-sustained-operational-excellence-convergence" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_BACKLOG_ID =
  "KOS-E25-008-SUSTAINED-OPS" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC =
  "docs/next-step-9-sustained-operational-excellence-2026-05-28.md" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS: readonly {
  id: string;
  label: string;
  surface: string;
}[] = [
  {
    id: "sustained_ops_cadences_panel",
    label: "Sustained ops cadences A–D on platform ops",
    surface: "Commercial pilot ops",
  },
  {
    id: "briefing_action",
    label: "Briefing ranked action on blocked cadence",
    surface: "Owner Daily Briefing hero",
  },
  {
    id: "launch_wizard",
    label: "Launch Wizard inline cadences progress",
    surface: "/dashboard/launch-wizard",
  },
  {
    id: "daily_shift_ops",
    label: "Order Hub + production calendar daily cadence",
    surface: "/dashboard/order-hub + /dashboard/production-calendar",
  },
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS: readonly string[] = [
  "Never fake sustained ops PASS in artifacts or SUSTAINED_OPS_* env vars",
  "Never ship before market_leader_positioning_convergence_era25_ready",
  "Never skip cadence attestation and claim pure operational mode",
  "Never re-open era21 gate chain for steady-state customers",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-sustained-operational-excellence-convergence-era25",
  "ops:run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25",
  "ops:validate-market-leader-positioning-convergence-era25",
  "ops:validate-sustained-operational-excellence-env",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve market_leader_positioning_convergence_era25_ready",
  "Cadence A — Today + Order Hub + daily attestation honest",
  "Cadence B — integration health + webhook smokes weekly review",
  "Cadence C — rolling metrics baseline refresh from pilot #1",
  "Cadence D — forbidden-claims + feature maturity matrix quarterly audit",
] as const;
