import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MOBILE_FIRST_REDESIGN_ERA133_AUDITED_MODULES,
  MOBILE_FIRST_REDESIGN_ERA133_CANONICAL_POLICY_ID,
  MOBILE_FIRST_REDESIGN_ERA133_DIMENSIONS,
  MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID,
  MOBILE_FIRST_REDESIGN_ERA133_SERVICE,
  MOBILE_FIRST_REDESIGN_ERA133_SUMMARY_ARTIFACT,
  MOBILE_FIRST_REDESIGN_ERA133_WIRING_PATHS,
} from "@/lib/design/mobile-first-redesign-era133-policy";
import {
  auditMobileFirstRedesignSmokeWiring,
  buildMobileFirstRedesignSmokeEra133Summary,
  resolveMobileFirstRedesignSmokeEra133ProofStatus,
} from "@/lib/design/mobile-first-redesign-smoke-summary";
import { auditMobileFirstRedesign } from "@/lib/design/mobile-first-redesign-audit-policy";
import {
  MOBILE_FIRST_REDESIGN_POLICY_ID,
  MOBILE_FIRST_TOUCH_FLOOR_PX,
  MOBILE_FIRST_VIEWPORT_PX,
} from "@/lib/design/mobile-first-redesign-policy";
import { loadMobileFirstRedesignSnapshot } from "@/services/design/mobile-first-redesign-service";

const ROOT = process.cwd();

describe("mobile-first redesign era133", () => {
  it("locks era133 policy and artifact path", () => {
    expect(MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID).toBe("era133-mobile-first-redesign-v1");
    expect(MOBILE_FIRST_REDESIGN_ERA133_SUMMARY_ARTIFACT).toBe(
      "artifacts/mobile-first-redesign-smoke-summary.json",
    );
    expect(MOBILE_FIRST_REDESIGN_ERA133_DIMENSIONS).toHaveLength(3);
    expect(MOBILE_FIRST_REDESIGN_ERA133_AUDITED_MODULES.length).toBeGreaterThanOrEqual(5);
  });

  it("aligns era133 with canonical mobile-first redesign policy", () => {
    expect(MOBILE_FIRST_REDESIGN_ERA133_CANONICAL_POLICY_ID).toBe(
      MOBILE_FIRST_REDESIGN_POLICY_ID,
    );
    expect(MOBILE_FIRST_VIEWPORT_PX).toBe(375);
    expect(MOBILE_FIRST_TOUCH_FLOOR_PX).toBe(44);
  });

  it("audits in-repo Mobile-First Redesign wiring", () => {
    const audit = auditMobileFirstRedesignSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MOBILE_FIRST_REDESIGN_ERA133_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes 375px viewport 44px touch swipe wiring", () => {
    const patterns = readFileSync(
      join(ROOT, "lib/design/mobile-first-redesign-patterns.ts"),
      "utf8",
    );
    expect(patterns).toContain("createDashboardSwipeHandlers");
    expect(patterns).toContain("dashboardNavPillClass");
    expect(patterns).toContain("touch-manipulation");

    const shell = readFileSync(join(ROOT, "components/dashboard/dashboard-shell.tsx"), "utf8");
    expect(shell).toContain("createDashboardSwipeHandlers");
    expect(shell).toContain("dashboardMainMobileClass");

    const report = auditMobileFirstRedesign(ROOT);
    expect(report.passed).toBe(true);

    const snapshot = loadMobileFirstRedesignSnapshot();
    expect(snapshot.healthScore).toBe(100);
    expect(snapshot.passed).toBe(true);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMobileFirstRedesignSmokeEra133ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMobileFirstRedesignSmokeEra133ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMobileFirstRedesignSmokeEra133Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.dimensions).toContain("swipe");
  });
});
