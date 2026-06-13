import { expect, test } from "@playwright/test";

import {
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
  OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID,
  OFFLINE_POS_PCI_NOOP_V1_ALGORITHM,
  POS_TERMINAL_PATH,
  isNoopV1EmptyOnly,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";
import { runOfflinePosPciNoopV1ContractChecks } from "@/lib/qa/offline-pos-pci-flow-e2e-scoring";

import { runOfflinePosPciFlowE2E } from "./helpers/offline-pos-pci-flow-flow";
import {
  skipOfflinePosPciFlowIfGateDisabled,
  skipOfflinePosPciFlowIfNotAuthed,
} from "./helpers/offline-pos-pci-flow-ready";

/**
 * Offline POS PCI flow — network off → transaction → noop-v1 check → reconnect → sync.
 *
 * @see e2e/offline-pos-reconnect-sync.spec.ts
 * @see lib/pos/offline-pci-local-encryption.ts
 * @see docs/offline-pos-pci-review.md
 */

test.describe("offline pos pci flow policy", () => {
  test("exports pci flow steps and noop-v1 contract", () => {
    expect(OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID).toBe("offline-pos-pci-flow-e2e-p1-21-v1");
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(OFFLINE_POS_INDEXED_DB_NAME).toBe("kitchenos-offline-pos");
    expect(OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS).toEqual([
      "go_offline",
      "queue_transaction",
      "verify_noop_v1_pci",
      "reconnect_online",
      "sync_drain",
    ]);
    expect(isNoopV1EmptyOnly(OFFLINE_POS_PCI_NOOP_V1_ALGORITHM, "", "")).toBe(true);
    expect(isNoopV1EmptyOnly(OFFLINE_POS_PCI_NOOP_V1_ALGORITHM, "x", "4242")).toBe(false);
  });

  test("passes noop-v1 PCI contract checks", async () => {
    const result = await runOfflinePosPciNoopV1ContractChecks();
    expect(result.passed).toBe(true);
    expect(result.passedCount).toBe(result.checkCount);
  });
});

test.describe("offline pos pci flow (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Offline POS PCI flow runs in chromium-authed project only",
    );
    skipOfflinePosPciFlowIfGateDisabled();
    skipOfflinePosPciFlowIfNotAuthed();
  });

  test("offline transaction syncs after reconnect with noop-v1 PCI guard", async ({
    page,
    context,
  }) => {
    const result = await runOfflinePosPciFlowE2E(page, context);
    expect(result.steps).toEqual(OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS);
    expect(result.noopV1ContractPassed).toBe(true);
    expect(result.noopV1CheckCount).toBeGreaterThanOrEqual(4);
    expect(result.queuedPeak).toBeGreaterThanOrEqual(1);
  });
});
