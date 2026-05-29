/**
 * era25+ charter exit — outside linear catalog (era24 process slice).
 * NOT Step 18 · NOT in COMMERCIAL_PILOT_PATH_STEP_CATALOG.
 */
import {
  ERA_CHARTER_CRITERIA,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_PHASES_ERA24_POLICY_ID =
  "era24-era25-charter-exit-outside-linear-path-phases-v1" as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC =
  "docs/next-era25-charter-exit-outside-linear-path-2026-05-28.md" as const;

export const ERA25_CHARTER_EXIT_REPORT_PATH =
  "artifacts/era25-charter-exit-outside-linear-path-report.md" as const;

export const ERA25_CHARTER_EXIT_PLATFORM_ANCHOR =
  "#era25-charter-exit-outside-linear-path" as const;

/** Glob pattern for human-written era25 charter docs (outside linear chain). */
export const ERA25_CHARTER_DOC_GLOB_HINT = "docs/era25-*-charter-2026-*.md" as const;

export const ERA25_CHARTER_EXIT_GUARDRAILS: readonly string[] = [
  "Never add Step 18+ to the linear doc chain",
  "Never add era25 panels without signed charter doc",
  "Never extend COMMERCIAL_PILOT_PATH_STEP_CATALOG beyond 16 steps",
  "Never add era25+ gates without explicit new era charter",
  "Never re-open era21 gate chain for steady-state customers",
  "Never merge GO artifacts across customers",
  "Never skip test:ci:commercial-pilot-runbook:cert on release",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const ERA25_CHARTER_EXIT_FOREVER_COMMANDS: readonly string[] = [
  "test:ci:commercial-pilot-runbook:cert",
  "ops:validate-era25-charter-exit-outside-linear-path",
  "ops:run-era25-charter-exit-post-terminus-guard-orchestrator",
  "ops:validate-linear-chain-terminus-guard",
  "ops:export-era-charter-readiness-checklist",
  "ops:sync-era25-charter-exit-outside-linear-path-report",
] as const;

export const ERA25_CHARTER_EXIT_HUMAN_STEPS: readonly string[] = [
  "Leadership sign-off — explicit decision not to extend era24 rhythms",
  "npm run ops:export-era-charter-readiness-checklist -- --write",
  "Write docs/era25-<name>-charter-2026-*.md with ALL criteria signed",
  "New era25-* policies + backlog KOS-E25-NNN — outside Steps 1–16",
  "Honest NO-GO until human execution",
] as const;

export { ERA_CHARTER_CRITERIA, ERA_CHARTER_READINESS_CHECKLIST_PATH };
