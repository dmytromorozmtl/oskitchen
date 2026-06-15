import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPackingVerificationP2_94,
  formatPackingVerificationP2_94AuditLines,
} from "@/lib/kitchen/packing-verification-p2-94-audit";
import { PACKING_VERIFICATION_P2_94_CAPABILITIES } from "@/lib/kitchen/packing-verification-p2-94-content";
import {
  buildDeliveryBagChecklist,
  buildPackingVerificationReport,
  isDeliveryBagReady,
  validatePackingScanToken,
} from "@/lib/kitchen/packing-verification-p2-94-operations";
import {
  PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT,
  PACKING_VERIFICATION_P2_94_CI_WORKFLOW,
  PACKING_VERIFICATION_P2_94_DOC,
  PACKING_VERIFICATION_P2_94_NPM_SCRIPT,
  PACKING_VERIFICATION_P2_94_POLICY_ID,
  PACKING_VERIFICATION_P2_94_ROUTE,
  PACKING_VERIFICATION_P2_94_UNIT_TEST,
} from "@/lib/kitchen/packing-verification-p2-94-policy";
import type { PackingTaskFocus } from "@/lib/packing/packing-focus-era18";

const ROOT = process.cwd();

const sampleTask = (
  overrides: Partial<PackingTaskFocus & { allergenSummary?: string | null; verifiedAt?: string | null }> = {},
): PackingTaskFocus & { allergenSummary: string | null; verifiedAt: string | null } => ({
  id: "task-1",
  title: "Meal prep box A",
  status: "QUEUED",
  customerName: "Alex",
  requiresLabel: true,
  requiresNutritionLabel: false,
  requiresAllergenCheck: true,
  labelPrintedAt: null,
  fulfillmentType: "DELIVERY",
  allergenSummary: "Contains nuts",
  verifiedAt: null,
  ...overrides,
});

describe("Packing verification (P2-94)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(PACKING_VERIFICATION_P2_94_POLICY_ID).toBe("packing-verification-p2-94-v1");
    expect(PACKING_VERIFICATION_P2_94_ROUTE).toBe("/dashboard/kitchen/packing-verification");
    expect(PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT).toBe(3);
    expect(PACKING_VERIFICATION_P2_94_CAPABILITIES).toHaveLength(3);
  });

  it("passes full packing verification audit", () => {
    const summary = auditPackingVerificationP2_94(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.packingVerifyLinked).toBe(true);
    expect(summary.legacyDocLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("validates packing scan tokens", () => {
    expect(validatePackingScanToken("short").ok).toBe(false);
    expect(validatePackingScanToken("valid-token-123").ok).toBe(true);
  });

  it("builds delivery bag checklist with auto-checks", () => {
    const open = buildDeliveryBagChecklist({
      fulfillmentType: "DELIVERY",
      labelPrintedAt: null,
      status: "QUEUED",
      requiresAllergenCheck: true,
      verifiedAt: null,
    });
    expect(isDeliveryBagReady(open)).toBe(false);

    const ready = buildDeliveryBagChecklist({
      fulfillmentType: "DELIVERY",
      labelPrintedAt: "2026-06-09T12:00:00.000Z",
      status: "VERIFIED",
      requiresAllergenCheck: false,
      verifiedAt: "2026-06-09T12:05:00.000Z",
    });
    expect(isDeliveryBagReady(ready)).toBe(true);
  });

  it("aggregates packing verification report", () => {
    const report = buildPackingVerificationReport([
      sampleTask(),
      sampleTask({
        id: "task-2",
        title: "Salad box",
        requiresAllergenCheck: false,
        labelPrintedAt: "2026-06-09T12:00:00.000Z",
        status: "VERIFIED",
        verifiedAt: "2026-06-09T12:05:00.000Z",
      }),
    ]);
    expect(report.taskCount).toBe(2);
    expect(report.allergenOpenCount).toBeGreaterThan(0);
    expect(report.allergenRows).toHaveLength(1);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[PACKING_VERIFICATION_P2_94_NPM_SCRIPT]).toContain(
      "audit-packing-verification-p2-94.ts",
    );
    expect(pkg.scripts["test:ci:packing-verification-p2-94"]).toContain(
      PACKING_VERIFICATION_P2_94_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, PACKING_VERIFICATION_P2_94_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(PACKING_VERIFICATION_P2_94_NPM_SCRIPT);

    expect(existsSync(join(ROOT, PACKING_VERIFICATION_P2_94_DOC))).toBe(true);
    expect(formatPackingVerificationP2_94AuditLines(auditPackingVerificationP2_94(ROOT)).length).toBeGreaterThan(5);
  });
});
