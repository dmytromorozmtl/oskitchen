/**
 * Shopify live smoke summary — wiring audit + KDS/inventory proof (Era 72).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS,
} from "@/lib/integrations/shopify-live-smoke-era72-policy";

export const SHOPIFY_LIVE_SMOKE_SUMMARY_VERSION = SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID;

export type ShopifyLiveSmokeEra72Overall = "PASSED" | "FAILED" | "SKIPPED";

export type ShopifyLiveSmokeEra72ProofStatus =
  | "proof_passed"
  | "proof_passed_webhook_synthetic"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type ShopifyLiveSmokeEra72Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type ShopifyLiveSmokeEra72Summary = {
  version: typeof SHOPIFY_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: ShopifyLiveSmokeEra72Overall;
  proofStatus: ShopifyLiveSmokeEra72ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: ShopifyLiveSmokeEra72Overall | null;
  missingEnvVars: string[];
  steps: ShopifyLiveSmokeEra72Step[];
  honestyNote: string;
};

export function isPlaceholderShopifyStoreHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("example.com") ||
    normalized.endsWith(".local") ||
    normalized === "localhost"
  );
}

export function auditShopifyLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/shopify/kitchen-import.service.ts") {
      if (!src.includes("importShopifyOrderToKitchen")) {
        failures.push("kitchen-import.service.ts missing importShopifyOrderToKitchen");
      }
    }
    if (rel === "services/integrations/shopify/inventory-sync.service.ts") {
      if (!src.includes("syncShopifyInventoryFromOrder")) {
        failures.push("inventory-sync.service.ts missing syncShopifyInventoryFromOrder");
      }
      if (!src.includes("syncShopifyInventoryFromProductWebhook")) {
        failures.push("inventory-sync.service.ts missing syncShopifyInventoryFromProductWebhook");
      }
    }
    if (rel === "lib/webhooks/shopify-webhook-processor.ts") {
      if (!src.includes("importShopifyOrderToKitchen")) {
        failures.push("shopify-webhook-processor.ts missing kitchen import");
      }
      if (!src.includes("syncShopifyInventoryFromOrder")) {
        failures.push("shopify-webhook-processor.ts missing outbound inventory sync");
      }
      if (!src.includes("syncShopifyInventoryFromProductWebhook")) {
        failures.push("shopify-webhook-processor.ts missing inbound inventory sync");
      }
    }
    if (rel === "scripts/smoke-shopify-live.ts") {
      if (!src.includes("kds_kitchen_import")) {
        failures.push("smoke-shopify-live.ts missing kds_kitchen_import step");
      }
      if (!src.includes("inventory_sync_bidirectional_complete")) {
        failures.push("smoke-shopify-live.ts missing inventory_sync_bidirectional_complete step");
      }
      if (!src.includes("appendShopifyInventoryProofStepsAfterOrder")) {
        failures.push("smoke-shopify-live.ts missing inbound inventory proof wiring");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveShopifyLiveSmokeEra72ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: ShopifyLiveSmokeEra72Overall | null;
  liveProofStatus?: string;
}): ShopifyLiveSmokeEra72ProofStatus {
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

export function resolveShopifyLiveSmokeEra72Overall(
  proofStatus: ShopifyLiveSmokeEra72ProofStatus,
): ShopifyLiveSmokeEra72Overall {
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

export function buildShopifyLiveSmokeEra72Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: ShopifyLiveSmokeEra72Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: ShopifyLiveSmokeEra72Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): ShopifyLiveSmokeEra72Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveShopifyLiveSmokeEra72ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveShopifyLiveSmokeEra72Overall(proofStatus);

  const steps: ShopifyLiveSmokeEra72Step[] = [
    {
      id: "wiring_audit",
      label: "Shopify → webhook → KDS → inventory wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 72 Shopify live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_admin_webhook_kds_inventory",
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
    version: SHOPIFY_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Shopify Admin API + staging orders/create webhook + ExternalOrder + KDS kitchen import — inventory sync on orders/create.",
  };
}

export function formatShopifyLiveSmokeEra72ReportLines(
  summary: ShopifyLiveSmokeEra72Summary,
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
