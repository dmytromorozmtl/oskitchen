import { describe, expect, it } from "vitest";

import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_BACKLOG_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
} from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";

describe("pure-operational-mode-terminus-phases-era25", () => {
  it("locks backlog id and platform anchor", () => {
    expect(PURE_OPERATIONAL_MODE_TERMINUS_ERA25_BACKLOG_ID).toBe("KOS-E25-009-TERMINUS");
    expect(PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-pure-operational-mode-terminus",
    );
  });

  it("defines terminus guardrails", () => {
    expect(PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS.length).toBeGreaterThan(3);
    expect(PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS.join(" ")).toContain(
      "Never fake artifact freshness",
    );
  });
});
