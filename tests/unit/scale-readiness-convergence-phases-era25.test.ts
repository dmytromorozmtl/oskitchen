import { describe, expect, it } from "vitest";

import {
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SCALE_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  SCALE_READINESS_CONVERGENCE_ERA25_TRACKED_ENV_KEYS,
  detectScaleReadinessConvergenceEra25Started,
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

  it("tracks era25 scale convergence attestation env keys", () => {
    expect(SCALE_READINESS_CONVERGENCE_ERA25_TRACKED_ENV_KEYS).toContain(
      "SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED",
    );
    expect(
      detectScaleReadinessConvergenceEra25Started({
        SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED: "1",
      }),
    ).toBe(true);
  });
});
