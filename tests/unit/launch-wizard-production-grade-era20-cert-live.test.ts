import { describe, expect, it } from "vitest";

import {
  LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_BACKLOG_ID,
  LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_CI_SCRIPTS,
  LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID,
  LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_UNIT_TESTS,
} from "@/lib/launch-wizard/launch-wizard-production-grade-era20-policy";

describe("launch-wizard-production-grade-era20-cert-live", () => {
  it("locks era20 launch wizard production-grade cert bundle", () => {
    expect(LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID).toBe(
      "era20-launch-wizard-production-grade-v1",
    );
    expect(LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_BACKLOG_ID).toBe("KOS-E20-008");
    expect(LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_UNIT_TESTS).toHaveLength(2);
    expect(LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_CI_SCRIPTS).toContain(
      "test:ci:launch-wizard-production-grade-era20",
    );
  });
});
