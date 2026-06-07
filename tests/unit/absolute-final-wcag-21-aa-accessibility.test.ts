import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditWcag21AaWiring } from "@/lib/accessibility/absolute-final-wcag-21-aa-audit";
import {
  WCAG_21_AA_ABSOLUTE_FINAL_POLICY_ID,
  WCAG_21_AA_AXE_TAGS,
  WCAG_21_AA_DOC_PATH,
  WCAG_21_AA_MANUAL_GATE_NOTE,
  WCAG_21_AA_SERIOUS_VIOLATION_GATE,
  WCAG_21_AA_TARGET_LEVEL,
} from "@/lib/accessibility/absolute-final-wcag-21-aa-policy";
import {
  E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTE_COUNT,
  E2E_ACCESSIBILITY_AXE_WCAG_TAGS,
} from "@/lib/accessibility/e2e-accessibility-axe-policy";

const ROOT = process.cwd();
/** Absolute Final Task 147 — full accessibility audit WCAG 2.1 AA */
const TASK = 147;

describe(`WCAG 2.1 AA accessibility (Absolute Final Task ${TASK})`, () => {
  it("locks absolute final WCAG 2.1 AA policy id and target level", () => {
    expect(WCAG_21_AA_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-wcag-21-aa-v1");
    expect(WCAG_21_AA_TARGET_LEVEL).toBe("WCAG 2.1 AA");
    expect(WCAG_21_AA_SERIOUS_VIOLATION_GATE).toBe(0);
    expect(WCAG_21_AA_AXE_TAGS).toEqual(E2E_ACCESSIBILITY_AXE_WCAG_TAGS);
  });

  it("maps axe-core tags to WCAG 2.1 Level A and AA", () => {
    expect(WCAG_21_AA_AXE_TAGS).toContain("wcag2a");
    expect(WCAG_21_AA_AXE_TAGS).toContain("wcag2aa");
    expect(WCAG_21_AA_AXE_TAGS).toContain("wcag21a");
    expect(WCAG_21_AA_AXE_TAGS).toContain("wcag21aa");
  });

  it("documents manual assistive-tech gate alongside automation", () => {
    expect(WCAG_21_AA_MANUAL_GATE_NOTE).toContain("not a legal compliance certification");
  });

  it("references accessibility audit doc with WCAG 2.1 AA target", () => {
    const doc = readFileSync(join(ROOT, WCAG_21_AA_DOC_PATH), "utf8");
    expect(doc).toContain(WCAG_21_AA_TARGET_LEVEL);
    expect(doc).toContain("wcag21aa");
    expect(doc).toContain(WCAG_21_AA_ABSOLUTE_FINAL_POLICY_ID);
  });

  it("covers 10 key dashboard routes in axe E2E policy", () => {
    expect(E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTE_COUNT).toBe(10);
  });

  it("references skip link and POS aria-label wiring in policy module", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/accessibility/absolute-final-wcag-21-aa-policy.ts"),
      "utf8",
    );
    expect(policySource).toContain("Absolute Final Task 147");
    expect(policySource).toContain("skip-link-main-landmark-policy");
    expect(policySource).toContain("pos-terminal-icon-buttons.test.ts");
  });

  it("passes WCAG 2.1 AA wiring audit", () => {
    const audit = auditWcag21AaWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("locks CI cert script for WCAG 2.1 AA gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:wcag-21-aa-absolute-final:cert"]).toContain(
      "absolute-final-wcag-21-aa-accessibility.test.ts",
    );
  });
});
