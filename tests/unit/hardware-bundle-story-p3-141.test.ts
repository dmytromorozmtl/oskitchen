import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditHardwareBundleStoryP3_141,
  formatHardwareBundleStoryP3_141AuditLines,
} from "@/lib/hardware/hardware-bundle-story-p3-141-audit";
import {
  loadHardwareBundleStoryRegistry,
  validateHardwareBundleStoryRegistry,
} from "@/lib/hardware/hardware-bundle-story-p3-141-operations";
import {
  HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS,
  HARDWARE_BUNDLE_STORY_P3_141_CI_WORKFLOW,
  HARDWARE_BUNDLE_STORY_P3_141_COMPETITOR,
  HARDWARE_BUNDLE_STORY_P3_141_DOC,
  HARDWARE_BUNDLE_STORY_P3_141_NPM_SCRIPT,
  HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID,
  HARDWARE_BUNDLE_STORY_P3_141_POSITIONING_LINE,
  HARDWARE_BUNDLE_STORY_P3_141_UNIT_TEST,
} from "@/lib/hardware/hardware-bundle-story-p3-141-policy";

const ROOT = process.cwd();

describe("Hardware bundle story (P3-141)", () => {
  it("locks policy id, Toast competitor, and positioning line", () => {
    expect(HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID).toBe("hardware-bundle-story-p3-141-v1");
    expect(HARDWARE_BUNDLE_STORY_P3_141_COMPETITOR).toBe("toast");
    expect(HARDWARE_BUNDLE_STORY_P3_141_POSITIONING_LINE).toBe(
      "Hardware shouldn't lock you in.",
    );
    expect(HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS).toHaveLength(7);
  });

  it("validates registry with no certified terminal program", () => {
    const registry = loadHardwareBundleStoryRegistry(ROOT);
    const validation = validateHardwareBundleStoryRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.noCertifiedProgram).toBe(true);
    expect(registry.certifiedTerminalProgram).toBe(false);
    expect(registry.components).toHaveLength(7);
  });

  it("passes full hardware bundle story audit", () => {
    const summary = auditHardwareBundleStoryP3_141(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveCertifiedGuidePassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.componentsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, HARDWARE_BUNDLE_STORY_P3_141_DOC))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_BUNDLE_STORY_P3_141_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[HARDWARE_BUNDLE_STORY_P3_141_NPM_SCRIPT]).toContain(
      "audit-hardware-bundle-story-p3-141.ts",
    );
    expect(pkg.scripts?.["test:ci:hardware-bundle-story-p3-141"]).toContain(
      HARDWARE_BUNDLE_STORY_P3_141_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, HARDWARE_BUNDLE_STORY_P3_141_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:hardware-bundle-story-p3-141");
  });

  it("formats audit lines", () => {
    const summary = auditHardwareBundleStoryP3_141(ROOT);
    const lines = formatHardwareBundleStoryP3_141AuditLines(summary);
    expect(lines.some((line) => line.includes(HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
