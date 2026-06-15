/**
 * era25 Paid Pilot GO Convergence — phases and convergence requirements.
 * Policy: era25-paid-pilot-go-convergence-v1
 */
export const PAID_PILOT_GO_CONVERGENCE_ERA25_PHASES_POLICY_ID =
  "era25-paid-pilot-go-convergence-phases-v1" as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_DOC =
  "docs/next-era25-paid-pilot-go-convergence-2026-05-28.md" as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH =
  "artifacts/paid-pilot-go-convergence-era25-report.md" as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR =
  "#era25-paid-pilot-go-convergence" as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_TRACKED_ENV_KEYS = [
  "PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED",
  "PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_REVIEWED",
] as const;

export function detectPaidPilotGoConvergenceEra25Started(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return PAID_PILOT_GO_CONVERGENCE_ERA25_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const PAID_PILOT_GO_CONVERGENCE_ERA25_BACKLOG_ID = "KOS-E25-002-PILOT-GO" as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC =
  "docs/era25-paid-pilot-kickoff-checklist-2026-05-28.md" as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS: readonly {
  id: string;
  label: string;
  surface: string;
}[] = [
  { id: "b3_tile", label: "B3 breakthrough tile live GO data", surface: "Today breakthrough panel" },
  {
    id: "briefing_action",
    label: "Briefing ranked action on NO-GO",
    surface: "Owner Daily Briefing hero",
  },
  {
    id: "launch_wizard",
    label: "Launch Wizard inline GO/NO-GO",
    surface: "/dashboard/launch-wizard",
  },
  {
    id: "platform_ops",
    label: "Platform ops convergence panel",
    surface: "Commercial pilot ops",
  },
] as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS: readonly string[] = [
  "Never fake GO in artifacts/pilot-gono-go-summary.json",
  "Never ship before owner_daily_briefing_breakthrough_era25_ready",
  "Never skip ICP qualification in evaluator",
  "Never skip pre-sales forbidden-claims enforcement smoke",
  "Never re-open era21 gate chain for steady-state customers",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-paid-pilot-go-convergence-era25",
  "ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25",
  "ops:validate-owner-daily-briefing-breakthrough-era25",
  "smoke:pilot-gono-go",
  "smoke:pilot-forbidden-claims-enforcement",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS: readonly string[] = [
  "Achieve owner_daily_briefing_breakthrough_era25_ready",
  "Qualify ICP — set PILOT_ICP_* env and re-run smoke:pilot-gono-go",
  "Record PILOT_GONOGO_CUSTOMER_NAME + PILOT_GONOGO_LOI_SIGNED_DATE",
  "Pass smoke:pilot-forbidden-claims-enforcement",
  "Leadership sign-off on era25-paid-pilot-kickoff-checklist",
] as const;
