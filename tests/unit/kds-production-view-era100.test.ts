import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_PRODUCTION_VIEW_ERA100_POLICY_ID,
  KDS_PRODUCTION_VIEW_ERA100_ROUTE,
  KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT,
  KDS_PRODUCTION_VIEW_ERA100_WIRING_PATHS,
} from "@/lib/kitchen/kds-production-view-era100-policy";
import {
  auditKdsProductionViewSmokeWiring,
  buildKdsProductionViewSmokeEra100Summary,
  resolveKdsProductionViewSmokeEra100ProofStatus,
} from "@/lib/kitchen/kds-production-view-smoke-summary";
import {
  KDS_PRODUCTION_VIEW_ROUTE,
  KDS_PRODUCTION_VIEW_POLICY_ID,
} from "@/lib/kitchen/kds-production-view-policy";

const ROOT = process.cwd();

describe("kds production view era100", () => {
  it("locks era100 policy and artifact path", () => {
    expect(KDS_PRODUCTION_VIEW_ERA100_POLICY_ID).toBe("era100-kds-production-view-v1");
    expect(KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-production-view-smoke-summary.json",
    );
    expect(KDS_PRODUCTION_VIEW_ERA100_ROUTE).toBe("/dashboard/kitchen/production");
  });

  it("aligns era100 route with canonical production view policy", () => {
    expect(KDS_PRODUCTION_VIEW_POLICY_ID).toBe("kds-production-view-v1");
    expect(KDS_PRODUCTION_VIEW_ROUTE).toBe(KDS_PRODUCTION_VIEW_ERA100_ROUTE);
  });

  it("audits in-repo KDS Production View wiring", () => {
    const audit = auditKdsProductionViewSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_PRODUCTION_VIEW_ERA100_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes station load, bottleneck, and ETA in production client", () => {
    const client = readFileSync(
      join(ROOT, "components/kitchen/production-view-client.tsx"),
      "utf8",
    );
    expect(client).toContain("kds-production-view-root");
    expect(client).toContain("kds-production-station-card");
    expect(client).toContain("Bottleneck");
    expect(client).toContain("kitchenEtaMinutes");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsProductionViewSmokeEra100ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsProductionViewSmokeEra100ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsProductionViewSmokeEra100Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.route).toBe("/dashboard/kitchen/production");
  });
});
