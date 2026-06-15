/**
 * AI Inventory Manager smoke summary — wiring audit (Era 107).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_INVENTORY_MANAGER_ERA107_CAPABILITIES,
  AI_INVENTORY_MANAGER_ERA107_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA107_ROUTE,
  AI_INVENTORY_MANAGER_ERA107_SERVICE,
  AI_INVENTORY_MANAGER_ERA107_WIRING_PATHS,
} from "@/lib/ai/inventory-manager-era107-policy";

export const AI_INVENTORY_MANAGER_SMOKE_SUMMARY_VERSION = AI_INVENTORY_MANAGER_ERA107_POLICY_ID;

export type AiInventoryManagerSmokeEra107Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiInventoryManagerSmokeEra107ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiInventoryManagerSmokeEra107Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiInventoryManagerSmokeEra107Summary = {
  version: typeof AI_INVENTORY_MANAGER_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiInventoryManagerSmokeEra107Overall;
  proofStatus: AiInventoryManagerSmokeEra107ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: AiInventoryManagerSmokeEra107Step[];
  honestyNote: string;
};

export function auditAiInventoryManagerSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of AI_INVENTORY_MANAGER_ERA107_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === AI_INVENTORY_MANAGER_ERA107_SERVICE) {
      if (!src.includes("loadInventoryManagerSnapshot")) {
        failures.push("inventory-manager.ts missing loadInventoryManagerSnapshot");
      }
      if (!src.includes("buildWasteSignals")) {
        failures.push("inventory-manager.ts missing buildWasteSignals");
      }
      if (!src.includes("buildTheftSignals")) {
        failures.push("inventory-manager.ts missing buildTheftSignals");
      }
      if (!src.includes("buildShrinkageSignals")) {
        failures.push("inventory-manager.ts missing buildShrinkageSignals");
      }
    }

    if (rel === "lib/ai/inventory-manager-builders.ts") {
      if (!src.includes("buildWasteSignals")) {
        failures.push("inventory-manager-builders.ts missing buildWasteSignals");
      }
      if (!src.includes("buildTheftSignals")) {
        failures.push("inventory-manager-builders.ts missing buildTheftSignals");
      }
      if (!src.includes("buildShrinkageSignals")) {
        failures.push("inventory-manager-builders.ts missing buildShrinkageSignals");
      }
      if (!src.includes("buildInventoryManagerSnapshot")) {
        failures.push("inventory-manager-builders.ts missing buildInventoryManagerSnapshot");
      }
    }

    if (rel === "lib/ai/inventory-manager-policy.ts") {
      if (!src.includes("AI_INVENTORY_MANAGER_POLICY_ID")) {
        failures.push("inventory-manager-policy.ts missing policy id");
      }
      if (!src.includes("AI_INVENTORY_MANAGER_ROUTE")) {
        failures.push("inventory-manager-policy.ts missing route");
      }
    }

    if (rel === "app/dashboard/inventory/manager/page.tsx") {
      if (!src.includes("InventoryManagerClient")) {
        failures.push("inventory manager page missing InventoryManagerClient");
      }
      if (!src.includes("loadInventoryManagerSnapshot")) {
        failures.push("inventory manager page missing loadInventoryManagerSnapshot");
      }
    }

    if (rel === "components/inventory/inventory-manager-client.tsx") {
      if (!src.includes("ai-inventory-manager-root")) {
        failures.push("inventory-manager-client.tsx missing root test id");
      }
      if (!src.includes("ai-inventory-manager-daily-brief")) {
        failures.push("inventory-manager-client.tsx missing daily brief card");
      }
      if (!src.includes("wasteSignals")) {
        failures.push("inventory-manager-client.tsx missing waste signals UI");
      }
      if (!src.includes("theftSignals")) {
        failures.push("inventory-manager-client.tsx missing theft signals UI");
      }
      if (!src.includes("shrinkageSignals")) {
        failures.push("inventory-manager-client.tsx missing shrinkage signals UI");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveAiInventoryManagerSmokeEra107ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiInventoryManagerSmokeEra107ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiInventoryManagerSmokeEra107Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): AiInventoryManagerSmokeEra107Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveAiInventoryManagerSmokeEra107ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiInventoryManagerSmokeEra107Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiInventoryManagerSmokeEra107Step[] = [
    {
      id: "wiring_audit",
      label: "Waste + theft + shrinkage signals → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 107 AI Inventory Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: AI_INVENTORY_MANAGER_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: AI_INVENTORY_MANAGER_ERA107_ROUTE,
    capabilities: AI_INVENTORY_MANAGER_ERA107_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with waste logs, theft alerts, and completed inventory counts.",
  };
}

export function formatAiInventoryManagerSmokeEra107ReportLines(
  summary: AiInventoryManagerSmokeEra107Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
