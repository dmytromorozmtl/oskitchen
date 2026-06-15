import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditSkipLinkMainLandmarkWiring } from "@/lib/accessibility/skip-link-main-landmark-audit";
import {
  DASHBOARD_MAIN_LANDMARK_ARIA_LABEL,
  DASHBOARD_MAIN_LANDMARK_ID,
  DASHBOARD_SHELL_MODULE,
  DASHBOARD_SKIP_LINK_LABEL,
  DASHBOARD_SKIP_LINK_MODULE,
  SKIP_LINK_MAIN_LANDMARK_CI_SCRIPTS,
  SKIP_LINK_MAIN_LANDMARK_POLICY_ID,
  SKIP_LINK_MAIN_LANDMARK_UNIT_TEST,
} from "@/lib/accessibility/skip-link-main-landmark-policy";

const ROOT = process.cwd();

describe("skip link + main landmark (Absolute Final Task 57)", () => {
  it("locks dashboard skip link and main landmark policy", () => {
    expect(SKIP_LINK_MAIN_LANDMARK_POLICY_ID).toBe("skip-link-main-landmark-absolute-final-v1");
    expect(DASHBOARD_MAIN_LANDMARK_ID).toBe("dashboard-main-content");
    expect(DASHBOARD_SKIP_LINK_LABEL).toBe("Skip to main content");
    expect(DASHBOARD_MAIN_LANDMARK_ARIA_LABEL).toBe("Dashboard main content");
  });

  it("audits dashboard-shell and skip link wiring", () => {
    const audit = auditSkipLinkMainLandmarkWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const shell = readFileSync(join(ROOT, DASHBOARD_SHELL_MODULE), "utf8");
    expect(shell).toContain("<main");
    expect(shell).toContain("DASHBOARD_MAIN_LANDMARK_ID");

    const skipLink = readFileSync(join(ROOT, DASHBOARD_SKIP_LINK_MODULE), "utf8");
    expect(skipLink).toContain("zFloatingClass");
    expect(existsSync(join(ROOT, DASHBOARD_SKIP_LINK_MODULE))).toBe(true);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of SKIP_LINK_MAIN_LANDMARK_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(SKIP_LINK_MAIN_LANDMARK_UNIT_TEST).toBe(
      "tests/unit/skip-link-main-landmark.test.ts",
    );
  });
});
