import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DATA_EXPORT_ERA126_CANONICAL_POLICY_ID,
  DATA_EXPORT_ERA126_FORMATS,
  DATA_EXPORT_ERA126_LANES,
  DATA_EXPORT_ERA126_POLICY_ID,
  DATA_EXPORT_ERA126_ROUTE,
  DATA_EXPORT_ERA126_SERVICE,
  DATA_EXPORT_ERA126_SUMMARY_ARTIFACT,
  DATA_EXPORT_ERA126_WIRING_PATHS,
} from "@/lib/data/data-export-era126-policy";
import {
  auditDataExportSmokeWiring,
  buildDataExportSmokeEra126Summary,
  resolveDataExportSmokeEra126ProofStatus,
} from "@/lib/data/data-export-smoke-summary";
import { DATA_EXPORT_POLICY_ID } from "@/lib/data/export-policy";

const ROOT = process.cwd();

describe("data export portability era126", () => {
  it("locks era126 policy and artifact path", () => {
    expect(DATA_EXPORT_ERA126_POLICY_ID).toBe("era126-data-export-portability-v1");
    expect(DATA_EXPORT_ERA126_SUMMARY_ARTIFACT).toBe(
      "artifacts/data-export-smoke-summary.json",
    );
    expect(DATA_EXPORT_ERA126_ROUTE).toBe("/dashboard/data/export");
    expect(DATA_EXPORT_ERA126_LANES).toHaveLength(5);
    expect(DATA_EXPORT_ERA126_FORMATS).toEqual(["csv", "json-manifest"]);
  });

  it("aligns era126 with canonical data export policy", () => {
    expect(DATA_EXPORT_ERA126_CANONICAL_POLICY_ID).toBe(DATA_EXPORT_POLICY_ID);
  });

  it("audits in-repo Data Export & Portability wiring", () => {
    const audit = auditDataExportSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of DATA_EXPORT_ERA126_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes CSV domains and JSON manifest wiring", () => {
    const service = readFileSync(join(ROOT, DATA_EXPORT_ERA126_SERVICE), "utf8");
    expect(service).toContain("loadDataPortabilitySnapshot");
    expect(service).toContain("buildPortabilityManifestJson");
    expect(service).toContain("resolveVisibleExportTypes");

    const builders = readFileSync(join(ROOT, "lib/data/export-builders.ts"), "utf8");
    expect(builders).toContain("DATA_EXPORT_LANE_DOMAINS");
    expect(builders).toContain("audit_logs");

    const panel = readFileSync(
      join(ROOT, "components/data/data-export-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("data-export-panel");
    expect(panel).toContain("Full portability index");
    expect(panel).toContain("Download JSON");

    const manifestRoute = readFileSync(
      join(ROOT, "app/api/data/portability-manifest/route.ts"),
      "utf8",
    );
    expect(manifestRoute).toContain("recordPortabilityManifestExport");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveDataExportSmokeEra126ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveDataExportSmokeEra126ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildDataExportSmokeEra126Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toContain("compliance");
  });
});
