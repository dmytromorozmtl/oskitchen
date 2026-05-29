import { describe, expect, it } from "vitest";

import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";

describe("owner-daily-briefing-breakthrough-phases-era25", () => {
  it("locks phases policy id", () => {
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PHASES_POLICY_ID).toBe(
      "era25-owner-daily-briefing-breakthrough-phases-v1",
    );
  });

  it("defines era25 briefing scheme B0–B4", () => {
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME).toHaveLength(5);
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME[0]?.id).toBe("B0");
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME[4]?.id).toBe("B4");
  });

  it("defines platform anchor", () => {
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-owner-daily-briefing-breakthrough",
    );
  });

  it("documents product slice doc", () => {
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC).toContain(
      "next-era25-owner-daily-briefing-breakthrough",
    );
  });
});
