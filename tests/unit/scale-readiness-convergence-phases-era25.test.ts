import { describe, expect, it } from "vitest";

import {
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SCALE_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";

describe("scale-readiness-convergence-phases-era25", () => {
  it("locks phases policy id", () => {
    expect(SCALE_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID).toBe(
      "era25-scale-readiness-convergence-phases-v1",
    );
  });

  it("defines platform anchor", () => {
    expect(SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-scale-readiness-convergence",
    );
  });

  it("documents convergence slice doc", () => {
    expect(SCALE_READINESS_CONVERGENCE_ERA25_DOC).toContain("scale-readiness-convergence");
  });
});
