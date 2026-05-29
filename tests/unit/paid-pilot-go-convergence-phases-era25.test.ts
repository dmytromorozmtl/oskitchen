import { describe, expect, it } from "vitest";

import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";

describe("paid-pilot-go-convergence-phases-era25", () => {
  it("locks phases policy id", () => {
    expect(PAID_PILOT_GO_CONVERGENCE_ERA25_PHASES_POLICY_ID).toBe(
      "era25-paid-pilot-go-convergence-phases-v1",
    );
  });

  it("defines platform anchor", () => {
    expect(PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-paid-pilot-go-convergence",
    );
  });

  it("documents convergence slice doc", () => {
    expect(PAID_PILOT_GO_CONVERGENCE_ERA25_DOC).toContain("paid-pilot-go-convergence");
  });

  it("references kickoff checklist doc", () => {
    expect(PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC).toContain(
      "era25-paid-pilot-kickoff-checklist",
    );
  });
});
