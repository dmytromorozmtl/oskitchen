/**
 * era25 Owner Daily Briefing Breakthrough — phases, briefing scheme B0–B4.
 * Policy: era25-owner-daily-briefing-breakthrough-v1
 */
export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PHASES_POLICY_ID =
  "era25-owner-daily-briefing-breakthrough-phases-v1" as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC =
  "docs/next-era25-owner-daily-briefing-breakthrough-product-slice-2026-05-28.md" as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH =
  "artifacts/owner-daily-briefing-breakthrough-era25-report.md" as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR =
  "#era25-owner-daily-briefing-breakthrough" as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_TRACKED_ENV_KEYS = [
  "OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_ATTESTED",
  "OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_REVIEWED",
] as const;

export function detectOwnerDailyBriefingBreakthroughEra25Started(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BACKLOG_ID =
  "KOS-E25-001-ODB-BREAKTHROUGH" as const;

/** era25 briefing scheme — separate from era21 0–8. */
export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME: readonly {
  id: string;
  label: string;
  description: string;
}[] = [
  {
    id: "B0",
    label: "Breakthrough readiness ring",
    description: "Gates + blueprint status on platform ops",
  },
  {
    id: "B1",
    label: "Owner priority tiles",
    description: "Orders, KDS, integrations, go-live deep links",
  },
  {
    id: "B2",
    label: "Integration recovery convergence",
    description: "era19 recovery checklist convergence tiles",
  },
  {
    id: "B3",
    label: "Pilot GO/NO-GO honest status",
    description: "Commercial pilot ops — never fake GO",
  },
  {
    id: "B4",
    label: "Staging proof snapshot",
    description: "P0 ops vault — 11 env vars honest status",
  },
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS: readonly string[] = [
  "Never ship before era25_first_product_slice_blueprint_ready",
  "Never re-use era21 briefing scheme 0–8 for era25 breakthrough tiles",
  "Never fake PASS in artifacts/*.json or claim pilot GO without evaluator",
  "Never nest era25 product panels under Steps 1–16 anchors",
  "Never skip test:ci:commercial-pilot-runbook:cert on release",
  "Never bypass P0 ops vault — honest awaiting_ops_credentials until proof_passed",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-owner-daily-briefing-breakthrough-era25",
  "ops:run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25",
  "ops:validate-era25-first-product-slice-blueprint",
  "ops:sync-owner-daily-briefing-breakthrough-era25-report",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve era25_first_product_slice_blueprint_ready",
  "Configure P0 ops vault (11 env vars) — npm run smoke:p0-staging-proof-unblock",
  "Leadership sign-off on staging checklist",
  "Validate breakthrough tiles on /dashboard/today#era25-owner-daily-briefing-breakthrough",
  "Honest NO-GO until staging proof PASS",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_EXISTING_LINKS: readonly {
  id: string;
  label: string;
  href: string;
}[] = [
  { id: "today", label: "Today dashboard", href: "/dashboard/today" },
  {
    id: "integration_health",
    label: "Integration Health",
    href: "/dashboard/integration-health#integration-recovery-checklist",
  },
  {
    id: "platform_ops",
    label: "Commercial pilot ops",
    href: "/platform/commercial-pilot-ops",
  },
  { id: "order_hub", label: "Order Hub", href: "/dashboard/orders" },
] as const;
