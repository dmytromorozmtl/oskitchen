import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditStorybookTop20P3_57,
  formatStorybookTop20P3_57AuditLines,
} from "@/lib/qa/storybook-top20-p3-57-audit";
import {
  buildStorybookTop20StoryStatuses,
  validateStorybookTop20Contract,
} from "@/lib/qa/storybook-top20-p3-57-measurement";
import {
  STORYBOOK_TOP20_P3_57_AUDIT_SCRIPT,
  STORYBOOK_TOP20_P3_57_CHECK_NPM_SCRIPT,
  STORYBOOK_TOP20_P3_57_COMPONENT_COUNT,
  STORYBOOK_TOP20_P3_57_DOC,
  STORYBOOK_TOP20_P3_57_NPM_SCRIPT,
  STORYBOOK_TOP20_P3_57_NPM_SCRIPTS,
  STORYBOOK_TOP20_P3_57_POLICY_ID,
  STORYBOOK_TOP20_P3_57_STORY_PATHS,
  STORYBOOK_TOP20_P3_57_TITLE_PREFIX,
  STORYBOOK_TOP20_P3_57_UNIT_TEST,
  storybookTop20ComponentIds,
} from "@/lib/qa/storybook-top20-p3-57-policy";

const ROOT = process.cwd();

describe("Storybook top-20 (P3-57)", () => {
  it("locks policy id and twenty-component matrix", () => {
    expect(STORYBOOK_TOP20_P3_57_POLICY_ID).toBe("storybook-top20-p3-57-v1");
    expect(storybookTop20ComponentIds()).toHaveLength(STORYBOOK_TOP20_P3_57_COMPONENT_COUNT);
    expect(STORYBOOK_TOP20_P3_57_STORY_PATHS).toHaveLength(20);
    expect(STORYBOOK_TOP20_P3_57_TITLE_PREFIX).toBe("Design System/Top 20");
  });

  it("validates storybook top-20 contract", () => {
    const validation = validateStorybookTop20Contract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.componentCount).toBe(20);
    expect(buildStorybookTop20StoryStatuses(ROOT).every((status) => status.storyPresent)).toBe(
      true,
    );
  });

  it("passes full storybook top-20 audit", () => {
    const summary = auditStorybookTop20P3_57(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.setupDocWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.twentyStoriesPresent).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatStorybookTop20P3_57AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, STORYBOOK_TOP20_P3_57_DOC))).toBe(true);
    expect(existsSync(join(ROOT, STORYBOOK_TOP20_P3_57_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, STORYBOOK_TOP20_P3_57_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[STORYBOOK_TOP20_P3_57_NPM_SCRIPT]).toContain(
      "audit-storybook-top20-p3-57.ts",
    );
    expect(pkg.scripts?.[STORYBOOK_TOP20_P3_57_CHECK_NPM_SCRIPT]).toContain(
      STORYBOOK_TOP20_P3_57_UNIT_TEST,
    );
    for (const script of STORYBOOK_TOP20_P3_57_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
