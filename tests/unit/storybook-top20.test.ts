import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { STORYBOOK_TOP20_TITLE_PREFIX } from "@/lib/storybook/csf-types";
import { auditStorybookTop20Wiring } from "@/lib/storybook/storybook-top20-audit";
import {
  STORYBOOK_TOP20_CI_SCRIPTS,
  STORYBOOK_TOP20_COMPONENTS,
  STORYBOOK_TOP20_NPM_SCRIPTS,
  STORYBOOK_TOP20_POLICY_ID,
  STORYBOOK_TOP20_SETUP_DOC,
  STORYBOOK_TOP20_STORY_PATHS,
  STORYBOOK_TOP20_UNIT_TEST,
  STORYBOOK_TOP20_UPSTREAM_POLICY_ID,
} from "@/lib/storybook/storybook-top20-policy";

const ROOT = process.cwd();

describe("Storybook top 20 (Absolute Final Task 65)", () => {
  it("locks storybook policy extending design system doc", () => {
    expect(STORYBOOK_TOP20_POLICY_ID).toBe("storybook-top20-absolute-final-v1");
    expect(STORYBOOK_TOP20_UPSTREAM_POLICY_ID).toBe("design-system-documentation-absolute-final-v1");
    expect(STORYBOOK_TOP20_COMPONENTS).toHaveLength(20);
    expect(STORYBOOK_TOP20_STORY_PATHS).toHaveLength(20);
  });

  it("documents setup guide with title prefix", () => {
    const doc = readFileSync(join(ROOT, STORYBOOK_TOP20_SETUP_DOC), "utf8");
    expect(doc).toContain(STORYBOOK_TOP20_TITLE_PREFIX);
    expect(doc).toContain("npm run storybook");
  });

  it("passes wiring audit for all 20 story files", () => {
    const audit = auditStorybookTop20Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("maps each story file to a top-20 component id", () => {
    for (const component of STORYBOOK_TOP20_COMPONENTS) {
      const storyPath = `stories/top20/${component.id}.stories.tsx`;
      expect(STORYBOOK_TOP20_STORY_PATHS).toContain(storyPath);
    }
  });

  it("ships npm cert and storybook scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of STORYBOOK_TOP20_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    for (const script of STORYBOOK_TOP20_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(STORYBOOK_TOP20_UNIT_TEST).toBe("tests/unit/storybook-top20.test.ts");
  });
});
