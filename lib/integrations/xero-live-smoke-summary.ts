/**
 * Xero live smoke summary — wiring audit + accounting proof (Era 81).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  XERO_LIVE_SMOKE_ERA81_POLICY_ID,
  XERO_LIVE_SMOKE_ERA81_WIRING_PATHS,
} from "@/lib/integrations/xero-live-smoke-era81-policy";

export const XERO_LIVE_SMOKE_SUMMARY_VERSION = XERO_LIVE_SMOKE_ERA81_POLICY_ID;

export type XeroLiveSmokeEra81Overall = "PASSED" | "FAILED" | "SKIPPED";

export type XeroLiveSmokeEra81ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_tenant"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type XeroLiveSmokeEra81Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type XeroLiveSmokeEra81Summary = {
  version: typeof XERO_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: XeroLiveSmokeEra81Overall;
  proofStatus: XeroLiveSmokeEra81ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: XeroLiveSmokeEra81Overall | null;
  missingEnvVars: string[];
  steps: XeroLiveSmokeEra81Step[];
  honestyNote: string;
};

export function isPlaceholderXeroTenantId(tenantId: string): boolean {
  const normalized = tenantId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "00000000-0000-0000-0000-000000000000" ||
    normalized.endsWith(".local")
  );
}

export function auditXeroLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of XERO_LIVE_SMOKE_ERA81_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/xero/invoice-sync.service.ts") {
      if (!src.includes("syncXeroSupplierInvoices")) {
        failures.push("invoice-sync.service.ts missing syncXeroSupplierInvoices");
      }
    }
    if (rel === "services/integrations/xero/bank-reconciliation.service.ts") {
      if (!src.includes("reconcileXeroBankTransactions")) {
        failures.push("bank-reconciliation.service.ts missing reconcileXeroBankTransactions");
      }
    }
    if (rel === "services/integrations/xero/xero-api.ts") {
      if (!src.includes("fetchXeroTenants")) {
        failures.push("xero-api.ts missing fetchXeroTenants");
      }
      if (!src.includes("createXeroBill")) {
        failures.push("xero-api.ts missing createXeroBill");
      }
      if (!src.includes("fetchXeroBankTransactions")) {
        failures.push("xero-api.ts missing fetchXeroBankTransactions");
      }
    }
    if (rel === "scripts/smoke-xero-live.ts") {
      if (!src.includes("invoice_sync_wiring")) {
        failures.push("smoke-xero-live.ts missing invoice_sync_wiring step");
      }
      if (!src.includes("bank_reconciliation_wiring")) {
        failures.push("smoke-xero-live.ts missing bank_reconciliation_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveXeroLiveSmokeEra81ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: XeroLiveSmokeEra81Overall | null;
  liveProofStatus?: string;
}): XeroLiveSmokeEra81ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_tenant") {
    return "proof_skipped_placeholder_tenant";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_tenant";
}

export function resolveXeroLiveSmokeEra81Overall(
  proofStatus: XeroLiveSmokeEra81ProofStatus,
): XeroLiveSmokeEra81Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_tenant"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildXeroLiveSmokeEra81Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: XeroLiveSmokeEra81Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: XeroLiveSmokeEra81Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): XeroLiveSmokeEra81Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveXeroLiveSmokeEra81ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveXeroLiveSmokeEra81Overall(proofStatus);

  const steps: XeroLiveSmokeEra81Step[] = [
    {
      id: "wiring_audit",
      label: "Xero → invoice sync → bank reconciliation wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 81 Xero live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_oauth_invoice_reconcile",
      label: "Live OAuth → invoice sync → bank reconciliation",
      status:
        input.liveSmoke.overall === "PASSED"
          ? "PASSED"
          : input.liveSmoke.overall === "SKIPPED"
            ? "SKIPPED"
            : "FAILED",
      reason:
        input.liveSmoke.steps.find((s) => s.status === "FAILED")?.reason ??
        input.liveSmoke.steps.find((s) => s.status === "SKIPPED")?.reason,
    });
  }

  return {
    version: XERO_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Xero OAuth + tenant query + invoice sync and bank reconciliation wiring — sync may skip when no supplier invoices or sales data absent.",
  };
}

export function formatXeroLiveSmokeEra81ReportLines(
  summary: XeroLiveSmokeEra81Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke: ${summary.liveSmokeOverall ?? "not run"}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
