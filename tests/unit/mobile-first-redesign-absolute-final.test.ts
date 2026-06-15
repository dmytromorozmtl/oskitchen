import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditMobileFirstRedesignAbsoluteFinalWiring } from "@/lib/design/mobile-first-redesign-absolute-final-audit";
import {
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_CI_SCRIPTS,
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_E2E_SPEC,
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_POLICY_ID,
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES,
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_UNIT_TEST,
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_WORKFLOW,
  MOBILE_FIRST_REDESIGN_KDS_VIEWPORT,
  MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX,
  MOBILE_FIRST_REDESIGN_TOUCH_FLOOR_PX,
  MOBILE_FIRST_REDESIGN_UPSTREAM_POLICY_ID,
  mobileFirstRedesignAbsoluteFinalSurfaceIds,
} from "@/lib/design/mobile-first-redesign-absolute-final-policy";
import {
  KDS_TABLET_LANDSCAPE_HEIGHT_PX,
  KDS_TABLET_LANDSCAPE_WIDTH_PX,
  kdsTabletLandscapeLaneLayoutClass,
  kdsTabletLandscapeShellClass,
  kdsTabletLandscapeTicketGridClass,
} from "@/lib/kitchen/kds-tablet-landscape-layout";

const ROOT = process.cwd();

describe("mobile-first redesign absolute final (Task 56)", () => {
  it("locks POS mobile + KDS tablet landscape policy", () => {
    expect(MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "mobile-first-redesign-absolute-final-v1",
    );
    expect(MOBILE_FIRST_REDESIGN_UPSTREAM_POLICY_ID).toBe("mobile-first-redesign-des25-v1");
    expect(MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX).toBe(375);
    expect(MOBILE_FIRST_REDESIGN_TOUCH_FLOOR_PX).toBe(44);
    expect(MOBILE_FIRST_REDESIGN_KDS_VIEWPORT).toEqual({
      width: 1024,
      height: 768,
    });
    expect(KDS_TABLET_LANDSCAPE_WIDTH_PX).toBe(1024);
    expect(KDS_TABLET_LANDSCAPE_HEIGHT_PX).toBe(768);
  });

  it("covers two operator field surfaces", () => {
    expect(MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES).toHaveLength(2);
    expect(mobileFirstRedesignAbsoluteFinalSurfaceIds()).toEqual([
      "pos_mobile",
      "kds_tablet_landscape",
    ]);
    expect(MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES[0]?.route).toBe(
      "/dashboard/pos/mobile",
    );
    expect(MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES[1]?.route).toBe("/dashboard/kitchen");
  });

  it("exports KDS tablet landscape layout helpers", () => {
    expect(kdsTabletLandscapeShellClass()).toContain("kds-tablet-landscape-shell");
    expect(kdsTabletLandscapeShellClass()).toContain("touch-manipulation");
    expect(kdsTabletLandscapeLaneLayoutClass()).toContain("lg:grid-cols-2");
    expect(kdsTabletLandscapeTicketGridClass()).toContain("xl:grid-cols-3");
  });

  it("audits wiring, E2E spec, and workflow", () => {
    const audit = auditMobileFirstRedesignAbsoluteFinalWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    expect(existsSync(join(ROOT, MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_WORKFLOW))).toBe(true);
    expect(
      readFileSync(join(ROOT, MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_E2E_SPEC), "utf8"),
    ).toContain("MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES");
    expect(
      readFileSync(join(ROOT, MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_WORKFLOW), "utf8"),
    ).toContain("test:e2e:mobile-first-redesign-pos-kds");
  });

  it("ships npm scripts for cert and E2E", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_UNIT_TEST).toBe(
      "tests/unit/mobile-first-redesign-absolute-final.test.ts",
    );
  });
});
