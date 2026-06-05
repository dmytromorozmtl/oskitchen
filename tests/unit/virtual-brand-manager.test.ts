import { describe, expect, it } from "vitest";

import {
  buildVirtualBrandManagerDashboard,
  buildVirtualBrandProvisionSteps,
  buildVirtualBrandTemplateCards,
} from "@/lib/enterprise/virtual-brand-builders";
import {
  VIRTUAL_BRAND_PATH,
  VIRTUAL_BRAND_POLICY_ID,
  VIRTUAL_BRAND_PROVISION_TARGET_MINUTES,
  VIRTUAL_BRAND_SERVICE,
  VIRTUAL_BRAND_TEMPLATES,
} from "@/lib/enterprise/virtual-brand-policy";

describe("Virtual Brand Manager", () => {
  it("locks policy constants", () => {
    expect(VIRTUAL_BRAND_POLICY_ID).toBe("enterprise-virtual-brand-v1");
    expect(VIRTUAL_BRAND_SERVICE).toBe("services/enterprise/virtual-brand-service.ts");
    expect(VIRTUAL_BRAND_PATH).toBe("/dashboard/enterprise/virtual-brand");
    expect(VIRTUAL_BRAND_PROVISION_TARGET_MINUTES).toBe(5);
    expect(VIRTUAL_BRAND_TEMPLATES).toHaveLength(4);
  });

  it("defines a 5-minute provisioning flow", () => {
    const steps = buildVirtualBrandProvisionSteps();
    const totalMinutes = steps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
    expect(steps).toHaveLength(4);
    expect(totalMinutes).toBe(VIRTUAL_BRAND_PROVISION_TARGET_MINUTES);
    expect(steps.map((row) => row.id)).toEqual([
      "pick_template",
      "name_brand",
      "auto_provision",
      "launch_checklist",
    ]);
  });

  it("exposes virtual brand templates", () => {
    const templates = buildVirtualBrandTemplateCards();
    expect(templates).toHaveLength(4);
    expect(templates.some((row) => row.key === "ghost_kitchen")).toBe(true);
    expect(templates.every((row) => row.estimatedMinutes === 5)).toBe(true);
  });

  it("assembles manager dashboard", () => {
    const dashboard = buildVirtualBrandManagerDashboard({
      workspaceId: "ws-1",
      virtualBrands: [
        {
          brandId: "b1",
          name: "Night Owl",
          slug: "night-owl",
          conceptKind: "GHOST_KITCHEN_BRAND",
          menuCount: 1,
          storefrontCount: 1,
          setupProgress: 0.8,
          createdAtIso: "2026-06-01T12:00:00.000Z",
        },
      ],
      cloneSources: [{ menuId: "m1", title: "Core menu", productCount: 18 }],
    });

    expect(dashboard.policyId).toBe(VIRTUAL_BRAND_POLICY_ID);
    expect(dashboard.basePath).toBe(VIRTUAL_BRAND_PATH);
    expect(dashboard.summary.virtualBrandCount).toBe(1);
    expect(dashboard.summary.avgSetupProgress).toBe(0.8);
    expect(dashboard.summary.cloneSourceCount).toBe(1);
    expect(dashboard.templates).toHaveLength(4);
  });
});
