import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditHardwareCompatibilityRoadmapP2_37,
  formatHardwareCompatibilityRoadmapP2_37AuditLines,
} from "@/lib/hardware/hardware-compatibility-roadmap-p2-37-audit";
import {
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_BLUETOOTH_PRINTERS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_IPAD_MOUNTS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_USB_PRINTERS,
  assertHardwareCompatibilityRoadmapP2_37ItemCount,
} from "@/lib/hardware/hardware-compatibility-roadmap-p2-37-content";
import {
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_AUDIT_SCRIPT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_CHECK_NPM_SCRIPT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_CI_WORKFLOW,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_COMPETITOR,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_NPM_SCRIPT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POLICY_ID,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_IDS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_UNIT_TEST,
} from "@/lib/hardware/hardware-compatibility-roadmap-p2-37-policy";

const ROOT = process.cwd();

describe("Hardware compatibility roadmap — Toast parity (P2-37)", () => {
  it("locks policy id, competitor, and six roadmap items", () => {
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POLICY_ID).toBe(
      "hardware-compatibility-roadmap-p2-37-v1",
    );
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_COMPETITOR).toBe("toast");
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT).toBe(6);
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_IDS).toHaveLength(6);
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS).toHaveLength(6);
    expect(assertHardwareCompatibilityRoadmapP2_37ItemCount()).toBe(true);
  });

  it("covers USB printers, Bluetooth printers, and iPad mounts", () => {
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_USB_PRINTERS.length).toBeGreaterThanOrEqual(3);
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_BLUETOOTH_PRINTERS.length).toBeGreaterThanOrEqual(3);
    expect(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_IPAD_MOUNTS.length).toBeGreaterThanOrEqual(3);
    expect(
      HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS.some((i) => i.id === "usb_receipt_printer"),
    ).toBe(true);
    expect(
      HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS.some((i) => i.id === "bluetooth_receipt_printer"),
    ).toBe(true);
    expect(
      HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS.some((i) => i.id === "ipad_counter_mount"),
    ).toBe(true);
  });

  it("passes full hardware compatibility roadmap audit", () => {
    const summary = auditHardwareCompatibilityRoadmapP2_37(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryPresent).toBe(true);
    expect(summary.usbPrintersDocumented).toBe(true);
    expect(summary.bluetoothPrintersDocumented).toBe(true);
    expect(summary.ipadMountsDocumented).toBe(true);
    expect(summary.roadmapItemsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_ROADMAP_P2_37_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_ROADMAP_P2_37_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[HARDWARE_COMPATIBILITY_ROADMAP_P2_37_NPM_SCRIPT]).toContain(
      "audit-hardware-compatibility-roadmap-p2-37.ts",
    );
    expect(pkg.scripts?.[HARDWARE_COMPATIBILITY_ROADMAP_P2_37_CHECK_NPM_SCRIPT]).toContain(
      HARDWARE_COMPATIBILITY_ROADMAP_P2_37_UNIT_TEST,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:hardware-compatibility-roadmap-p2-37"]).toContain(
      HARDWARE_COMPATIBILITY_ROADMAP_P2_37_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, HARDWARE_COMPATIBILITY_ROADMAP_P2_37_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("hardware-compatibility-roadmap-p2-37");
  });

  it("formats audit lines", () => {
    const summary = auditHardwareCompatibilityRoadmapP2_37(ROOT);
    const lines = formatHardwareCompatibilityRoadmapP2_37AuditLines(summary);
    expect(lines.some((line) => line.includes(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
