import { describe, expect, it } from "vitest";

import {
  ERA20_PILOT_EXECUTION_READINESS_BACKLOG_ID,
  ERA20_PILOT_EXECUTION_READINESS_CI_SCRIPTS,
  ERA20_PILOT_EXECUTION_READINESS_POLICY_ID,
  ERA20_PILOT_EXECUTION_READINESS_UNIT_TESTS,
} from "@/lib/commercial/era20-pilot-execution-readiness-policy";

describe("era20-pilot-execution-readiness-cert-live", () => {
  it("locks era20 pilot execution readiness cert bundle", () => {
    expect(ERA20_PILOT_EXECUTION_READINESS_POLICY_ID).toBe("era20-pilot-execution-readiness-v1");
    expect(ERA20_PILOT_EXECUTION_READINESS_BACKLOG_ID).toBe("KOS-E20-009");
    expect(ERA20_PILOT_EXECUTION_READINESS_UNIT_TESTS).toHaveLength(2);
    expect(ERA20_PILOT_EXECUTION_READINESS_CI_SCRIPTS).toContain(
      "test:ci:era20-pilot-execution-readiness",
    );
  });
});
