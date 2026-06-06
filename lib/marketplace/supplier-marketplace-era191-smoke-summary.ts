/**
 * Supplier Marketplace summary — Round 2 wiring audit (Era 191).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SUPPLIER_MARKETPLACE_ERA191_CANONICAL_SUMMARY_ARTIFACT,
  SUPPLIER_MARKETPLACE_ERA191_LANES,
  SUPPLIER_MARKETPLACE_ERA191_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA191_ROUTE,
} from "@/lib/marketplace/supplier-marketplace-era191-policy";
import { auditSupplierMarketplaceSmokeWiring } from "@/lib/marketplace/supplier-marketplace-smoke-summary";

export const SUPPLIER_MARKETPLACE_ERA191_SMOKE_SUMMARY_VERSION =
  SUPPLIER_MARKETPLACE_ERA191_POLICY_ID;

export type SupplierMarketplaceSmokeEra191Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SupplierMarketplaceSmokeEra191ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SupplierMarketplaceSmokeEra191Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SupplierMarketplaceSmokeEra191Summary = {
  version: typeof SUPPLIER_MARKETPLACE_ERA191_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SupplierMarketplaceSmokeEra191Overall;
  proofStatus: SupplierMarketplaceSmokeEra191ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  lanes: readonly string[];
  steps: SupplierMarketplaceSmokeEra191Step[];
  honestyNote: string;
};

export function auditSupplierMarketplaceSmokeEra191Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditSupplierMarketplaceSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, SUPPLIER_MARKETPLACE_ERA191_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveSupplierMarketplaceSmokeEra191ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): SupplierMarketplaceSmokeEra191ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildSupplierMarketplaceSmokeEra191Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): SupplierMarketplaceSmokeEra191Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveSupplierMarketplaceSmokeEra191ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: SupplierMarketplaceSmokeEra191Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: SupplierMarketplaceSmokeEra191Step[] = [
    {
      id: "wiring_audit",
      label: "Food + packaging + equipment lanes → catalog → one-click reorder",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 191 Supplier Marketplace cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era116)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era116 smoke PASSED"
          : liveSmokeOverall
            ? `era116 artifact overall: ${liveSmokeOverall}`
            : "No era116 artifact — run npm run smoke:supplier-marketplace-era116",
    },
  ];

  return {
    version: SUPPLIER_MARKETPLACE_ERA191_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: SUPPLIER_MARKETPLACE_ERA191_ROUTE,
    lanes: SUPPLIER_MARKETPLACE_ERA191_LANES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires seeded marketplace categories, vendor products, and purchase history.",
  };
}

export function formatSupplierMarketplaceSmokeEra191ReportLines(
  summary: SupplierMarketplaceSmokeEra191Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era116): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Lanes: ${summary.lanes.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
