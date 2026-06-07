import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDesignSystemDocumentation } from "@/lib/design/design-system-documentation-audit";
import {
  DESIGN_SYSTEM_DOCUMENTATION_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_SYSTEM_DOCUMENTATION_CI_SCRIPTS,
  DESIGN_SYSTEM_DOCUMENTATION_DOC_PATH,
  DESIGN_SYSTEM_DOCUMENTATION_SECTION_ANCHORS,
  DESIGN_SYSTEM_DOCUMENTATION_UNIT_TEST,
  DESIGN_SYSTEM_DOCUMENTATION_UPSTREAM_POLICY_ID,
  DESIGN_SYSTEM_TOP_20_COMPONENTS,
} from "@/lib/design/design-system-documentation-absolute-final-policy";
import { DESIGN_SYSTEM_DOC_POLICY_ID } from "@/lib/design/design-system-doc-policy";
import { loadDesignSystemDocSnapshot } from "@/services/design/design-system-doc-service";

const ROOT = process.cwd();

describe("design system documentation (Absolute Final Task 64)", () => {
  it("locks absolute final doc policy extending DES-39", () => {
    expect(DESIGN_SYSTEM_DOCUMENTATION_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "design-system-documentation-absolute-final-v1",
    );
    expect(DESIGN_SYSTEM_DOCUMENTATION_UPSTREAM_POLICY_ID).toBe(DESIGN_SYSTEM_DOC_POLICY_ID);
    expect(DESIGN_SYSTEM_DOCUMENTATION_DOC_PATH).toBe("docs/design-system.md");
    expect(DESIGN_SYSTEM_TOP_20_COMPONENTS).toHaveLength(20);
    expect(DESIGN_SYSTEM_DOCUMENTATION_SECTION_ANCHORS).toHaveLength(5);
  });

  it("documents all top-20 component paths in canonical doc", () => {
    const doc = readFileSync(join(ROOT, DESIGN_SYSTEM_DOCUMENTATION_DOC_PATH), "utf8");
    for (const component of DESIGN_SYSTEM_TOP_20_COMPONENTS) {
      expect(doc).toContain(component.path);
    }
    for (const anchor of DESIGN_SYSTEM_DOCUMENTATION_SECTION_ANCHORS) {
      expect(doc).toContain(anchor);
    }
    expect(doc).toContain("data-viz-standards-absolute-final-v1");
    expect(doc).toContain("offline-mode-ui-indicator-absolute-final-v1");
  });

  it("passes design system documentation wiring audit", () => {
    const audit = auditDesignSystemDocumentation(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("keeps DES-39 snapshot at full health after extension", () => {
    const snapshot = loadDesignSystemDocSnapshot(ROOT);
    expect(snapshot.passed).toBe(true);
    expect(snapshot.healthScore).toBe(100);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of DESIGN_SYSTEM_DOCUMENTATION_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(DESIGN_SYSTEM_DOCUMENTATION_UNIT_TEST).toBe(
      "tests/unit/design-system-documentation.test.ts",
    );
  });
});
