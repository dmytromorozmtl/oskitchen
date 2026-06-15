import { describe, expect, it } from "vitest";

import {
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_PROOF_STATUS,
} from "@/lib/production/production-calendar-operator-drill-era17-policy";

describe("production calendar operator drill era17 policy", () => {
  it("locks era17 production calendar operator drill policy id", () => {
    expect(PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID).toBe(
      "era17-production-calendar-operator-drill-v1",
    );
  });

  it("awaits staging operator drill — not manually certified yet", () => {
    expect(PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_PROOF_STATUS).toBe(
      "awaiting_staging_operator_drill",
    );
  });
});
