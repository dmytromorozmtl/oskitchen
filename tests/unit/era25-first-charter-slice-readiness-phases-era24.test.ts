import { describe, expect, it } from "vitest";

import {
  ERA25_CHARTER_REQUIRED_SECTIONS,
  ERA25_FIRST_CHARTER_SLICE_READINESS_PHASES_ERA24_POLICY_ID,
  ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";

describe("era25-first-charter-slice-readiness-phases-era24", () => {
  it("locks policy id", () => {
    expect(ERA25_FIRST_CHARTER_SLICE_READINESS_PHASES_ERA24_POLICY_ID).toBe(
      "era24-era25-first-charter-slice-readiness-phases-v1",
    );
  });

  it("defines template doc and required sections", () => {
    expect(ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC).toContain(
      "next-era25-first-charter-slice-template",
    );
    expect(ERA25_CHARTER_REQUIRED_SECTIONS.length).toBe(10);
  });
});
