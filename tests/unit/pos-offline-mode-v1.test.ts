import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { auditPosOfflineModeV1, formatPosOfflineModeV1AuditLines } from "@/lib/pos/pos-offline-mode-v1-audit";
import { POS_OFFLINE_MODE_V1_CAPABILITIES } from "@/lib/pos/pos-offline-mode-v1-content";
import {
  clearPosLocalCart,
  loadPosLocalCart,
  POS_LOCAL_CART_STORAGE_KEY,
  savePosLocalCart,
} from "@/lib/pos/pos-local-cart";
import {
  POS_OFFLINE_MODE_V1_CAPABILITY_COUNT,
  POS_OFFLINE_MODE_V1_CI_WORKFLOW,
  POS_OFFLINE_MODE_V1_DOC,
  POS_OFFLINE_MODE_V1_NPM_SCRIPT,
  POS_OFFLINE_MODE_V1_POLICY_ID,
  POS_OFFLINE_MODE_V1_ROUTE,
  POS_OFFLINE_MODE_V1_TEST_IDS,
  POS_OFFLINE_MODE_V1_UNIT_TEST,
} from "@/lib/pos/pos-offline-mode-v1-policy";
import {
  classifyOfflineCheckoutError,
  resolveOfflineSyncConflict,
} from "@/lib/pos/offline-sync";

const ROOT = process.cwd();

describe("POS offline mode v1 (P2-88)", () => {
  it("locks policy id, route, and five capabilities", () => {
    expect(POS_OFFLINE_MODE_V1_POLICY_ID).toBe("pos-offline-mode-v1-p2-88-v1");
    expect(POS_OFFLINE_MODE_V1_ROUTE).toBe("/dashboard/pos/settings/offline");
    expect(POS_OFFLINE_MODE_V1_CAPABILITY_COUNT).toBe(5);
    expect(POS_OFFLINE_MODE_V1_CAPABILITIES).toHaveLength(5);
    expect(POS_OFFLINE_MODE_V1_TEST_IDS).toHaveLength(6);
  });

  it("passes full POS offline mode v1 audit", () => {
    const summary = auditPosOfflineModeV1(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.localCartWired).toBe(true);
    expect(summary.auditActionsRegistered).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.legacyDocLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("persists local cart snapshots in sessionStorage", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      setItem: (key: string, value: string) => store.set(key, value),
      getItem: (key: string) => store.get(key) ?? null,
      removeItem: (key: string) => store.delete(key),
    });
    vi.stubGlobal("window", { sessionStorage: globalThis.sessionStorage });

    savePosLocalCart("reg-1", [
      { productId: "prod-1", title: "Latte", quantity: 2, unitPrice: 4.5 },
    ]);
    const loaded = loadPosLocalCart("reg-1");
    expect(loaded?.cart).toHaveLength(1);
    expect(loaded?.cart[0]?.title).toBe("Latte");
    clearPosLocalCart("reg-1");
    expect(loadPosLocalCart("reg-1")).toBeNull();
    expect(POS_LOCAL_CART_STORAGE_KEY).toContain("kitchenos-pos-local-cart");

    vi.unstubAllGlobals();
  });

  it("classifies offline sync conflicts", () => {
    expect(classifyOfflineCheckoutError("Sale already recorded")).toBe("duplicate_sale");
    const resolution = resolveOfflineSyncConflict({
      strategy: "manual_review",
      conflict: {
        offlineSaleId: "00000000-0000-4000-8000-000000000001",
        reason: "inventory_shortage",
        message: "Insufficient inventory",
      },
    });
    expect(resolution).toBe("keep_conflict");
  });

  it("registers offline audit actions", () => {
    expect(AUDIT_ACTIONS.POS_OFFLINE_SALE_QUEUED).toBe("POS_OFFLINE_SALE_QUEUED");
    expect(AUDIT_ACTIONS.POS_OFFLINE_SYNC_COMPLETED).toBe("POS_OFFLINE_SYNC_COMPLETED");
    expect(AUDIT_ACTIONS.POS_OFFLINE_SYNC_CONFLICT).toBe("POS_OFFLINE_SYNC_CONFLICT");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, POS_OFFLINE_MODE_V1_DOC))).toBe(true);
    expect(existsSync(join(ROOT, POS_OFFLINE_MODE_V1_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[POS_OFFLINE_MODE_V1_NPM_SCRIPT]).toContain("audit-pos-offline-mode-v1.ts");
    expect(pkg.scripts?.["test:ci:pos-offline-mode-v1"]).toContain(POS_OFFLINE_MODE_V1_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, POS_OFFLINE_MODE_V1_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:pos-offline-mode-v1");
  });

  it("formats audit lines", () => {
    const lines = formatPosOfflineModeV1AuditLines(auditPosOfflineModeV1(ROOT));
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
