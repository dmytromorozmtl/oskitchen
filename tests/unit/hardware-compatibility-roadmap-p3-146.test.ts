import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditHardwareCompatibilityRoadmapP3_146,
  formatHardwareCompatibilityRoadmapP3_146AuditLines,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-audit";
import { assertHardwareCompatibilityRoadmapItemCount } from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-content";
import {
  loadHardwareCompatibilityRoadmapRegistry,
  validateHardwareCompatibilityRoadmapRegistry,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-operations";
import {
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_CI_WORKFLOW,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_COMPETITOR,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HEADLINE,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_IMPLEMENTATION_REF,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_NPM_SCRIPT,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POSITIONING_LINE,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROUTE,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_UNIT_TEST,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-policy";

const ROOT = process.cwd();

describe("Hardware compatibility roadmap (P3-146)", () => {
  it("locks policy id, Clover competitor, and 6 roadmap items", () => {
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID).toBe(
      "hardware-compatibility-roadmap-p3-146-v1",
    );
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_COMPETITOR).toBe("clover");
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT).toBe(6);
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROUTE).toBe("/works-with-os-kitchen");
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_IMPLEMENTATION_REF).toBe(
      "hardware-compatibility-center-p2-87-v1",
    );
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POSITIONING_LINE).toBe(
      "Bring your own devices — no Fiserv lease.",
    );
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HEADLINE).toBe(
      "Hardware compatibility roadmap — Clover parity baseline",
    );
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS).toEqual([
      "clover_station",
      "clover_mini",
      "clover_flex",
      "fiserv_payments",
      "printer_diagnostics",
      "compat_center",
    ]);
    expect(assertHardwareCompatibilityRoadmapItemCount()).toBe(true);
  });

  it("validates registry with no Fiserv bundle required", () => {
    const registry = loadHardwareCompatibilityRoadmapRegistry(ROOT);
    const validation = validateHardwareCompatibilityRoadmapRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.noFiservBundleRequired).toBe(true);
    expect(registry.fiservBundleRequired).toBe(false);
    expect(registry.items).toHaveLength(6);
  });

  it("passes full hardware compatibility roadmap audit", () => {
    const summary = auditHardwareCompatibilityRoadmapP3_146(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveCompatCenterPassed).toBe(true);
    expect(summary.liveCertifiedGuidePassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.roadmapItemsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_ROADMAP_P3_146_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[HARDWARE_COMPATIBILITY_ROADMAP_P3_146_NPM_SCRIPT]).toContain(
      "audit-hardware-compatibility-roadmap-p3-146.ts",
    );
    expect(pkg.scripts?.["test:ci:hardware-compatibility-roadmap-p3-146"]).toContain(
      HARDWARE_COMPATIBILITY_ROADMAP_P3_146_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, HARDWARE_COMPATIBILITY_ROADMAP_P3_146_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:hardware-compatibility-roadmap-p3-146");
  });

  it("formats audit lines", () => {
    const summary = auditHardwareCompatibilityRoadmapP3_146(ROOT);
    const lines = formatHardwareCompatibilityRoadmapP3_146AuditLines(summary);
    expect(lines.some((line) => line.includes(HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
