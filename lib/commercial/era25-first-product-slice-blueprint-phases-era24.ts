/**
 * era25 first product slice blueprint — canonical slice definition (era24 process).
 * NOT era25 product engineering · blueprint orchestration until gates + charter + staging checklist.
 */
export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PHASES_ERA24_POLICY_ID =
  "era24-era25-first-product-slice-blueprint-phases-v1" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC =
  "docs/next-era25-first-product-slice-blueprint-2026-05-28.md" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH =
  "artifacts/era25-first-product-slice-blueprint-report.md" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PLATFORM_ANCHOR =
  "#era25-first-product-slice-blueprint" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_TRACKED_ENV_KEYS = [
  "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED",
  "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_REVIEWED",
] as const;

export function detectEra25FirstProductSliceBlueprintStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

/** Canonical first era25 product slice — WOW pillar from breakthrough map. */
export const ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME =
  "owner-daily-briefing-breakthrough" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID = "KOS-E25-001-ODB-BREAKTHROUGH" as const;

export const ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY =
  "era25-owner-daily-briefing-breakthrough-v1" as const;

export const ERA25_FIRST_PRODUCT_SLICE_PRODUCT_PLATFORM_ANCHOR =
  "#era25-owner-daily-briefing-breakthrough" as const;

export const ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX =
  "docs/era25-owner-daily-briefing-breakthrough-charter-2026-" as const;

export const ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC =
  "docs/era25-owner-daily-briefing-breakthrough-staging-proof-ops-checklist.md" as const;

export const ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC =
  "docs/next-era25-owner-daily-briefing-breakthrough-product-slice-2026-05-28.md" as const;

/** Links blueprint to existing KitchenOS surfaces (era19 briefing, Today, integration health). */
export const ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES: readonly {
  id: string;
  label: string;
  path: string;
}[] = [
  {
    id: "owner_daily_briefing_era19",
    label: "Owner Daily Briefing aggregator (era19)",
    path: "lib/briefing/owner-daily-briefing-integration-recovery-convergence-era19.ts",
  },
  {
    id: "integration_health_recovery",
    label: "Integration Health Recovery (era19)",
    path: "lib/integrations/integration-health-recovery-era19.ts",
  },
  {
    id: "integration_health_dashboard",
    label: "Integration Health dashboard",
    path: "app/dashboard/integration-health/page.tsx",
  },
  {
    id: "breakthrough_map",
    label: "Breakthrough map — WOW pillar cycles 13–18",
    path: "docs/next-50-cycle-global-breakthrough-map-2026-05-28.md",
  },
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES: readonly {
  id: string;
  label: string;
  example: string;
}[] = [
  {
    id: "phases",
    label: "Phases lib",
    example: "lib/commercial/owner-daily-briefing-breakthrough-phases-era25.ts",
  },
  {
    id: "ui",
    label: "UI slice",
    example: "lib/commercial/owner-daily-briefing-breakthrough-ui-era25.ts",
  },
  {
    id: "orchestrator",
    label: "Post-gates orchestrator",
    example:
      "lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25.ts",
  },
  {
    id: "policy",
    label: "Policy family",
    example: ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY,
  },
  {
    id: "platform_anchor",
    label: "Platform anchor",
    example: ERA25_FIRST_PRODUCT_SLICE_PRODUCT_PLATFORM_ANCHOR,
  },
  {
    id: "briefing_scheme",
    label: "era25 briefing scheme",
    example: "Separate from era21 0–8 — documented in charter section 8",
  },
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS: readonly string[] = [
  "Never ship *-phases-era25.ts before era25_first_product_slice_blueprint_ready",
  "Never add Step 18+ to the linear doc chain",
  "Never extend COMMERCIAL_PILOT_PATH_STEP_CATALOG beyond 16 steps",
  "Never nest era25 product panels under Steps 1–16 anchors",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:commercial-pilot-runbook:cert on release",
  "Never claim P0 PASS without ops vault (11 env vars)",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-first-product-slice-blueprint",
  "ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator",
  "ops:validate-era25-engineering-gates-require-signed-charter",
  "ops:validate-era25-first-charter-slice-readiness",
  "ops:validate-linear-chain-terminus-guard",
  "ops:sync-era25-first-product-slice-blueprint-report",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS: readonly string[] = [
  "Achieve era25_engineering_gates_open",
  `Write ${ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX}*.md with all 10 sections + leadership sign-off`,
  `Complete ${ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC} honestly (NO-GO until P0 PASS)`,
  `Approve backlog ${ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID} and policy ${ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY}`,
  "Begin era25 product code only on #era25-owner-daily-briefing-breakthrough anchor",
] as const;
