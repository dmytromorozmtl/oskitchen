import { describe, expect, it } from "vitest";

import {
  auditIconSystem,
  findIconSystemViolations,
  ICON_SYSTEM_AUDIT_POLICY_ID,
} from "@/lib/design/icon-system-audit-policy";
import {
  appIconHeaderClass,
  appIconNavClass,
  APP_ICON_SIZES,
} from "@/lib/design/icon-system";

describe("icon system audit policy (DES-25)", () => {
  it("locks DES-25 policy id and canonical size ladder", () => {
    expect(ICON_SYSTEM_AUDIT_POLICY_ID).toBe("icon-system-des25-v1");
    expect(APP_ICON_SIZES.md.className).toBe("h-4 w-4");
    expect(appIconNavClass).toBe(APP_ICON_SIZES.md.className);
    expect(appIconHeaderClass).toBe(APP_ICON_SIZES.lg.className);
  });

  it("flags raw h-N w-N icon dimensions", () => {
    const violations = findIconSystemViolations(`
      <Cable className="h-6 w-6 text-muted-foreground" />
      <ArrowRight className={appIconMdClass} />
    `);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.pattern).toBe("h-6 w-6");
  });

  it("passes audit on operator dashboard icon surfaces", () => {
    const report = auditIconSystem();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.violations.length === 0)).toBe(true);
    expect(report.modules.some((m) => m.tokenReferences > 0)).toBe(true);
  });
});
