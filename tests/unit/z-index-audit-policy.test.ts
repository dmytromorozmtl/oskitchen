import { describe, expect, it } from "vitest";

import {
  auditZIndexScale,
  findZIndexViolations,
  Z_INDEX_AUDIT_POLICY_ID,
} from "@/lib/design/z-index-audit-policy";
import {
  Z_INDEX_SCALE,
  zChromeClass,
  zKitchenFullscreenClass,
  zTourClass,
} from "@/lib/design/z-index-scale";

describe("z-index scale audit policy (DES-23)", () => {
  it("locks DES-23 policy id and ordered scale", () => {
    expect(Z_INDEX_AUDIT_POLICY_ID).toBe("z-index-scale-des23-v1");
    expect(Z_INDEX_SCALE.sticky).toBeLessThan(Z_INDEX_SCALE.stickyHeader);
    expect(Z_INDEX_SCALE.overlay).toBeLessThan(Z_INDEX_SCALE.floating);
    expect(Z_INDEX_SCALE.tourCard).toBeLessThan(Z_INDEX_SCALE.kitchenFullscreen);
  });

  it("detects forbidden arbitrary z-index classes", () => {
    const violations = findZIndexViolations(`
      <div className="fixed inset-0 z-[200]" />
      <div className="z-chrome" />
    `);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.pattern).toBe("z-[200]");
  });

  it("exposes named layer classes", () => {
    expect(zChromeClass).toBe("z-chrome");
    expect(zTourClass).toBe("z-tour");
    expect(zKitchenFullscreenClass).toBe("z-kitchen-fullscreen");
  });

  it("passes audit on all DES-23 modules (zero z-[N])", () => {
    const report = auditZIndexScale();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.violations.length === 0)).toBe(true);
  });
});
