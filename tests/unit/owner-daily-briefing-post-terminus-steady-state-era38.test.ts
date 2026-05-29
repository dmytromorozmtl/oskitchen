import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingPostTerminusSteadyStateAction,
  POST_TERMINUS_STEADY_STATE_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-post-terminus-steady-state-era38";
import type { PostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";

const baseSlice = {
  policyId: "era24-post-terminus-steady-state-ui-v1",
  visible: true,
  steadyStateActive: true,
  engineeringTerminusActive: true,
  goDecision: "GO",
  tracks: [
    {
      id: "weekly_maintenance",
      label: "Weekly — maintenance mode rhythms",
      frequency: "weekly" as const,
      ownerRole: "ops",
      docPath: "docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md",
      routes: ["/platform/commercial-pilot-ops#maintenance-mode"],
      commands: ["ops:validate-maintenance-mode"],
      status: "overdue" as const,
      detail: "maintenance overdue",
    },
  ],
  releaseTrain: [],
  eraCharterCriteria: [],
  guardrails: [],
  healthyCount: 0,
  overdueCount: 1,
  guidanceCount: 0,
  nextAttentionTrack: {
    id: "weekly_maintenance",
    label: "Weekly — maintenance mode rhythms",
    frequency: "weekly" as const,
    ownerRole: "ops",
    docPath: "docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md",
    routes: ["/platform/commercial-pilot-ops#maintenance-mode"],
    commands: ["ops:validate-maintenance-mode"],
    status: "overdue" as const,
    detail: "maintenance overdue",
  },
  step14Doc: "docs/next-step-14-post-terminus-era-charter-process-2026-05-28.md",
  validateCommand: "npm run ops:validate-steady-state-operator-loop",
  postEngineeringTerminusOrchestratorCommand:
    "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
  validateEngineeringPathTerminusCommand: "npm run ops:validate-commercial-pilot-path -- --json",
  validateEngineeringPathTerminusIntegrityCommand:
    "npm run ops:validate-engineering-path-terminus-integrity -- --json",
  integrityValidateCommand: "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
  syncIntegrityBaselineCommand:
    "npm run ops:sync-post-terminus-steady-state-integrity-baseline -- --write",
  postTerminusSteadyStateIntegrityPassed: false,
  engineeringPathTerminusIntegrityPassed: true,
  steadyStateMilestone: "attention_maintenance_rhythm",
  engineeringPathTerminusMilestone: "engineering_path_terminus_healthy",
  sustainedOpsConvergenceReady: true,
  pureOperationalModeEra25Active: true,
  productEvolutionReady: true,
  maintenanceModeMilestone: "maintenance_mode_healthy",
  pureOperationalModeTerminusHref: "/platform/commercial-pilot-ops#pure-operational-mode-terminus-era25",
  syncReportCommand: "npm run ops:sync-steady-state-operator-loop-report -- --write",
  exportEraCharterChecklistCommand: "npm run ops:export-era-charter-readiness-checklist -- --write",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-post-terminus-steady-state",
  platformOpsHref: "/platform/commercial-pilot-ops#post-terminus-steady-state",
  absolutePathEnd: null,
} as PostTerminusSteadyStateUiSlice;

describe("owner-daily-briefing-post-terminus-steady-state-era38", () => {
  it("builds ranked action with priority 13", () => {
    const action = buildOwnerDailyBriefingPostTerminusSteadyStateAction(baseSlice);
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(POST_TERMINUS_STEADY_STATE_BRIEFING_ACTION_PRIORITY);
    expect(action!.severity).toBe("high");
    expect(action!.href).toBe("/platform/commercial-pilot-ops#maintenance-mode");
  });
});
