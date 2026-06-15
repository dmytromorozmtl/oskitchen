import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_PRODUCTION_VIEW_ERA100_POLICY_ID,
} from "@/lib/kitchen/kds-production-view-era100-policy";
import {
  KDS_PRODUCTION_VIEW_ERA175_CANONICAL_POLICY_ID,
  KDS_PRODUCTION_VIEW_ERA175_CAPABILITIES,
  KDS_PRODUCTION_VIEW_ERA175_POLICY_ID,
  KDS_PRODUCTION_VIEW_ERA175_ROUTE,
  KDS_PRODUCTION_VIEW_ERA175_SUMMARY_ARTIFACT,
  KDS_PRODUCTION_VIEW_ERA175_WIRING_PATHS,
} from "@/lib/kitchen/kds-production-view-era175-policy";
import {
  auditKdsProductionViewSmokeEra175Wiring,
  buildKdsProductionViewSmokeEra175Summary,
  resolveKdsProductionViewSmokeEra175ProofStatus,
} from "@/lib/kitchen/kds-production-view-era175-smoke-summary";
import {
  KDS_PRODUCTION_VIEW_ROUTE,
  KDS_PRODUCTION_VIEW_POLICY_ID,
} from "@/lib/kitchen/kds-production-view-policy";

const ROOT = process.cwd();

describe("kds production view era175", () => {
  it("locks era175 policy and artifact path", () => {
    expect(KDS_PRODUCTION_VIEW_ERA175_POLICY_ID).toBe("era175-kds-production-view-v1");
    expect(KDS_PRODUCTION_VIEW_ERA175_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-production-view-era175-smoke-summary.json",
    );
    expect(KDS_PRODUCTION_VIEW_ERA175_ROUTE).toBe("/dashboard/kitchen/production");
    expect(KDS_PRODUCTION_VIEW_ERA175_WIRING_PATHS).toHaveLength(6);
    expect(KDS_PRODUCTION_VIEW_ERA175_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era175 with canonical KDS Production View policy", () => {
    expect(KDS_PRODUCTION_VIEW_ERA175_CANONICAL_POLICY_ID).toBe(
      KDS_PRODUCTION_VIEW_ERA100_POLICY_ID,
    );
    expect(KDS_PRODUCTION_VIEW_POLICY_ID).toBe("kds-production-view-v1");
    expect(KDS_PRODUCTION_VIEW_ROUTE).toBe(KDS_PRODUCTION_VIEW_ERA175_ROUTE);
  });

  it("audits in-repo KDS Production View Round 2 wiring", () => {
    const audit = auditKdsProductionViewSmokeEra175Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_PRODUCTION_VIEW_ERA175_WIRING_PATHS) {
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

    const core = readFileSync(join(ROOT, "lib/kitchen/kds-production-view.ts"), "utf8");
    expect(core).toContain("buildProductionViewSnapshot");
    expect(core).toContain("bottleneckStation");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsProductionViewSmokeEra175ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsProductionViewSmokeEra175ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsProductionViewSmokeEra175Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.route).toBe("/dashboard/kitchen/production");
    expect(summary.capabilities).toContain("station_load");
    expect(summary.capabilities).toContain("bottleneck_detection");
  });
});
