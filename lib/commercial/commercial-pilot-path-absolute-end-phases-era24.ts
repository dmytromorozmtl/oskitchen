/**
 * Commercial pilot path absolute end — Step 15 closure orchestration (era24).
 * No env attestation gates · linear path engineering closed.
 */
import { POST_TERMINUS_STEADY_STATE_STEP14_DOC } from "@/lib/commercial/post-terminus-steady-state-phases-era24";

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PHASES_ERA24_POLICY_ID =
  "era24-commercial-pilot-path-absolute-end-phases-v1" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC =
  "docs/next-step-15-commercial-pilot-path-absolute-end-2026-05-28.md" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH =
  "artifacts/commercial-pilot-path-absolute-end-report.md" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PLATFORM_ANCHOR =
  "#commercial-pilot-path-absolute-end" as const;

export type PathAbsoluteEndLayer = {
  step: number;
  label: string;
  policyId: string;
  role: string;
};

export const PATH_ABSOLUTE_END_LAYERS: readonly PathAbsoluteEndLayer[] = [
  {
    step: 12,
    label: "Maintenance mode",
    policyId: "era24-maintenance-mode-v1",
    role: "UI terminus",
  },
  {
    step: 13,
    label: "Engineering path terminus",
    policyId: "era24-engineering-path-terminus-v1",
    role: "Master path orchestration",
  },
  {
    step: 14,
    label: "Post-terminus steady state",
    policyId: "era24-post-terminus-steady-state-v1",
    role: "Repeat forever loop",
  },
  {
    step: 15,
    label: "Commercial pilot path absolute end",
    policyId: "era24-commercial-pilot-path-absolute-end-v1",
    role: "Linear engineering closed",
  },
] as const;

export type SteadyStateProductSurface = {
  id: string;
  label: string;
  route: string;
  rhythm: string;
  linkedFeature: string;
};

export const STEADY_STATE_PRODUCT_SURFACES: readonly SteadyStateProductSurface[] = [
  {
    id: "shift_command",
    label: "Shift command",
    route: "/dashboard/today",
    rhythm: "Daily",
    linkedFeature: "Owner briefing + maintenance compact panel",
  },
  {
    id: "order_pipeline",
    label: "Order pipeline",
    route: "/dashboard/order-hub",
    rhythm: "Daily",
    linkedFeature: "Channel → kitchen handoffs",
  },
  {
    id: "production_prep",
    label: "Production prep",
    route: "/dashboard/production-calendar",
    rhythm: "Daily",
    linkedFeature: "Service window prep",
  },
  {
    id: "integration_drift",
    label: "Integration drift",
    route: "/dashboard/integration-health",
    rhythm: "Weekly Wed",
    linkedFeature: "Woo/Shopify health",
  },
  {
    id: "metrics",
    label: "Metrics",
    route: "/dashboard/reports",
    rhythm: "Monthly",
    linkedFeature: "Per-customer baseline",
  },
  {
    id: "rollout_maturity",
    label: "Rollout maturity",
    route: "/dashboard/implementation",
    rhythm: "Monthly",
    linkedFeature: "Feature maturity matrix",
  },
  {
    id: "new_pilot",
    label: "New paid pilot",
    route: "/dashboard/launch-wizard",
    rhythm: "Per prospect",
    linkedFeature: "era21 gate chain for new prospects only",
  },
] as const;

export const PATH_ABSOLUTE_END_FOREVER_COMMANDS: readonly string[] = [
  "test:ci:commercial-pilot-runbook:cert",
  "ops:validate-steady-state-operator-loop",
  "ops:validate-maintenance-mode",
  "ops:validate-commercial-pilot-path-absolute-end",
  "ops:sync-steady-state-operator-loop-report",
  "ops:sync-commercial-pilot-path-absolute-end-report",
] as const;

export const PATH_ABSOLUTE_END_GUARDRAILS: readonly string[] = [
  "Never add Step 16+ to this linear doc chain without a new era number",
  "Never re-open era21 gate chain (Steps 1–9) for steady-state customers",
  "Never add era25+ panels without explicit era charter",
  "Never merge GO artifacts across customers",
  "Never skip test:ci:commercial-pilot-runbook:cert on release",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const PATH_ABSOLUTE_END_ERA25_EXIT: readonly string[] = [
  "npm run ops:export-era-charter-readiness-checklist -- --write",
  "Write docs/era25-<name>-charter-2026-*.md with ALL criteria signed",
  "New policy IDs era25-* — outside Steps 1–15",
  "Honest NO-GO until human execution",
] as const;

export function resolveCommercialPilotPathAbsoluteEndPrerequisites(input: {
  steadyStateActive: boolean;
}): {
  prerequisitesComplete: boolean;
  absoluteEndActive: boolean;
  pathEngineeringClosed: boolean;
} {
  return {
    prerequisitesComplete: input.steadyStateActive,
    absoluteEndActive: input.steadyStateActive,
    pathEngineeringClosed: true,
  };
}

export function formatPathAbsoluteEndDetail(input: {
  absoluteEndActive: boolean;
  completedSteps: number;
  totalSteps: number;
  goDecision: string | null;
}): string {
  if (!input.absoluteEndActive) {
    return "Complete Step 14 steady state first";
  }
  return `Linear path closed · ${input.completedSteps}/${input.totalSteps} steps · GO ${input.goDecision ?? "missing"} · era25+ requires charter`;
}

export const PATH_ABSOLUTE_END_STEP14_DOC = POST_TERMINUS_STEADY_STATE_STEP14_DOC;
