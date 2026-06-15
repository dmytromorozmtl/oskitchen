import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCateringCrmP3_150,
  formatCateringCrmP3_150AuditLines,
} from "@/lib/catering/catering-crm-p3-150-audit";
import { assertCateringCrmCapabilityCount } from "@/lib/catering/catering-crm-p3-150-content";
import {
  loadCateringCrmTripleseatRegistry,
  validateCateringCrmTripleseatRegistry,
} from "@/lib/catering/catering-crm-p3-150-operations";
import {
  CATERING_CRM_P3_150_CAPABILITY_COUNT,
  CATERING_CRM_P3_150_CAPABILITY_IDS,
  CATERING_CRM_P3_150_CI_WORKFLOW,
  CATERING_CRM_P3_150_COMPETITOR,
  CATERING_CRM_P3_150_DOC,
  CATERING_CRM_P3_150_HEADLINE,
  CATERING_CRM_P3_150_IMPLEMENTATION_REF,
  CATERING_CRM_P3_150_NPM_SCRIPT,
  CATERING_CRM_P3_150_POLICY_ID,
  CATERING_CRM_P3_150_POSITIONING_LINE,
  CATERING_CRM_P3_150_ROUTE,
  CATERING_CRM_P3_150_UNIT_TEST,
} from "@/lib/catering/catering-crm-p3-150-policy";

const ROOT = process.cwd();

describe("Catering CRM Tripleseat (P3-150)", () => {
  it("locks policy id, Tripleseat competitor, and 6 CRM capabilities", () => {
    expect(CATERING_CRM_P3_150_POLICY_ID).toBe("catering-crm-p3-150-v1");
    expect(CATERING_CRM_P3_150_COMPETITOR).toBe("tripleseat");
    expect(CATERING_CRM_P3_150_CAPABILITY_COUNT).toBe(6);
    expect(CATERING_CRM_P3_150_ROUTE).toBe("/dashboard/catering/crm");
    expect(CATERING_CRM_P3_150_IMPLEMENTATION_REF).toBe("catering-os-v1");
    expect(CATERING_CRM_P3_150_POSITIONING_LINE).toBe(
      "Production kitchen underneath catering sales — not Tripleseat venue CRM only.",
    );
    expect(CATERING_CRM_P3_150_HEADLINE).toBe("Catering CRM — Tripleseat parity baseline");
    expect(CATERING_CRM_P3_150_CAPABILITY_IDS).toEqual([
      "catering_quotes",
      "quote_pipeline",
      "deposit_checkout",
      "event_sheets",
      "public_proposals",
      "quote_conversion",
    ]);
    expect(assertCateringCrmCapabilityCount()).toBe(true);
  });

  it("validates registry with zero active pilots", () => {
    const registry = loadCateringCrmTripleseatRegistry(ROOT);
    const validation = validateCateringCrmTripleseatRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActivePilots).toBe(true);
    expect(registry.activePilotCount).toBe(0);
    expect(registry.capabilities).toHaveLength(6);
  });

  it("passes full catering CRM Tripleseat audit", () => {
    const summary = auditCateringCrmP3_150(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.cateringOsAuditPassed).toBe(true);
    expect(summary.quotesWiringPassed).toBe(true);
    expect(summary.depositWiringPassed).toBe(true);
    expect(summary.eventSheetsWiringPassed).toBe(true);
    expect(summary.liveCrmWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.capabilitiesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("wires deploy-prod-gate and npm audit script", () => {
    const workflow = readFileSync(join(ROOT, CATERING_CRM_P3_150_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(CATERING_CRM_P3_150_NPM_SCRIPT);
    expect(existsSync(join(ROOT, CATERING_CRM_P3_150_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CATERING_CRM_P3_150_UNIT_TEST))).toBe(true);
  });

  it("formats audit lines without throwing", () => {
    const summary = auditCateringCrmP3_150(ROOT);
    const lines = formatCateringCrmP3_150AuditLines(summary);
    expect(lines.length).toBeGreaterThan(5);
    expect(lines.some((line) => line.includes("tripleseat") || line.includes("Tripleseat"))).toBe(
      true,
    );
  });
});
