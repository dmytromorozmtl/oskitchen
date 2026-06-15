import { describe, expect, it } from "vitest";

import type { Era25CharterExitUiSlice } from "@/lib/commercial/era25-charter-exit-ui-era24";
import {
  buildLaunchWizardEra25CharterExitSlice,
  launchWizardEra25CharterExitHref,
} from "@/lib/launch-wizard/launch-wizard-era25-charter-exit-era42";

const charterExitWithIntegrityFlags = {
  policyId: "era24-era25-charter-exit-outside-linear-path-ui-v1",
  visible: true,
  outsideLinearCatalog: true,
  guardPassed: true,
  charterChecklistPresent: true,
  signedCharterPresent: false,
  era25CharterDocCount: 3,
  goDecision: "GO",
  era25CharterExitMilestone: "linear_path_closure_blocked",
  linearChainTerminusGuardMilestone: "linear_path_closure_blocked",
  criteriaCount: 5,
  guardrails: [],
  humanSteps: [],
  criteria: [] as Era25CharterExitUiSlice["criteria"],
  processDoc: "docs/era25-charter-exit-outside-linear-path.md",
  charterDocGlobHint: "docs/era25-charter-*.md",
  charterChecklistPath: "docs/era-charter-readiness-checklist.md",
  foreverCommands: [],
  validateCommand: "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
  postTerminusGuardOrchestratorCommand:
    "npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write",
  validateLinearChainTerminusGuardIntegrityCommand:
    "npm run ops:validate-linear-chain-terminus-guard-integrity -- --json",
  integrityValidateCommand: "npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json",
  syncIntegrityBaselineCommand:
    "npm run ops:sync-era25-charter-exit-outside-linear-path-integrity-baseline -- --write",
  era25CharterExitIntegrityPassed: false,
  linearChainTerminusGuardIntegrityPassed: true,
  syncReportCommand: "npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write",
  exportCharterChecklistCommand: "npm run ops:export-era-charter-readiness-checklist -- --write",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-era25-charter-exit",
  platformOpsHref: "/platform/commercial-pilot-ops#era25-charter-exit",
  firstCharterSliceReadiness: null,
} satisfies Era25CharterExitUiSlice;

describe("launch-wizard-era25-charter-exit-era42", () => {
  it("builds slice when charter exit train active with integrity flags", () => {
    const slice = buildLaunchWizardEra25CharterExitSlice(charterExitWithIntegrityFlags, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("outside linear");
    expect(slice!.era25CharterExitIntegrityFailed).toBe(true);
    expect(launchWizardEra25CharterExitHref()).toContain("#launch-wizard-era25-charter-exit");
  });
});
