/**
 * era25 Market Leader Positioning Convergence — phases and convergence requirements.
 * Policy: era25-market-leader-positioning-convergence-v1
 */
export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PHASES_POLICY_ID =
  "era25-market-leader-positioning-convergence-phases-v1" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC =
  "docs/next-era25-market-leader-positioning-convergence-2026-05-28.md" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH =
  "artifacts/market-leader-positioning-convergence-era25-report.md" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR =
  "#era25-market-leader-positioning-convergence" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_BACKLOG_ID =
  "KOS-E25-007-MARKET-LEADER" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC =
  "docs/next-step-8-market-leader-positioning-2026-05-28.md" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS: readonly {
  id: string;
  label: string;
  surface: string;
}[] = [
  {
    id: "positioning_pillars_panel",
    label: "Market leader pillars 1–4 on platform ops",
    surface: "Commercial pilot ops",
  },
  {
    id: "briefing_action",
    label: "Briefing ranked action on blocked pillar",
    surface: "Owner Daily Briefing hero",
  },
  {
    id: "launch_wizard",
    label: "Launch Wizard inline positioning pillars progress",
    surface: "/dashboard/launch-wizard",
  },
  {
    id: "category_narrative",
    label: "Category narrative + moat proof honesty",
    surface: "ICP landings + /dashboard/reports",
  },
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS: readonly string[] = [
  "Never fake market leader PASS in artifacts or MARKET_LEADER_* env vars",
  "Never ship before series_a_partner_expansion_convergence_era25_ready",
  "Never claim category leadership without audited proof",
  "Never re-open era21 gate chain for steady-state customers",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-market-leader-positioning-convergence-era25",
  "ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25",
  "ops:validate-series-a-partner-expansion-convergence-era25",
  "ops:validate-market-leader-positioning-env",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve series_a_partner_expansion_convergence_era25_ready",
  "Category narrative aligned with competitor leapfrog roadmap",
  "Competitive moat proof from feature maturity matrix + gap matrix",
  "Analyst-ready brief published with honest claims review",
  "Expansion revenue motion from pilot #1 metrics baseline",
] as const;
