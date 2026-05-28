import { describe, expect, it } from "vitest";

import { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";
import { buildLinearPathPermanentlyClosedReportMarkdown } from "../../scripts/ops/sync-linear-path-permanently-closed-report";

describe("validate-linear-path-permanently-closed", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateLinearPathPermanentlyClosed({})).not.toThrow();
  });

  it("reports honest not-active locally", () => {
    const result = evaluateLinearPathPermanentlyClosed({});
    expect(result.terminalClosureActive).toBe(false);
    expect(result.linearPathPermanentlyClosed).toBe(true);
    expect(result.docChainSteps).toBe(16);
    expect(result.totalSteps).toBe(16);
  });

  it("builds terminal closure report", () => {
    const result = evaluateLinearPathPermanentlyClosed({});
    const markdown = buildLinearPathPermanentlyClosedReportMarkdown(result);
    expect(markdown).toContain("Linear Path — Permanently Closed Report");
    expect(markdown).toContain("next-step-16-linear-path-permanently-closed");
    expect(markdown).toContain("Step 17+");
  });
});
