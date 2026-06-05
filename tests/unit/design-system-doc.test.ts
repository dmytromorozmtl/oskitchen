import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DESIGN_SYSTEM_DOC_ANCHORS,
  DESIGN_SYSTEM_DOC_PATH,
  DESIGN_SYSTEM_DOC_POLICY_ID,
  DESIGN_SYSTEM_POLICY_MODULES,
} from "@/lib/design/design-system-doc-policy";
import { loadDesignSystemDocSnapshot } from "@/services/design/design-system-doc-service";

describe("design system doc (DES-39)", () => {
  it("locks DES-39 policy id and doc path", () => {
    expect(DESIGN_SYSTEM_DOC_POLICY_ID).toBe("design-system-doc-des39-v1");
    expect(DESIGN_SYSTEM_DOC_PATH).toBe("docs/design-system.md");
    expect(DESIGN_SYSTEM_POLICY_MODULES.length).toBeGreaterThanOrEqual(8);
  });

  it("documents required sections and policy registry", () => {
    const doc = readFileSync(join(process.cwd(), DESIGN_SYSTEM_DOC_PATH), "utf8");
    for (const anchor of DESIGN_SYSTEM_DOC_ANCHORS) {
      expect(doc).toContain(anchor);
    }
    expect(doc).toContain("dark-mode-everywhere-des26-v1");
    expect(doc).toContain("mobile-first-redesign-des25-v1");
    expect(doc).toContain("page-layout-patterns-des27-v1");
  });

  it("loads doc snapshot with full health score", () => {
    const snapshot = loadDesignSystemDocSnapshot();
    expect(snapshot.passed).toBe(true);
    expect(snapshot.healthScore).toBe(100);
    expect(snapshot.sections.every((s) => s.present)).toBe(true);
  });
});
