import { describe, expect, it } from "vitest";

import {
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_ACTIONS,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_POLICY_ID,
} from "@/lib/production/production-calendar-operator-depth-era13-policy";

describe("production calendar operator depth era13 policy", () => {
  it("locks era13 production calendar operator depth policy id", () => {
    expect(PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_POLICY_ID).toBe(
      "era13-production-calendar-operator-depth-v1",
    );
  });

  it("lists certified server actions", () => {
    expect(PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_ACTIONS).toEqual([
      "createPlanTaskAction",
      "movePlanTaskAction",
      "updatePlanTaskStatusAction",
    ]);
  });
});
