import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditInventoryReservationsDepthP3_144,
  formatInventoryReservationsDepthP3_144AuditLines,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-audit";
import { assertInventoryReservationsDepthCapabilityCounts } from "@/lib/inventory/inventory-reservations-depth-p3-144-content";
import {
  loadInventoryReservationsDepthRegistry,
  validateInventoryReservationsDepthRegistry,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-operations";
import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_CI_WORKFLOW,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPETITOR,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_NPM_SCRIPT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_TOTAL_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_UNIT_TEST,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-policy";

const ROOT = process.cwd();

describe("Inventory + reservations depth (P3-144)", () => {
  it("locks policy id, Lightspeed competitor, and 9 depth capabilities", () => {
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID).toBe(
      "inventory-reservations-depth-p3-144-v1",
    );
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPETITOR).toBe("lightspeed");
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT).toBe(5);
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT).toBe(4);
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_TOTAL_CAPABILITY_COUNT).toBe(9);
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE).toBe("/dashboard/inventory/depth");
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE).toBe("/dashboard/reservations");
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE).toBe(
      "Inventory + reservations depth — Lightspeed parity baseline",
    );
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS).toEqual([
      "stock_counts",
      "receiving",
      "variance",
      "purchase_suggestions",
      "pos_impacts",
    ]);
    expect(INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS).toEqual([
      "calendar_host",
      "waitlist_sms",
      "conflict_detection",
      "public_booking",
    ]);
    expect(assertInventoryReservationsDepthCapabilityCounts()).toBe(true);
  });

  it("validates registry with zero active pilots", () => {
    const registry = loadInventoryReservationsDepthRegistry(ROOT);
    const validation = validateInventoryReservationsDepthRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActivePilots).toBe(true);
    expect(registry.activePilotCount).toBe(0);
    expect(registry.capabilities).toHaveLength(9);
  });

  it("passes full inventory + reservations depth audit", () => {
    const summary = auditInventoryReservationsDepthP3_144(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveDepthWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.capabilitiesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC))).toBe(true);
    expect(existsSync(join(ROOT, INVENTORY_RESERVATIONS_DEPTH_P3_144_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INVENTORY_RESERVATIONS_DEPTH_P3_144_NPM_SCRIPT]).toContain(
      "audit-inventory-reservations-depth-p3-144.ts",
    );
    expect(pkg.scripts?.["test:ci:inventory-reservations-depth-p3-144"]).toContain(
      INVENTORY_RESERVATIONS_DEPTH_P3_144_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, INVENTORY_RESERVATIONS_DEPTH_P3_144_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:inventory-reservations-depth-p3-144");
  });

  it("formats audit lines", () => {
    const summary = auditInventoryReservationsDepthP3_144(ROOT);
    const lines = formatInventoryReservationsDepthP3_144AuditLines(summary);
    expect(lines.some((line) => line.includes(INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
