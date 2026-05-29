import { describe, expect, it } from "vitest";

import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  detectPilotWeek1ExecutionConvergenceEra25Started,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";

describe("pilot-week1-execution-convergence-phases-era25", () => {
  it("locks phases policy id", () => {
    expect(PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PHASES_POLICY_ID).toBe(
      "era25-pilot-week1-execution-convergence-phases-v1",
    );
  });

  it("defines platform anchor", () => {
    expect(PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-pilot-week1-execution-convergence",
    );
  });

  it("documents convergence slice doc", () => {
    expect(PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC).toContain(
      "pilot-week1-execution-convergence",
    );
  });

  it("detects week 1 train started from env keys", () => {
    expect(detectPilotWeek1ExecutionConvergenceEra25Started({})).toBe(false);
    expect(
      detectPilotWeek1ExecutionConvergenceEra25Started({
        PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED: "1",
      }),
    ).toBe(true);
    expect(
      detectPilotWeek1ExecutionConvergenceEra25Started({
        PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      }),
    ).toBe(true);
  });
});
