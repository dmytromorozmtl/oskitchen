/**
 * Data Export & Portability smoke summary — wiring audit (Era 126).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DATA_EXPORT_ERA126_FORMATS,
  DATA_EXPORT_ERA126_LANES,
  DATA_EXPORT_ERA126_POLICY_ID,
  DATA_EXPORT_ERA126_ROUTE,
  DATA_EXPORT_ERA126_WIRING_PATHS,
} from "@/lib/data/data-export-era126-policy";
import { DATA_EXPORT_SERVICE } from "@/lib/data/export-policy";

export const DATA_EXPORT_SMOKE_SUMMARY_VERSION = DATA_EXPORT_ERA126_POLICY_ID;

export type DataExportSmokeEra126Overall = "PASSED" | "FAILED" | "SKIPPED";

export type DataExportSmokeEra126ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type DataExportSmokeEra126Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type DataExportSmokeEra126Summary = {
  version: typeof DATA_EXPORT_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: DataExportSmokeEra126Overall;
  proofStatus: DataExportSmokeEra126ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  lanes: readonly string[];
  formats: readonly string[];
  steps: DataExportSmokeEra126Step[];
  honestyNote: string;
};

export function auditDataExportSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of DATA_EXPORT_ERA126_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === DATA_EXPORT_SERVICE) {
      if (!src.includes("loadDataPortabilitySnapshot")) {
        failures.push("export-service.ts missing loadDataPortabilitySnapshot");
      }
      if (!src.includes("buildPortabilityManifestJson")) {
        failures.push("export-service.ts missing buildPortabilityManifestJson");
      }
      if (!src.includes("recordPortabilityManifestExport")) {
        failures.push("export-service.ts missing recordPortabilityManifestExport");
      }
      if (!src.includes("countExportDomainRows")) {
        failures.push("export-service.ts missing countExportDomainRows");
      }
      if (!src.includes("buildDataPortabilitySnapshot")) {
        failures.push("export-service.ts missing buildDataPortabilitySnapshot");
      }
    }

    if (rel === "lib/data/export-builders.ts") {
      if (!src.includes("buildDataExportDomain")) {
        failures.push("export-builders.ts missing buildDataExportDomain");
      }
      if (!src.includes("buildDataExportLane")) {
        failures.push("export-builders.ts missing buildDataExportLane");
      }
      if (!src.includes("buildDataPortabilitySnapshot")) {
        failures.push("export-builders.ts missing buildDataPortabilitySnapshot");
      }
      if (!src.includes("DATA_EXPORT_LANE_DOMAINS")) {
        failures.push("export-builders.ts missing lane domain map");
      }
    }

    if (rel === "lib/data/export-policy.ts") {
      if (!src.includes("DATA_EXPORT_POLICY_ID")) {
        failures.push("export-policy.ts missing policy id");
      }
      if (!src.includes("DATA_EXPORT_MANIFEST_ROUTE")) {
        failures.push("export-policy.ts missing manifest route");
      }
      if (!src.includes("DATA_EXPORT_FORMATS")) {
        failures.push("export-policy.ts missing export formats");
      }
    }

    if (rel === "app/dashboard/data/export/page.tsx") {
      if (!src.includes("loadDataPortabilitySnapshot")) {
        failures.push("data export page missing loadDataPortabilitySnapshot");
      }
      if (!src.includes("DataExportPanel")) {
        failures.push("data export page missing DataExportPanel");
      }
      if (!src.includes("Export every workspace domain — operations, catalog, purchasing, integrations, and compliance")) {
        failures.push("data export page missing full portability copy");
      }
    }

    if (rel === "components/data/data-export-panel.tsx") {
      if (!src.includes("data-export-panel")) {
        failures.push("data-export-panel.tsx missing root test id");
      }
      if (!src.includes("Portable rows")) {
        failures.push("data-export-panel.tsx missing portable rows summary");
      }
      if (!src.includes("Download JSON")) {
        failures.push("data-export-panel.tsx missing manifest download");
      }
      if (!src.includes("Full portability index")) {
        failures.push("data-export-panel.tsx missing portability index copy");
      }
    }

    if (rel === "app/api/data/portability-manifest/route.ts") {
      if (!src.includes("buildPortabilityManifestJson")) {
        failures.push("portability-manifest route missing buildPortabilityManifestJson");
      }
      if (!src.includes("loadDataPortabilitySnapshot")) {
        failures.push("portability-manifest route missing loadDataPortabilitySnapshot");
      }
      if (!src.includes("kitchenos-portability-manifest.json")) {
        failures.push("portability-manifest route missing attachment filename");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveDataExportSmokeEra126ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): DataExportSmokeEra126ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildDataExportSmokeEra126Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): DataExportSmokeEra126Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveDataExportSmokeEra126ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: DataExportSmokeEra126Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: DataExportSmokeEra126Step[] = [
    {
      id: "wiring_audit",
      label: "CSV domains → JSON manifest → full data portability",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 126 Data Export & Portability cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: DATA_EXPORT_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: DATA_EXPORT_ERA126_ROUTE,
    lanes: DATA_EXPORT_ERA126_LANES,
    formats: DATA_EXPORT_ERA126_FORMATS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace data and export permissions per domain.",
  };
}

export function formatDataExportSmokeEra126ReportLines(
  summary: DataExportSmokeEra126Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Lanes: ${summary.lanes.join(", ")}`,
    `Formats: ${summary.formats.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
