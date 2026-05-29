/**
 * Post-terminus steady state — Step 14 process orchestration (era24).
 * No env attestation gates · repeat Step 12 rhythms forever.
 */
import { CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

/** Inline paths — avoid maintenance-mode / sustained-product-evolution import cycles. */
const MAINTENANCE_MODE_STEP12_DOC =
  "docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md" as const;
const SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC =
  "docs/next-step-11-sustained-product-evolution-2026-05-28.md" as const;
const MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH =
  "artifacts/maintenance-mode-playbook-report.md" as const;

export const POST_TERMINUS_STEADY_STATE_PHASES_ERA24_POLICY_ID =
  "era24-post-terminus-steady-state-phases-v1" as const;

export const POST_TERMINUS_STEADY_STATE_STEP14_DOC =
  "docs/next-step-14-post-terminus-era-charter-process-2026-05-28.md" as const;

export const POST_TERMINUS_STEADY_STATE_REPORT_PATH =
  "artifacts/steady-state-operator-loop-report.md" as const;

export const ERA_CHARTER_READINESS_CHECKLIST_PATH =
  "docs/era-charter-readiness-checklist-era24.md" as const;

export const POST_TERMINUS_STEADY_STATE_PLATFORM_ANCHOR =
  "#post-terminus-steady-state" as const;

export const POST_TERMINUS_STEADY_STATE_TRACKED_ENV_KEYS = [
  "POST_TERMINUS_STEADY_STATE_OPERATOR_LOOP_ATTESTED",
  "POST_TERMINUS_STEADY_STATE_ERA_CHARTER_REVIEWED",
] as const;

export function detectPostTerminusSteadyStateStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return POST_TERMINUS_STEADY_STATE_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export type SteadyStateTrackFrequency =
  | "per_release"
  | "weekly"
  | "on_demand";

export type SteadyStateTrackStatusKind = "healthy" | "overdue" | "guidance";

export type SteadyStateTrackDef = {
  id: string;
  label: string;
  frequency: SteadyStateTrackFrequency;
  ownerRole: string;
  docPath: string;
  routes: readonly string[];
  commands: readonly string[];
};

export const STEADY_STATE_RELEASE_TRAIN: readonly string[] = [
  "test:ci:commercial-pilot-runbook:cert",
  "ops:validate-commercial-pilot-path",
  "ops:validate-maintenance-mode",
  "ops:validate-continuous-improvement-loop",
  "ops:validate-sustained-product-evolution",
  "ops:sync-maintenance-mode-playbook-report",
  "ops:sync-commercial-pilot-path-status-report",
  "ops:sync-steady-state-operator-loop-report",
] as const;

export const STEADY_STATE_TRACKS: readonly SteadyStateTrackDef[] = [
  {
    id: "per_release_cert",
    label: "Per release — commercial pilot cert chain",
    frequency: "per_release",
    ownerRole: "engineering",
    docPath: MAINTENANCE_MODE_STEP12_DOC,
    routes: ["/dashboard/implementation"],
    commands: ["test:ci:commercial-pilot-runbook:cert"],
  },
  {
    id: "weekly_master_path",
    label: "Weekly — master commercial pilot path validate",
    frequency: "weekly",
    ownerRole: "ops",
    docPath: POST_TERMINUS_STEADY_STATE_STEP14_DOC,
    routes: [`${SERIES_A_PLATFORM_OPS_ROUTE}#engineering-path-terminus`],
    commands: ["ops:validate-commercial-pilot-path"],
  },
  {
    id: "weekly_maintenance",
    label: "Weekly — maintenance mode rhythms",
    frequency: "weekly",
    ownerRole: "ops",
    docPath: MAINTENANCE_MODE_STEP12_DOC,
    routes: [`${SERIES_A_PLATFORM_OPS_ROUTE}#maintenance-mode`, "/dashboard/today"],
    commands: ["ops:validate-maintenance-mode", "ops:sync-maintenance-mode-playbook-report"],
  },
  {
    id: "weekly_improvement_loop",
    label: "Weekly — continuous improvement loop",
    frequency: "weekly",
    ownerRole: "product",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: [`${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`],
    commands: [
      "ops:validate-continuous-improvement-loop",
      "ops:sync-continuous-improvement-loop-progress-report",
    ],
  },
  {
    id: "weekly_product_evolution",
    label: "Weekly — sustained product evolution",
    frequency: "weekly",
    ownerRole: "product",
    docPath: SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
    routes: [`${SERIES_A_PLATFORM_OPS_ROUTE}#sustained-product-evolution`],
    commands: [
      "ops:validate-sustained-product-evolution",
      "ops:sync-sustained-product-evolution-progress-report",
    ],
  },
  {
    id: "weekly_report_sync",
    label: "Weekly — sync all steady-state artifacts",
    frequency: "weekly",
    ownerRole: "leadership",
    docPath: POST_TERMINUS_STEADY_STATE_STEP14_DOC,
    routes: [SERIES_A_PLATFORM_OPS_ROUTE],
    commands: [
      "ops:sync-commercial-pilot-path-status-report",
      "ops:sync-steady-state-operator-loop-report",
    ],
  },
] as const;

export const ERA_CHARTER_CRITERIA: readonly {
  id: string;
  label: string;
  example: string;
}[] = [
  {
    id: "new_milestone",
    label: "New commercial milestone beyond maintenance",
    example: "Series B, new vertical ICP, enterprise procurement tier",
  },
  {
    id: "written_charter",
    label: "Written charter with new policy IDs",
    example: "era25-* policy + backlog ID KOS-E25-NNN",
  },
  {
    id: "leadership_signoff",
    label: "Explicit decision not to extend era24 rhythms",
    example: "Leadership sign-off documented in charter",
  },
  {
    id: "briefing_scheme",
    label: "New briefing priority scheme documented",
    example: "Separate from era21 priorities 0–8",
  },
  {
    id: "honest_nogo",
    label: "Honest NO-GO until human execution",
    example: "Never fake PASS in artifacts/*.json",
  },
] as const;

export const POST_TERMINUS_STEADY_STATE_GUARDRAILS: readonly string[] = [
  "Never add era25+ gates without explicit new era charter",
  "Never re-open era21 gate chain for steady-state customers",
  "Never merge GO artifacts across customers",
  "Never skip test:ci:commercial-pilot-runbook:cert on release",
  "Never hand-edit PASS in artifacts/*.json",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_PROGRESS_REPORT_PATH =
  "artifacts/continuous-improvement-loop-progress-report.md" as const;

export const COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH =
  "artifacts/commercial-pilot-path-status-report.md" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_PROGRESS_REPORT_PATH =
  "artifacts/sustained-product-evolution-progress-report.md" as const;

export const POST_TERMINUS_STEADY_STATE_SYNC_ARTIFACTS: readonly string[] = [
  MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH,
  COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH,
  CONTINUOUS_IMPROVEMENT_LOOP_PROGRESS_REPORT_PATH,
  SUSTAINED_PRODUCT_EVOLUTION_PROGRESS_REPORT_PATH,
  POST_TERMINUS_STEADY_STATE_REPORT_PATH,
] as const;

export type SteadyStateTrackStatus = SteadyStateTrackDef & {
  status: SteadyStateTrackStatusKind;
  detail: string;
};

export function resolveSteadyStatePrerequisites(input: {
  engineeringTerminusActive: boolean;
}): {
  prerequisitesComplete: boolean;
  steadyStateActive: boolean;
} {
  const steadyStateActive = input.engineeringTerminusActive;
  return {
    prerequisitesComplete: steadyStateActive,
    steadyStateActive,
  };
}

export function buildSteadyStateTrackStatuses(input: {
  maintenanceOverdue: number;
  maintenanceDueSoon: number;
  improvementOverdue: number;
  improvementDueSoon: number;
  productEvolutionOverdue: number;
  productEvolutionDueSoon: number;
}): SteadyStateTrackStatus[] {
  return STEADY_STATE_TRACKS.map((track) => {
    if (track.id === "per_release_cert") {
      return {
        ...track,
        status: "guidance",
        detail: "Run on every release — SKIPPED ≠ PASS",
      };
    }
    if (track.id === "weekly_master_path") {
      return {
        ...track,
        status: "guidance",
        detail: "Master orchestration — honest JSON, never fake PASS",
      };
    }
    if (track.id === "weekly_maintenance") {
      if (input.maintenanceOverdue > 0) {
        return {
          ...track,
          status: "overdue",
          detail: `${input.maintenanceOverdue} maintenance rhythm(s) overdue`,
        };
      }
      if (input.maintenanceDueSoon > 0) {
        return {
          ...track,
          status: "healthy",
          detail: `${input.maintenanceDueSoon} maintenance rhythm(s) due soon — on track`,
        };
      }
      return { ...track, status: "healthy", detail: "Maintenance rhythms healthy" };
    }
    if (track.id === "weekly_improvement_loop") {
      if (input.improvementOverdue > 0) {
        return {
          ...track,
          status: "overdue",
          detail: `${input.improvementOverdue} improvement track(s) overdue`,
        };
      }
      if (input.improvementDueSoon > 0) {
        return {
          ...track,
          status: "healthy",
          detail: `${input.improvementDueSoon} improvement track(s) due soon`,
        };
      }
      return { ...track, status: "healthy", detail: "Improvement loop tracks healthy" };
    }
    if (track.id === "weekly_product_evolution") {
      if (input.productEvolutionOverdue > 0) {
        return {
          ...track,
          status: "overdue",
          detail: `${input.productEvolutionOverdue} product evolution track(s) overdue`,
        };
      }
      if (input.productEvolutionDueSoon > 0) {
        return {
          ...track,
          status: "healthy",
          detail: `${input.productEvolutionDueSoon} product evolution track(s) due soon`,
        };
      }
      return { ...track, status: "healthy", detail: "Product evolution tracks healthy" };
    }
    return {
      ...track,
      status: "guidance",
      detail: `Sync artifacts: ${POST_TERMINUS_STEADY_STATE_SYNC_ARTIFACTS.slice(0, 3).join(", ")}…`,
    };
  });
}

export function resolveSteadyStateHealthSummary(tracks: readonly SteadyStateTrackStatus[]): {
  healthyCount: number;
  overdueCount: number;
  guidanceCount: number;
} {
  return {
    healthyCount: tracks.filter((track) => track.status === "healthy").length,
    overdueCount: tracks.filter((track) => track.status === "overdue").length,
    guidanceCount: tracks.filter((track) => track.status === "guidance").length,
  };
}

export function resolveNextSteadyStateAttentionTrack(
  tracks: readonly SteadyStateTrackStatus[],
): SteadyStateTrackStatus | null {
  return tracks.find((track) => track.status === "overdue") ?? null;
}

export function formatSteadyStateTrackDetail(track: SteadyStateTrackStatus): string {
  return `${track.label} · ${track.detail}`;
}
