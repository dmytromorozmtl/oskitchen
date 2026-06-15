import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID,
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";
import {
  POS_OFFLINE_MODE_E2E_CI_SCRIPTS,
  POS_OFFLINE_MODE_E2E_CONTRACT,
  POS_OFFLINE_MODE_E2E_HELPER_PATH,
  POS_OFFLINE_MODE_E2E_PHASE_COUNT,
  POS_OFFLINE_MODE_E2E_POLICY_ID,
  POS_OFFLINE_MODE_E2E_SPEC_PATH,
  POS_OFFLINE_MODE_E2E_WORKFLOW_PATH,
  posOfflineModePhaseIds,
} from "@/lib/pos/pos-offline-mode-e2e-policy";

const ROOT = process.cwd();

describe("POS offline mode E2E (Absolute Final Task 52)", () => {
  it("locks three phases: disconnect, queue, sync", () => {
    expect(POS_OFFLINE_MODE_E2E_POLICY_ID).toBe("pos-offline-mode-e2e-absolute-final-v1");
    expect(POS_OFFLINE_MODE_E2E_PHASE_COUNT).toBe(3);
    expect(posOfflineModePhaseIds()).toEqual([
      "network_disconnect",
      "queue_persist",
      "sync_drain",
    ]);
    expect(POS_OFFLINE_MODE_E2E_CONTRACT.upstreamPolicyId).toBe(
      OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID,
    );
    expect(POS_OFFLINE_MODE_E2E_CONTRACT.indexedDbName).toBe("kitchenos-offline-pos");
    expect(POS_OFFLINE_MODE_E2E_CONTRACT.terminalPath).toBe("/dashboard/pos/terminal");
  });

  it("ships Playwright spec and helper wired to offline queue flow", () => {
    const spec = readFileSync(join(ROOT, POS_OFFLINE_MODE_E2E_SPEC_PATH), "utf8");
    expect(spec).toContain("POS offline mode");
    expect(spec).toContain("POS_OFFLINE_MODE_E2E_PHASES");
    expect(spec).toContain("setOffline(true)");
    expect(spec).toContain("getOfflineIndexedDbQueueSize");

    const helper = readFileSync(join(ROOT, POS_OFFLINE_MODE_E2E_HELPER_PATH), "utf8");
    expect(helper).toContain("preparePosTerminalForOfflineMode");
    expect(helper).toContain("runOfflineCashSaleQueueAndSyncFlow");
  });

  it("ships GHA workflow, playwright project, and npm scripts", () => {
    const workflow = readFileSync(join(ROOT, POS_OFFLINE_MODE_E2E_WORKFLOW_PATH), "utf8");
    expect(workflow).toContain("POS offline mode");
    expect(workflow).toContain("test:e2e:pos-offline-mode");

    const playwrightConfig = readFileSync(join(ROOT, "playwright.config.ts"), "utf8");
    expect(playwrightConfig).toContain("pos-offline-mode.spec.ts");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of POS_OFFLINE_MODE_E2E_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.["test:e2e:pos-offline-mode"]).toContain(POS_OFFLINE_MODE_E2E_SPEC_PATH);
  });
});
