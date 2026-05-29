/**
 * era25 engineering gates — require signed charter (era24 enforcement slice).
 * NOT era25 product engineering · gates open only after charter readiness healthy.
 */
export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_PHASES_ERA24_POLICY_ID =
  "era24-era25-engineering-gates-require-signed-charter-phases-v1" as const;

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC =
  "docs/next-era25-engineering-gates-require-signed-charter-2026-05-28.md" as const;

export const ERA25_ENGINEERING_GATES_REPORT_PATH =
  "artifacts/era25-engineering-gates-require-signed-charter-report.md" as const;

export const ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR =
  "#era25-engineering-gates-require-signed-charter" as const;

/** Minimum deliverables for first era25 product slice (when gates open). */
export const ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS: readonly {
  id: string;
  label: string;
  example: string;
}[] = [
  { id: "policy_family", label: "New policy family", example: "era25-<name>-v1" },
  { id: "backlog_id", label: "Backlog ID", example: "KOS-E25-NNN" },
  { id: "platform_anchor", label: "Platform anchor outside Steps 1–16", example: "#era25-<name>" },
  { id: "ops_validate", label: "Ops validate + orchestrator", example: "ops:validate-<name> -- --json" },
  { id: "ci_cert", label: "CI cert chain", example: "test:ci:<name>-era25:cert" },
  { id: "briefing_scheme", label: "Briefing scheme", example: "Separate from era21 0–8" },
  { id: "staging_proof", label: "Staging proof checklist", example: "era25-specific ops checklist" },
] as const;

export const ERA25_ENGINEERING_GATES_GUARDRAILS: readonly string[] = [
  "Never ship era25 product code before era25_first_charter_slice_ready",
  "Never add Step 18+ to the linear doc chain",
  "Never extend COMMERCIAL_PILOT_PATH_STEP_CATALOG beyond 16 steps",
  "Never nest era25 product panels under Steps 1–16 anchors",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:commercial-pilot-runbook:cert on release",
] as const;

export const ERA25_ENGINEERING_GATES_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-engineering-gates-require-signed-charter",
  "ops:run-era25-engineering-gates-post-readiness-orchestrator",
  "ops:validate-era25-first-charter-slice-readiness",
  "ops:validate-linear-chain-terminus-guard",
  "ops:sync-era25-engineering-gates-require-signed-charter-report",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const ERA25_ENGINEERING_GATES_HUMAN_STEPS: readonly string[] = [
  "Achieve era25_first_charter_slice_ready (10 charter sections validated)",
  "Leadership sign-off documented in docs/era25-*-charter-*.md",
  "Approve era25-<name> policy IDs + backlog KOS-E25-NNN",
  "Implement first slice on new #era25-<name> anchor only",
  "Honest NO-GO until staging proof passes",
] as const;
