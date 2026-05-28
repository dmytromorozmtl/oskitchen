import { describe, expect, it } from "vitest";

import {
  OPERATIONAL_SIGNOFF_ERA16_HONEST_SCOPE,
  OPERATIONAL_SIGNOFF_ERA16_POLICY_ID,
  OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS,
  OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT,
} from "@/lib/operations/operational-signoff-era16-policy";

describe("operational signoff era16 policy", () => {
  it("locks era16 policy id and honest scope", () => {
    expect(OPERATIONAL_SIGNOFF_ERA16_POLICY_ID).toBe("era16-operational-signoff-v1");
    expect(OPERATIONAL_SIGNOFF_ERA16_HONEST_SCOPE.rushHourKdsCertified).toBe(false);
    expect(OPERATIONAL_SIGNOFF_ERA16_HONEST_SCOPE.inDefaultCi).toBe(false);
  });

  it("covers KDS and production calendar subsystems", () => {
    expect(OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS.map((s) => s.id)).toEqual([
      "kds",
      "production_calendar",
    ]);
    expect(OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT).toBe(
      "artifacts/operational-signoff-summary.json",
    );
  });
});
