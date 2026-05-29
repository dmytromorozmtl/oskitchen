/**
 * era25 Series A / Partner Expansion Convergence — phases and convergence requirements.
 * Policy: era25-series-a-partner-expansion-convergence-v1
 */
export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PHASES_POLICY_ID =
  "era25-series-a-partner-expansion-convergence-phases-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC =
  "docs/next-era25-series-a-partner-expansion-convergence-2026-05-28.md" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH =
  "artifacts/series-a-partner-expansion-convergence-era25-report.md" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR =
  "#era25-series-a-partner-expansion-convergence" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_BACKLOG_ID =
  "KOS-E25-006-SERIES-A" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC =
  "docs/next-step-7-series-a-partner-expansion-2026-05-28.md" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS: readonly {
  id: string;
  label: string;
  surface: string;
}[] = [
  {
    id: "series_a_tracks_panel",
    label: "Series A tracks A–D on platform ops",
    surface: "Commercial pilot ops",
  },
  {
    id: "briefing_action",
    label: "Briefing ranked action on blocked track",
    surface: "Owner Daily Briefing hero",
  },
  {
    id: "launch_wizard",
    label: "Launch Wizard inline Series A tracks progress",
    surface: "/dashboard/launch-wizard",
  },
  {
    id: "partner_channel",
    label: "Partner channel + integrations honesty",
    surface: "/integrations + /solutions/ghost-kitchens",
  },
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS: readonly string[] = [
  "Never fake Series A PASS in artifacts or SERIES_A_* env vars",
  "Never ship before scale_readiness_convergence_era25_ready",
  "Never claim audited financials without artifact chain",
  "Never re-open era21 gate chain for steady-state customers",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-series-a-partner-expansion-convergence-era25",
  "ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25",
  "ops:validate-scale-readiness-convergence-era25",
  "ops:validate-series-a-partner-expansion-env",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve scale_readiness_convergence_era25_ready",
  "Series A data room bundle + competitor feature gap matrix",
  "Partner channel one-pager + Woo/Shopify integration honesty",
  "Multi-region pilot playbook + forbidden claims review",
  "Customer success repeatability — NPS baseline + expansion revenue artifact",
] as const;
