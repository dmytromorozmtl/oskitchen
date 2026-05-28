import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_EVIDENCE_ERA16_CI_SCRIPTS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_HONEST_SCOPE,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_SECTIONS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT,
} from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";

describe("commercial pilot evidence pack era16 policy", () => {
  it("locks era16 policy id and honest scope", () => {
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID).toBe(
      "era16-commercial-pilot-evidence-pack-v1",
    );
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_HONEST_SCOPE.singlePageGoNoGo).toBe(true);
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_HONEST_SCOPE.claimsProductionCertification).toBe(false);
  });

  it("defines five role checklists and runbook sections", () => {
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES).toEqual([
      "owner",
      "manager",
      "cashier",
      "kitchen",
      "support_admin",
    ]);
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_SECTIONS.length).toBe(10);
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_CI_SCRIPTS).toContain(
      "test:ci:commercial-pilot-evidence-era16:cert",
    );
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT).toBe(
      "artifacts/commercial-pilot-evidence-pack-summary.json",
    );
  });
});
