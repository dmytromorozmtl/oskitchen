import { describe, expect, it } from "vitest";

import {
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_PROOF_STATUS,
} from "@/lib/commercial/pilot-operator-golden-path-era17-policy";

describe("pilot operator golden path era17 policy", () => {
  it("locks era17 pilot operator golden path policy id", () => {
    expect(PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID).toBe(
      "era17-pilot-operator-golden-path-v1",
    );
  });

  it("does not claim operator execution without staging evidence", () => {
    expect(PILOT_OPERATOR_GOLDEN_PATH_ERA17_PROOF_STATUS).toBe("awaiting_operator_execution");
  });

  it("defines six tier 2 phases aligned with commercial runbook", () => {
    expect(PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES).toHaveLength(6);
    expect(PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES.map((phase) => phase.id)).toEqual([
      "onboarding",
      "orders",
      "storefront",
      "integrations",
      "pos",
      "kds",
    ]);
  });
});
