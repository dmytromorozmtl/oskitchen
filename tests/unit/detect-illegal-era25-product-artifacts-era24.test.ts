import { describe, expect, it } from "vitest";

import {
  ALLOWED_ERA25_PROCESS_COMMERCIAL_FILES,
  discoverIllegalEra25ProductArtifacts,
} from "@/lib/commercial/detect-illegal-era25-product-artifacts-era24";

describe("detect-illegal-era25-product-artifacts-era24", () => {
  it("allows era24 process slices referencing era25", () => {
    expect(ALLOWED_ERA25_PROCESS_COMMERCIAL_FILES).toContain(
      "era25-engineering-gates-require-signed-charter-phases-era24.ts",
    );
  });

  it("returns no violations in clean repo state", () => {
    const violations = discoverIllegalEra25ProductArtifacts(process.cwd());
    expect(violations.some((v) => v.path.includes("engineering-gates"))).toBe(false);
  });
});
