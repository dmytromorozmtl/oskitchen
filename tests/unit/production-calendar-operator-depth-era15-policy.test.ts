import { describe, expect, it } from "vitest";

import {
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_HONEST_SCOPE,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_IN_DEFAULT_CI,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID,
} from "@/lib/production/production-calendar-operator-depth-era15-policy";

describe("production calendar operator depth era15 policy", () => {
  it("locks era15 production calendar operator recert policy id", () => {
    expect(PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID).toBe(
      "era15-production-calendar-operator-recert-v1",
    );
    expect(PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_IN_DEFAULT_CI).toBe(false);
    expect(PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_HONEST_SCOPE.notDragAndDrop).toBe(
      true,
    );
    expect(
      PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_HONEST_SCOPE.notRushHourProductionCertified,
    ).toBe(true);
  });
});
