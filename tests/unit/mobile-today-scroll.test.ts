import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMobileTodayScroll,
  formatMobileTodayScrollAuditLines,
} from "@/lib/design/mobile-today-scroll-audit";
import {
  MOBILE_TODAY_MIN_PLAYBOOK_COUNT,
  MOBILE_TODAY_PLAYBOOK_STRIP_MODULE,
  MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT,
  MOBILE_TODAY_SCROLL_AUDIT_SCRIPT,
  MOBILE_TODAY_SCROLL_CI_WORKFLOW,
  MOBILE_TODAY_SCROLL_NPM_SCRIPT,
  MOBILE_TODAY_SCROLL_POLICY_ID,
  MOBILE_TODAY_SCROLL_UNIT_TEST,
} from "@/lib/design/mobile-today-scroll-policy";

const ROOT = process.cwd();

describe("mobile Today scroll (P1-64)", () => {
  it("locks policy id and 5+ playbook minimum", () => {
    expect(MOBILE_TODAY_SCROLL_POLICY_ID).toBe("mobile-today-scroll-p1-64-v1");
    expect(MOBILE_TODAY_MIN_PLAYBOOK_COUNT).toBe(5);
    expect(MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT).toBeGreaterThanOrEqual(
      MOBILE_TODAY_MIN_PLAYBOOK_COUNT,
    );
  });

  it("ships vertical playbook grid in today strip", () => {
    const source = readFileSync(join(ROOT, MOBILE_TODAY_PLAYBOOK_STRIP_MODULE), "utf8");
    expect(source).toContain("MOBILE_TODAY_PLAYBOOK_GRID_CLASS");
    expect(source).toContain("MOBILE_TODAY_PLAYBOOK_GRID_TEST_ID");
    expect(source).not.toContain("overflow-x-auto");
  });

  it("passes full mobile Today scroll audit", () => {
    const summary = auditMobileTodayScroll(ROOT);
    expect(summary.pagePresent).toBe(true);
    expect(summary.playbookStripPresent).toBe(true);
    expect(summary.commandCenterPresent).toBe(true);
    expect(summary.stickyHeaderWired).toBe(true);
    expect(summary.verticalPlaybookGridWired).toBe(true);
    expect(summary.minPlaybookCountWired).toBe(true);
    expect(summary.noHorizontalScrollWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, MOBILE_TODAY_SCROLL_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MOBILE_TODAY_SCROLL_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MOBILE_TODAY_SCROLL_NPM_SCRIPT]).toContain(
      "audit-mobile-today-scroll.ts",
    );
    expect(pkg.scripts?.["test:ci:mobile-today-scroll"]).toContain(
      MOBILE_TODAY_SCROLL_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MOBILE_TODAY_SCROLL_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:mobile-today-scroll");
  });

  it("formats audit lines", () => {
    const summary = auditMobileTodayScroll(ROOT);
    const lines = formatMobileTodayScrollAuditLines(summary);
    expect(lines.some((line) => line.includes(MOBILE_TODAY_SCROLL_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
