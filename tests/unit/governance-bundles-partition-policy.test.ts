import { describe, expect, it } from "vitest";

import {
  GOVERNANCE_BUNDLES_FULL_COMPOSITION,
  GOVERNANCE_BUNDLES_PARTITIONS,
  GOVERNANCE_BUNDLES_PARTITION_POLICY_ID,
} from "@/lib/ci/governance-bundles-partition-policy";

describe("governance bundles partition policy", () => {
  it("locks era9 governance bundles partition policy", () => {
    expect(GOVERNANCE_BUNDLES_PARTITION_POLICY_ID).toBe(
      "era9-governance-bundles-partition-v1",
    );
    expect(GOVERNANCE_BUNDLES_PARTITIONS).toHaveLength(4);
  });

  it("composes four partition npm scripts in order", () => {
    expect(GOVERNANCE_BUNDLES_FULL_COMPOSITION).toContain(
      "npm run test:ci:governance-bundles:partition-platform",
    );
    expect(GOVERNANCE_BUNDLES_FULL_COMPOSITION).toContain(
      "npm run test:ci:governance-bundles:partition-product-kds",
    );
    expect(GOVERNANCE_BUNDLES_FULL_COMPOSITION.split(" && ")).toHaveLength(4);
  });
});
