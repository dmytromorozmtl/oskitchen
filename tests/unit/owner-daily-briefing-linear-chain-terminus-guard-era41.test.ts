import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingLinearChainTerminusGuardAction,
  LINEAR_CHAIN_TERMINUS_GUARD_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-linear-chain-terminus-guard-era41";
import type { LinearChainTerminusGuardUiSlice } from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";

const baseSlice = {
  policyId: "era24-linear-chain-terminus-guard-ui-v1",
  visible: true,
  step17Forbidden: true,
  guardPassed: true,
  maxLinearStep: 16,
  catalogStepCount: 16,
  violationCount: 0,
  goDecision: "GO",
  linearChainTerminusGuardMilestone: "linear_path_closure_blocked",
  linearPathPermanentlyClosedMilestone: "absolute_end_blocked",
  forbiddenProposals: [],
  foreverCommands: [],
  step17ForbiddenDoc: "docs/next-step-17-forbidden-linear-chain-terminus-2026-05-28.md",
  validateCommand: "npm run ops:validate-linear-chain-terminus-guard -- --json",
  postLinearPathClosedOrchestratorCommand:
    "npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write",
  validateLinearPathPermanentlyClosedIntegrityCommand:
    "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
  integrityValidateCommand: "npm run ops:validate-linear-chain-terminus-guard-integrity -- --json",
  syncIntegrityBaselineCommand:
    "npm run ops:sync-linear-chain-terminus-guard-integrity-baseline -- --write",
  linearChainTerminusGuardIntegrityPassed: false,
  linearPathPermanentlyClosedIntegrityPassed: true,
  syncReportCommand: "npm run ops:sync-linear-chain-terminus-guard-report -- --write",
  exportEraCharterChecklistCommand: "npm run ops:export-era-charter-readiness-checklist -- --write",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-linear-chain-terminus-guard",
  platformOpsHref: "/platform/commercial-pilot-ops#linear-chain-step17-forbidden",
  era25CharterExit: null,
} as LinearChainTerminusGuardUiSlice;

describe("owner-daily-briefing-linear-chain-terminus-guard-era41", () => {
  it("builds ranked action with priority 16", () => {
    const action = buildOwnerDailyBriefingLinearChainTerminusGuardAction(baseSlice);
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(LINEAR_CHAIN_TERMINUS_GUARD_BRIEFING_ACTION_PRIORITY);
    expect(action!.severity).toBe("high");
    expect(action!.href).toBe("/platform/commercial-pilot-ops#linear-chain-step17-forbidden");
  });
});
