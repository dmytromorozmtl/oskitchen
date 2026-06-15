import { describe, expect, it } from "vitest";

import { evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity } from "@/scripts/ops/validate-era25-post-terminal-seal-commercial-ops-permanence-integrity";

describe("validate-era25-post-terminal-seal-commercial-ops-permanence-integrity script export", () => {
  it("re-exports evaluator", () => {
    const result = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe(
      "era65-era25-post-terminal-seal-commercial-ops-permanence-integrity-v1",
    );
  });
});
