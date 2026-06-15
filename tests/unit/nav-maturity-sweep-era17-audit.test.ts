import { describe, expect, it } from "vitest";

import { runNavMaturitySweepEra17Audit } from "@/lib/navigation/nav-maturity-sweep-era17-audit";
import {
  NAV_MATURITY_SWEEP_ERA17_BACKLOG_ID,
  NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES,
  NAV_MATURITY_SWEEP_ERA17_POLICY_ID,
  NAV_MATURITY_SWEEP_ERA17_PROOF_STATUS,
} from "@/lib/navigation/nav-maturity-sweep-era17-policy";
import { getPageMaturityHonesty } from "@/lib/navigation/page-maturity-honesty";

describe("nav maturity sweep era17 policy", () => {
  it("locks era17 nav maturity sweep policy id", () => {
    expect(NAV_MATURITY_SWEEP_ERA17_POLICY_ID).toBe("era17-nav-maturity-sweep-v1");
    expect(NAV_MATURITY_SWEEP_ERA17_PROOF_STATUS).toBe("nav_maturity_sweep_recertified");
    expect(NAV_MATURITY_SWEEP_ERA17_BACKLOG_ID).toBe("KOS-E17-031");
    expect(NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES).toHaveLength(5);
  });
});

describe("nav maturity sweep era17 audit", () => {
  it("passes focused nav and era17 route coverage audit", () => {
    const audit = runNavMaturitySweepEra17Audit();
    expect(audit.passed).toBe(true);
    expect(audit.focusedNavGaps).toEqual([]);
    expect(audit.era17RuleGaps).toEqual([]);
    expect(audit.era17HonestyGaps).toEqual([]);
  });

  it("classifies nav-visible preview routes with honesty copy", () => {
    expect(getPageMaturityHonesty("/dashboard/costing/theft")?.exposure).toBe("preview");
    expect(getPageMaturityHonesty("/dashboard/marketing/holiday-packages")?.exposure).toBe(
      "preview",
    );
  });
});
