/**
 * WooCommerce live smoke summary — wiring audit + KDS/inventory proof (Era 71).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-live-smoke-era71-policy";

export const WOOCOMMERCE_LIVE_SMOKE_SUMMARY_VERSION = WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID;

export type WooCommerceLiveSmokeEra71Overall = "PASSED" | "FAILED" | "SKIPPED";

export type WooCommerceLiveSmokeEra71ProofStatus =
  | "proof_passed"
  | "proof_passed_webhook_synthetic"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type WooCommerceLiveSmokeEra71Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type WooCommerceLiveSmokeEra71Summary = {
  version: typeof WOOCOMMERCE_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: WooCommerceLiveSmokeEra71Overall;
  proofStatus: WooCommerceLiveSmokeEra71ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: WooCommerceLiveSmokeEra71Overall | null;
  missingEnvVars: string[];
  steps: WooCommerceLiveSmokeEra71Step[];
  honestyNote: string;
};

export function isPlaceholderWooStoreHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("example.com") ||
    normalized.endsWith(".local") ||
    normalized === "localhost"
  );
}

export function auditWooCommerceLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/woocommerce/kitchen-import.service.ts") {
      if (!src.includes("importWooCommerceOrderToKitchen")) {
        failures.push("kitchen-import.service.ts missing importWooCommerceOrderToKitchen");
      }
    }
    if (rel === "services/integrations/woocommerce/inventory-sync.service.ts") {
      if (!src.includes("syncWooCommerceInventoryFromOrder")) {
        failures.push("inventory-sync.service.ts missing syncWooCommerceInventoryFromOrder");
      }
    }
    if (rel === "lib/webhooks/woocommerce-webhook-processor.ts") {
      if (!src.includes("importWooCommerceOrderToKitchen")) {
        failures.push("woocommerce-webhook-processor.ts missing kitchen import");
      }
      if (!src.includes("syncWooCommerceInventoryFromOrder")) {
        failures.push("woocommerce-webhook-processor.ts missing inventory sync");
      }
    }
    if (rel === "scripts/smoke-woocommerce-live.ts") {
      if (!src.includes("kds_kitchen_import")) {
        failures.push("smoke-woocommerce-live.ts missing kds_kitchen_import step");
      }
      if (!src.includes("inventory_sync_wiring")) {
        failures.push("smoke-woocommerce-live.ts missing inventory_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveWooCommerceLiveSmokeEra71ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: WooCommerceLiveSmokeEra71Overall | null;
  liveProofStatus?: string;
}): WooCommerceLiveSmokeEra71ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_store") {
    return "proof_skipped_placeholder_store";
  }
  if (input.liveProofStatus === "proof_passed_webhook_synthetic") {
    return "proof_passed_webhook_synthetic";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_store";
}

export function resolveWooCommerceLiveSmokeEra71Overall(
  proofStatus: WooCommerceLiveSmokeEra71ProofStatus,
): WooCommerceLiveSmokeEra71Overall {
  if (proofStatus === "proof_passed" || proofStatus === "proof_passed_webhook_synthetic") {
    return "PASSED";
  }
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_store"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildWooCommerceLiveSmokeEra71Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: WooCommerceLiveSmokeEra71Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: WooCommerceLiveSmokeEra71Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): WooCommerceLiveSmokeEra71Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveWooCommerceLiveSmokeEra71ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveWooCommerceLiveSmokeEra71Overall(proofStatus);

  const steps: WooCommerceLiveSmokeEra71Step[] = [
    {
      id: "wiring_audit",
      label: "Woo → webhook → KDS → inventory wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 71 Woo live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_rest_webhook_kds_inventory",
      label: "Live dev store → webhook → KDS → inventory",
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
    version: WOOCOMMERCE_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Woo REST + staging webhook + ExternalOrder + KDS kitchen import — inventory sync fires on order.created.",
  };
}

export function formatWooCommerceLiveSmokeEra71ReportLines(
  summary: WooCommerceLiveSmokeEra71Summary,
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
