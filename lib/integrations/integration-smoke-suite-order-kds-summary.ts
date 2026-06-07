/**
 * Summary helpers — 18 LIVE integration smoke suite (order→KDS).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_ORCHESTRATOR,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_OPS_DOC,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_WORKFLOW,
  integrationSmokeSuiteRequiresKdsTicket,
} from "@/lib/integrations/integration-smoke-suite-order-kds-policy";

export type IntegrationSmokeSuiteStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type IntegrationSmokeSuiteStep = {
  integrationId: string;
  name: string;
  roundTripKind: string;
  status: IntegrationSmokeSuiteStepStatus;
  smokeScript: string | null;
  kdsRequired: boolean;
  reason?: string;
};

export type IntegrationSmokeSuiteOverall = "PASSED" | "FAILED" | "SKIPPED";

export type IntegrationSmokeSuiteSummary = {
  version: typeof INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID;
  runAt: string;
  overall: IntegrationSmokeSuiteOverall;
  passedCount: number;
  skippedCount: number;
  failedCount: number;
  expectedCount: number;
  channelOrderKdsCount: number;
  paymentOrderKdsCount: number;
  syncOnlyCount: number;
  steps: IntegrationSmokeSuiteStep[];
  honestyNote: string;
};

export function resolveIntegrationSmokeSuiteOverall(
  steps: readonly IntegrationSmokeSuiteStep[],
): IntegrationSmokeSuiteOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildIntegrationSmokeSuiteSummary(
  steps: readonly IntegrationSmokeSuiteStep[],
  runAt: Date = new Date(),
): IntegrationSmokeSuiteSummary {
  const passedCount = steps.filter((step) => step.status === "PASSED").length;
  const skippedCount = steps.filter((step) => step.status === "SKIPPED").length;
  const failedCount = steps.filter((step) => step.status === "FAILED").length;

  return {
    version: INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID,
    runAt: runAt.toISOString(),
    overall: resolveIntegrationSmokeSuiteOverall(steps),
    passedCount,
    skippedCount,
    failedCount,
    expectedCount: INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT,
    channelOrderKdsCount: steps.filter((step) => step.roundTripKind === "channel_order_kds").length,
    paymentOrderKdsCount: steps.filter((step) => step.roundTripKind === "payment_order_kds").length,
    syncOnlyCount: steps.filter((step) => step.roundTripKind === "sync_only").length,
    steps: [...steps],
    honestyNote:
      "Sync-only LIVE integrations skip KDS ticket proof. Channel/payment entries require order→KDS round-trip when merchant creds are present.",
  };
}

export function auditIntegrationSmokeSuiteOrderKdsWiring(root: string): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET.length !== INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT) {
    failures.push(
      `fleet length ${INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET.length} !== ${INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT}`,
    );
  }

  for (const path of [
    INTEGRATION_SMOKE_SUITE_ORDER_KDS_ORCHESTRATOR,
    INTEGRATION_SMOKE_SUITE_ORDER_KDS_OPS_DOC,
    INTEGRATION_SMOKE_SUITE_ORDER_KDS_WORKFLOW,
  ]) {
    if (!existsSync(join(root, path))) {
      failures.push(`missing ${path}`);
    }
  }

  const orchestrator = readFileSync(
    join(root, INTEGRATION_SMOKE_SUITE_ORDER_KDS_ORCHESTRATOR),
    "utf8",
  );
  if (!orchestrator.includes("INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET")) {
    failures.push("orchestrator missing fleet import");
  }

  for (const entry of INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET) {
    if (entry.roundTripKind === "kds_board_probe") continue;
    if (!entry.smokeScript) {
      failures.push(`${entry.integrationId} missing smokeScript`);
    }
    if (integrationSmokeSuiteRequiresKdsTicket(entry) && entry.kdsVerification === "not_applicable") {
      failures.push(`${entry.integrationId} requires KDS verification`);
    }
  }

  return { ok: failures.length === 0, failures };
}

export function formatIntegrationSmokeSuiteStepLine(step: IntegrationSmokeSuiteStep): string {
  const kdsTag = step.kdsRequired ? "order→KDS" : "sync-only";
  if (step.status === "SKIPPED") {
    return `[SKIPPED] ${step.name} (${kdsTag}): ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.name} (${kdsTag})${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.name} (${kdsTag})`;
}
