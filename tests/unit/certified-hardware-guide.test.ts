import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCertifiedHardwareGuide,
  formatCertifiedHardwareGuideAuditLines,
} from "@/lib/hardware/certified-hardware-guide-audit";
import { CERTIFIED_HARDWARE_GUIDE_CATEGORIES } from "@/lib/hardware/certified-hardware-guide-content";
import {
  CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT,
  CERTIFIED_HARDWARE_GUIDE_CATEGORY_IDS,
  CERTIFIED_HARDWARE_GUIDE_CI_WORKFLOW,
  CERTIFIED_HARDWARE_GUIDE_DOC,
  CERTIFIED_HARDWARE_GUIDE_NPM_SCRIPT,
  CERTIFIED_HARDWARE_GUIDE_POLICY_ID,
  CERTIFIED_HARDWARE_GUIDE_UNIT_TEST,
} from "@/lib/hardware/certified-hardware-guide-policy";
import { POS_CERTIFIED_HARDWARE_DEVICES } from "@/lib/pos/pos-hardware-certification";

const ROOT = process.cwd();

describe("Certified hardware guide (P2-86)", () => {
  it("locks policy id and seven hardware categories", () => {
    expect(CERTIFIED_HARDWARE_GUIDE_POLICY_ID).toBe("certified-hardware-guide-p2-86-v1");
    expect(CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT).toBe(7);
    expect(CERTIFIED_HARDWARE_GUIDE_CATEGORY_IDS).toEqual([
      "ipad_tablets",
      "receipt_printers",
      "kitchen_screens",
      "cash_drawers",
      "barcode_scanners",
      "label_printers",
      "payment_terminals",
    ]);
    expect(CERTIFIED_HARDWARE_GUIDE_CATEGORIES).toHaveLength(7);
  });

  it("passes full certified hardware guide audit", () => {
    const summary = auditCertifiedHardwareGuide(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.compatDocLinked).toBe(true);
    expect(summary.categoryCountCorrect).toBe(true);
    expect(summary.allCategoriesInDoc).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("aligns guide categories with pos hardware certification catalog", () => {
    expect(POS_CERTIFIED_HARDWARE_DEVICES.length).toBeGreaterThanOrEqual(12);
    const scanners = CERTIFIED_HARDWARE_GUIDE_CATEGORIES.find(
      (category) => category.id === "barcode_scanners",
    );
    const terminals = CERTIFIED_HARDWARE_GUIDE_CATEGORIES.find(
      (category) => category.id === "payment_terminals",
    );
    expect(scanners?.exampleDevices.some((device) => device.includes("Honeywell"))).toBe(true);
    expect(terminals?.exampleDevices.some((device) => device.includes("Stripe"))).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, CERTIFIED_HARDWARE_GUIDE_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CERTIFIED_HARDWARE_GUIDE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CERTIFIED_HARDWARE_GUIDE_NPM_SCRIPT]).toContain(
      "audit-certified-hardware-guide.ts",
    );
    expect(pkg.scripts?.["test:ci:certified-hardware-guide"]).toContain(
      CERTIFIED_HARDWARE_GUIDE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, CERTIFIED_HARDWARE_GUIDE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:certified-hardware-guide");
  });

  it("formats audit lines", () => {
    const summary = auditCertifiedHardwareGuide(ROOT);
    const lines = formatCertifiedHardwareGuideAuditLines(summary);
    expect(lines.some((line) => line.includes(CERTIFIED_HARDWARE_GUIDE_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
