import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingLinearPathPermanentlyClosedAction,
  LINEAR_PATH_PERMANENTLY_CLOSED_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-linear-path-permanently-closed-era40";
import type { LinearPathPermanentlyClosedUiSlice } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";

const baseSlice = {
  policyId: "era24-linear-path-permanently-closed-ui-v1",
  visible: true,
  terminalClosureActive: true,
  linearPathPermanentlyClosed: true,
  docChainSteps: 16,
  goDecision: "GO",
  completedSteps: 12,
  totalSteps: 16,
  forbiddenActions: [],
  era25ExitSteps: [],
  foreverCommands: [],
  step16Doc: "docs/next-step-16-linear-path-permanently-closed-2026-05-28.md",
  validateCommand: "npm run ops:validate-linear-path-permanently-closed -- --json",
  postAbsoluteEndOrchestratorCommand:
    "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
  validateCommercialPilotPathAbsoluteEndIntegrityCommand:
    "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
  integrityValidateCommand:
    "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
  syncIntegrityBaselineCommand:
    "npm run ops:sync-linear-path-permanently-closed-integrity-baseline -- --write",
  linearPathPermanentlyClosedIntegrityPassed: false,
  commercialPilotPathAbsoluteEndIntegrityPassed: true,
  syncReportCommand: "npm run ops:sync-linear-path-permanently-closed-report -- --write",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-linear-path-permanently-closed",
  platformOpsHref: "/platform/commercial-pilot-ops#linear-path-permanently-closed",
  linearPathPermanentlyClosedMilestone: "absolute_end_blocked",
  missingDocChainDocCount: 0,
  terminusGuardPassed: true,
  step17ForbiddenDoc: "docs/next-step-17-forbidden-linear-chain-terminus-2026-05-28.md",
  terminusGuardValidateCommand: "npm run ops:validate-linear-chain-terminus-guard -- --json",
  step17Forbidden: null,
} as LinearPathPermanentlyClosedUiSlice;

describe("owner-daily-briefing-linear-path-permanently-closed-era40", () => {
  it("builds ranked action with priority 15", () => {
    const action = buildOwnerDailyBriefingLinearPathPermanentlyClosedAction(baseSlice);
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(LINEAR_PATH_PERMANENTLY_CLOSED_BRIEFING_ACTION_PRIORITY);
    expect(action!.severity).toBe("high");
    expect(action!.href).toBe("/platform/commercial-pilot-ops#linear-path-permanently-closed");
  });
});
