import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditOfflinePosReconnectSyncE2E } from "@/lib/qa/offline-pos-reconnect-sync-e2e-audit";
import {
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_INDEXED_DB_STORE,
  OFFLINE_POS_RECONNECT_SYNC_AUDIT_SCRIPT,
  OFFLINE_POS_RECONNECT_SYNC_CI_WORKFLOW,
  OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID,
  OFFLINE_POS_RECONNECT_SYNC_E2E_SPEC,
  OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS,
  OFFLINE_POS_RECONNECT_SYNC_NPM_SCRIPT,
  OFFLINE_POS_RECONNECT_SYNC_UNIT_TEST,
  POS_TERMINAL_PATH,
  hasOfflinePosReconnectSyncCredentials,
  isOfflinePosReconnectSyncE2EEnabled,
  isOfflineQueueDrained,
  offlineQueueSyncSucceeded,
  resolveOfflineQueueSyncPhase,
} from "@/lib/qa/offline-pos-reconnect-sync-e2e-policy";

const ROOT = process.cwd();

describe("Offline POS → reconnect → sync E2E (P1-49)", () => {
  it("locks policy id and offline mode flow steps", () => {
    expect(OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID).toBe(
      "offline-pos-reconnect-sync-e2e-v1",
    );
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(OFFLINE_POS_INDEXED_DB_NAME).toBe("kitchenos-offline-pos");
    expect(OFFLINE_POS_INDEXED_DB_STORE).toBe("checkout_queue");
    expect(OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS).toHaveLength(4);
  });

  it("resolves offline queue sync phases", () => {
    expect(resolveOfflineQueueSyncPhase({ online: true, queuedCount: 2, planBlocked: false })).toBe(
      "online_syncing",
    );
    expect(
      offlineQueueSyncSucceeded({
        queuedBeforeSync: 2,
        queuedAfterSync: 0,
        syncedCount: 2,
        tableConflictCount: 0,
      }),
    ).toBe(true);
    expect(isOfflineQueueDrained({ queuedAfterSync: 0 })).toBe(true);
  });

  it("audits E2E spec, flow helper, and offline queue wiring", () => {
    const summary = auditOfflinePosReconnectSyncE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.offlineQueueFlowWired).toBe(true);
    expect(summary.posTerminalPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, OFFLINE_POS_RECONNECT_SYNC_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, OFFLINE_POS_RECONNECT_SYNC_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, OFFLINE_POS_RECONNECT_SYNC_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[OFFLINE_POS_RECONNECT_SYNC_NPM_SCRIPT]).toContain(
      "audit-offline-pos-reconnect-sync-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:offline-pos-reconnect-sync-e2e"]).toContain(
      OFFLINE_POS_RECONNECT_SYNC_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, OFFLINE_POS_RECONNECT_SYNC_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:offline-pos-reconnect-sync-e2e");
  });

  it("E2E gate requires E2E_OFFLINE_POS_E2E flag", () => {
    const original = process.env.E2E_OFFLINE_POS_E2E;
    delete process.env.E2E_OFFLINE_POS_E2E;
    expect(isOfflinePosReconnectSyncE2EEnabled()).toBe(false);
    process.env.E2E_OFFLINE_POS_E2E = "true";
    expect(isOfflinePosReconnectSyncE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_OFFLINE_POS_E2E = original;
    else delete process.env.E2E_OFFLINE_POS_E2E;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasOfflinePosReconnectSyncCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
