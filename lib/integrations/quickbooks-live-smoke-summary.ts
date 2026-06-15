/**
 * QuickBooks live smoke summary — wiring audit + accounting proof (Era 80).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA80_WIRING_PATHS,
} from "@/lib/integrations/quickbooks-live-smoke-era80-policy";

export const QUICKBOOKS_LIVE_SMOKE_SUMMARY_VERSION = QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID;

export type QuickBooksLiveSmokeEra80Overall = "PASSED" | "FAILED" | "SKIPPED";

export type QuickBooksLiveSmokeEra80ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_realm"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type QuickBooksLiveSmokeEra80Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type QuickBooksLiveSmokeEra80Summary = {
  version: typeof QUICKBOOKS_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: QuickBooksLiveSmokeEra80Overall;
  proofStatus: QuickBooksLiveSmokeEra80ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: QuickBooksLiveSmokeEra80Overall | null;
  missingEnvVars: string[];
  steps: QuickBooksLiveSmokeEra80Step[];
  honestyNote: string;
};

export function isPlaceholderQuickBooksRealmId(realmId: string): boolean {
  const normalized = realmId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "0000000000" ||
    normalized.endsWith(".local")
  );
}

export function auditQuickBooksLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of QUICKBOOKS_LIVE_SMOKE_ERA80_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/quickbooks/daily-sales-journal.service.ts") {
      if (!src.includes("postQuickBooksDailySalesJournal")) {
        failures.push("daily-sales-journal.service.ts missing postQuickBooksDailySalesJournal");
      }
    }
    if (rel === "services/integrations/quickbooks/chart-of-accounts.service.ts") {
      if (!src.includes("fetchQuickBooksChartOfAccounts")) {
        failures.push("chart-of-accounts.service.ts missing fetchQuickBooksChartOfAccounts");
      }
    }
    if (rel === "services/integrations/quickbooks/quickbooks-api.ts") {
      if (!src.includes("queryQuickBooksAccounts")) {
        failures.push("quickbooks-api.ts missing queryQuickBooksAccounts");
      }
      if (!src.includes("createQuickBooksJournalEntry")) {
        failures.push("quickbooks-api.ts missing createQuickBooksJournalEntry");
      }
    }
    if (rel === "scripts/smoke-quickbooks-live.ts") {
      if (!src.includes("chart_of_accounts_sync")) {
        failures.push("smoke-quickbooks-live.ts missing chart_of_accounts_sync step");
      }
      if (!src.includes("daily_journal_wiring")) {
        failures.push("smoke-quickbooks-live.ts missing daily_journal_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveQuickBooksLiveSmokeEra80ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: QuickBooksLiveSmokeEra80Overall | null;
  liveProofStatus?: string;
}): QuickBooksLiveSmokeEra80ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_realm") {
    return "proof_skipped_placeholder_realm";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_realm";
}

export function resolveQuickBooksLiveSmokeEra80Overall(
  proofStatus: QuickBooksLiveSmokeEra80ProofStatus,
): QuickBooksLiveSmokeEra80Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_realm"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildQuickBooksLiveSmokeEra80Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: QuickBooksLiveSmokeEra80Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: QuickBooksLiveSmokeEra80Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): QuickBooksLiveSmokeEra80Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveQuickBooksLiveSmokeEra80ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveQuickBooksLiveSmokeEra80Overall(proofStatus);

  const steps: QuickBooksLiveSmokeEra80Step[] = [
    {
      id: "wiring_audit",
      label: "QuickBooks → chart of accounts → daily journal wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 80 QuickBooks live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_oauth_chart_journal",
      label: "Live OAuth → chart of accounts → daily journal",
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
    version: QUICKBOOKS_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live QuickBooks OAuth + sandbox chart of accounts query + daily sales journal wiring — journal post skipped when account mapping or sales data absent.",
  };
}

export function formatQuickBooksLiveSmokeEra80ReportLines(
  summary: QuickBooksLiveSmokeEra80Summary,
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
