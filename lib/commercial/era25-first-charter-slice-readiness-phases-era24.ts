/**
 * era25 first charter slice readiness — outside linear catalog (era24 process slice).
 * Validates signed charter doc sections before any era25 engineering begins.
 */
export const ERA25_FIRST_CHARTER_SLICE_READINESS_PHASES_ERA24_POLICY_ID =
  "era24-era25-first-charter-slice-readiness-phases-v1" as const;

export const ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC =
  "docs/next-era25-first-charter-slice-template-2026-05-28.md" as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH =
  "artifacts/era25-first-charter-slice-readiness-report.md" as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_PLATFORM_ANCHOR =
  "#era25-first-charter-slice-readiness" as const;

export const ERA25_FIRST_CHARTER_SLICE_TRACKED_ENV_KEYS = [
  "ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED",
  "ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_REVIEWED",
] as const;

export function detectEra25FirstCharterSliceStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FIRST_CHARTER_SLICE_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export type Era25CharterRequiredSectionDef = {
  id: string;
  label: string;
  pattern: RegExp;
};

export const ERA25_CHARTER_REQUIRED_SECTIONS: readonly Era25CharterRequiredSectionDef[] = [
  { id: "charter_name", label: "Charter name + era number", pattern: /era25/i },
  { id: "problem_statement", label: "Problem statement", pattern: /problem statement/i },
  { id: "success_criteria", label: "Success criteria", pattern: /success criteria/i },
  { id: "policy_ids", label: "Policy IDs", pattern: /policy ID|era25-.+-v1/i },
  { id: "backlog_id", label: "Backlog ID", pattern: /KOS-E25-/i },
  { id: "ops_scripts", label: "Ops scripts", pattern: /ops:validate|ops scripts/i },
  { id: "ci_scripts", label: "CI scripts", pattern: /test:ci.*era25|CI scripts/i },
  { id: "briefing_scheme", label: "Briefing scheme", pattern: /briefing/i },
  { id: "rollback_nogo", label: "Rollback / NO-GO", pattern: /rollback|NO-GO/i },
  {
    id: "leadership_signoff",
    label: "Leadership sign-off",
    pattern: /sign-off|sign off|leadership sign/i,
  },
] as const;

export const ERA25_FIRST_CHARTER_SLICE_GUARDRAILS: readonly string[] = [
  "Never start era25 engineering without validated charter doc sections",
  "Never add era25 code to COMMERCIAL_PILOT_PATH_STEP_CATALOG",
  "Never nest era25 panels under Steps 1–16 anchors",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip terminus guard before era25 slice work",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-first-charter-slice-readiness",
  "ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator",
  "ops:validate-era25-charter-exit-outside-linear-path",
  "ops:sync-era25-first-charter-slice-readiness-report",
  "ops:validate-linear-chain-terminus-guard",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN: readonly {
  component: string;
  artifact: string;
}[] = [
  { component: "Phases lib", artifact: "lib/commercial/<name>-phases-era25.ts" },
  {
    component: "Orchestrator",
    artifact: "lib/commercial/<name>-post-<prev>-orchestrator-era25.ts",
  },
  { component: "Policy", artifact: "era25-<name>-v1" },
  { component: "Validate", artifact: "scripts/ops/validate-<name>.ts" },
  { component: "UI slice", artifact: "lib/commercial/<name>-ui-era25.ts" },
  { component: "Panel anchor", artifact: "#era25-<name> (new route, not Steps 1–16)" },
  { component: "Workflow", artifact: ".github/workflows/ops-<name>-validate.yml" },
] as const;
