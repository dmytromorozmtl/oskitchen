import { describe, expect, it } from "vitest";

import {
  findNavPageMaturityHonestyGaps,
  NAV_PAGE_MATURITY_ERA14_GAP_CLOSURE_PREFIXES,
  NAV_PAGE_MATURITY_ERA14_POLICY_ID,
} from "@/lib/navigation/nav-page-maturity-era14-policy";
import { getPageMaturityHonesty } from "@/lib/navigation/page-maturity-honesty";
import { getNavMaturityExposure } from "@/lib/navigation/nav-maturity-governance";

describe("nav page maturity era14 policy", () => {
  it("locks era14 nav page maturity recert policy id", () => {
    expect(NAV_PAGE_MATURITY_ERA14_POLICY_ID).toBe("era14-nav-page-maturity-recert-v1");
  });

  it("closes era14 nav-visible preview gaps", () => {
    for (const prefix of NAV_PAGE_MATURITY_ERA14_GAP_CLOSURE_PREFIXES) {
      expect(getNavMaturityExposure(prefix)).toBe("preview");
      expect(getPageMaturityHonesty(prefix)?.exposure).toBe("preview");
    }
  });

  it("has no preview/placeholder honesty gaps in focused nav", () => {
    expect(findNavPageMaturityHonestyGaps()).toEqual([]);
  });
});
