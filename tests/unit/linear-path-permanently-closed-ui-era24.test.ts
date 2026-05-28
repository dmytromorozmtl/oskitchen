import { describe, expect, it } from "vitest";

import {
  buildLinearPathPermanentlyClosedUiSlice,
  formatLinearPathPermanentlyClosedLabel,
} from "@/lib/commercial/linear-path-permanently-closed-ui-era24";

describe("linear-path-permanently-closed-ui-era24", () => {
  it("returns null when absolute end inactive", () => {
    expect(buildLinearPathPermanentlyClosedUiSlice({ absoluteEndActive: false })).toBeNull();
  });

  it("builds slice when absolute end active", () => {
    const slice = buildLinearPathPermanentlyClosedUiSlice({ absoluteEndActive: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.docChainSteps).toBe(16);
    expect(slice?.validateCommand).toBe("npm run ops:validate-linear-path-permanently-closed");
    expect(slice?.terminusGuardPassed).toBe(true);
    expect(slice?.terminusGuardValidateCommand).toBe(
      "npm run ops:validate-linear-chain-terminus-guard",
    );
  });

  it("formats terminal label", () => {
    const slice = buildLinearPathPermanentlyClosedUiSlice({ absoluteEndActive: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatLinearPathPermanentlyClosedLabel(slice)).toContain("Step 17+ forbidden");
  });
});
