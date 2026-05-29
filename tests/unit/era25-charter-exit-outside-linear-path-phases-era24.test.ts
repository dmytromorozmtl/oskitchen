import { describe, expect, it } from "vitest";

import {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_PHASES_ERA24_POLICY_ID,
  ERA25_CHARTER_DOC_GLOB_HINT,
  ERA25_CHARTER_EXIT_GUARDRAILS,
  ERA25_CHARTER_EXIT_HUMAN_STEPS,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";

describe("era25-charter-exit-outside-linear-path-phases-era24", () => {
  it("locks policy id outside linear catalog", () => {
    expect(ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_PHASES_ERA24_POLICY_ID).toBe(
      "era24-era25-charter-exit-outside-linear-path-phases-v1",
    );
  });

  it("defines process doc and charter glob hint", () => {
    expect(ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC).toContain("next-era25-charter-exit");
    expect(ERA25_CHARTER_DOC_GLOB_HINT).toContain("era25-");
    expect(ERA25_CHARTER_DOC_GLOB_HINT).not.toContain("next-step-18");
  });

  it("lists guardrails and human steps", () => {
    expect(ERA25_CHARTER_EXIT_GUARDRAILS.length).toBeGreaterThanOrEqual(6);
    expect(ERA25_CHARTER_EXIT_HUMAN_STEPS.length).toBe(5);
    expect(ERA25_CHARTER_EXIT_GUARDRAILS[0]).toContain("Step 18+");
  });
});
