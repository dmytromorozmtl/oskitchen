import { describe, expect, it } from "vitest";

import {
  buildLinearChainTerminusGuardUiSlice,
  formatLinearChainTerminusGuardLabel,
} from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";

describe("linear-chain-terminus-guard-ui-era24", () => {
  it("returns null when terminal closure inactive", () => {
    expect(buildLinearChainTerminusGuardUiSlice({ terminalClosureActive: false })).toBeNull();
  });

  it("builds slice when terminal closure active", () => {
    const slice = buildLinearChainTerminusGuardUiSlice({ terminalClosureActive: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.step17Forbidden).toBe(true);
    expect(slice?.maxLinearStep).toBe(16);
    expect(slice?.postLinearPathClosedOrchestratorCommand).toContain(
      "run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator",
    );
    expect(slice?.linearChainTerminusGuardMilestone).toBe("era25_sustained_ops_convergence_blocked");
    expect(slice?.guardPassed).toBe(true);
    expect(slice?.era25CharterExit).not.toBeNull();
    expect(slice?.era25CharterExit?.outsideLinearCatalog).toBe(true);
    expect(slice?.integrityValidateCommand).toBe(
      "npm run ops:validate-linear-chain-terminus-guard-integrity -- --json",
    );
    expect(slice?.launchWizardHref).toContain("#launch-wizard-linear-chain-terminus-guard");
  });

  it("formats guard label", () => {
    const slice = buildLinearChainTerminusGuardUiSlice({ terminalClosureActive: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatLinearChainTerminusGuardLabel(slice)).toContain("Step 17 FORBIDDEN");
    expect(formatLinearChainTerminusGuardLabel(slice)).toContain("guard PASS");
  });
});
