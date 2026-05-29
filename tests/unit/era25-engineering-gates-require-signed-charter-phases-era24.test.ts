import { describe, expect, it } from "vitest";

import {
  ERA25_ENGINEERING_GATES_GUARDRAILS,
  ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_PHASES_ERA24_POLICY_ID,
  ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";

describe("era25-engineering-gates-require-signed-charter-phases-era24", () => {
  it("locks phases policy id", () => {
    expect(ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_PHASES_ERA24_POLICY_ID).toBe(
      "era24-era25-engineering-gates-require-signed-charter-phases-v1",
    );
  });

  it("defines platform anchor and gates doc", () => {
    expect(ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR).toBe(
      "#era25-engineering-gates-require-signed-charter",
    );
    expect(ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC).toContain(
      "next-era25-engineering-gates-require-signed-charter",
    );
  });

  it("lists first product slice requirements", () => {
    expect(ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS.length).toBeGreaterThanOrEqual(5);
    expect(ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS.some((req) => req.id === "platform_anchor")).toBe(
      true,
    );
  });

  it("forbids catalog extension and fake PASS", () => {
    expect(ERA25_ENGINEERING_GATES_GUARDRAILS.some((rule) => rule.includes("Step 18"))).toBe(true);
    expect(ERA25_ENGINEERING_GATES_GUARDRAILS.some((rule) => rule.includes("PASS"))).toBe(true);
  });
});
