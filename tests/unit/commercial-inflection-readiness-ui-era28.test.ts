import { describe, expect, it } from "vitest";

import {
  buildCommercialInflectionReadinessUiSlice,
  COMMERCIAL_INFLECTION_READINESS_UI_ERA28_POLICY_ID,
  formatCommercialInflectionScorecardLabel,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";

describe("commercial-inflection-readiness-ui-era28", () => {
  it("builds blocked slice locally with honest registry LIVE counts", () => {
    const summary = evaluateCommercialInflectionReadiness({});
    const slice = buildCommercialInflectionReadinessUiSlice(summary);
    expect(slice?.policyId).toBe(COMMERCIAL_INFLECTION_READINESS_UI_ERA28_POLICY_ID);
    expect(slice?.milestone).toBe("p0_ops_vault_blocked");
    expect(slice?.p0VaultMissingCount).toBe(11);
    expect(slice?.integrationRegistryLiveCount).toBe(0);
    expect(slice?.platformOpsHref).toContain("#commercial-inflection-readiness");
    expect(slice?.integrationHealthHref).toContain("#integration-health-commercial-inflection");
  });

  it("formats scorecard label", () => {
    const slice = buildCommercialInflectionReadinessUiSlice();
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatCommercialInflectionScorecardLabel(slice)).toContain("Pilot");
    expect(formatCommercialInflectionScorecardLabel(slice)).toContain("Governance");
  });
});
