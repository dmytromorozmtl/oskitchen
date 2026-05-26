import { describe, expect, it } from "vitest";

import {
  getBusinessModeDisplayLabel,
  normalizeBusinessModeForPersistence,
} from "@/lib/business-mode/business-mode-normalization";
import { getBusinessModeModulePlan } from "@/lib/business-mode/business-mode-config";

describe("business mode normalization", () => {
  it("maps COMMISSARY to CLOUD_KITCHEN for persistence", () => {
    expect(normalizeBusinessModeForPersistence("COMMISSARY")).toBe("CLOUD_KITCHEN");
  });

  it("maps MANUAL_ONLY to OTHER for persistence", () => {
    expect(normalizeBusinessModeForPersistence("MANUAL_ONLY")).toBe("OTHER");
  });

  it("shows Commissary label when declared strategic alias is passed", () => {
    expect(getBusinessModeDisplayLabel("CLOUD_KITCHEN", "COMMISSARY")).toBe("Commissary");
  });

  it("keeps module recommendations working for persisted enum", () => {
    const plan = getBusinessModeModulePlan("CLOUD_KITCHEN");
    expect(plan.recommended.length).toBeGreaterThan(0);
  });
});
