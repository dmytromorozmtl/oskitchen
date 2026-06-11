import { describe, expect, it } from "vitest";

import {
  DEMO_MODE_GUIDED_PATH_POLICY_ID,
  DEMO_MODE_GUIDED_PATH_STEPS,
  isDemoModeGuidedPathComplete,
  pickDemoModeGuidedPathNextStep,
  resolveDemoModeGuidedPathStepFromPathname,
} from "@/lib/ux/demo-mode-guided-path-policy";

describe("demo mode guided path (P1-28)", () => {
  it("locks policy id and 5-step pilot path", () => {
    expect(DEMO_MODE_GUIDED_PATH_POLICY_ID).toBe("demo-mode-guided-path-p1-28-v1");
    expect(DEMO_MODE_GUIDED_PATH_STEPS.map((s) => s.id)).toEqual([
      "today",
      "quick_start",
      "invoice_scanner",
      "marketplace",
      "kds",
    ]);
  });

  it("resolves pathname to guided step", () => {
    expect(resolveDemoModeGuidedPathStepFromPathname("/dashboard/today")).toBe("today");
    expect(resolveDemoModeGuidedPathStepFromPathname("/dashboard/quick-start")).toBe(
      "quick_start",
    );
    expect(
      resolveDemoModeGuidedPathStepFromPathname("/dashboard/inventory/invoice-scanner"),
    ).toBe("invoice_scanner");
    expect(resolveDemoModeGuidedPathStepFromPathname("/dashboard/marketplace/catalog")).toBe(
      "marketplace",
    );
    expect(resolveDemoModeGuidedPathStepFromPathname("/dashboard/kitchen")).toBe("kds");
  });

  it("picks next incomplete step in order", () => {
    expect(pickDemoModeGuidedPathNextStep([])?.id).toBe("today");
    expect(pickDemoModeGuidedPathNextStep(["today"])?.href).toBe("/dashboard/quick-start");
    expect(
      pickDemoModeGuidedPathNextStep(["today", "quick_start", "invoice_scanner"])?.id,
    ).toBe("marketplace");
  });

  it("detects completion when all steps visited", () => {
    const all = DEMO_MODE_GUIDED_PATH_STEPS.map((s) => s.id);
    expect(isDemoModeGuidedPathComplete(all)).toBe(true);
    expect(isDemoModeGuidedPathComplete(["today", "kds"])).toBe(false);
  });
});
