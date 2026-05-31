import { describe, expect, it } from "vitest";

import { DEFAULT_POS_SETTINGS, mergePosSettings } from "@/lib/pos/pos-settings";
import {
  classifyOfflineCheckoutError,
  offlinePaymentReference,
  offlineSyncStatusLabel,
  resolveOfflineSyncConflict,
} from "@/lib/pos/offline-sync";

describe("pos settings defaults", () => {
  it("enables offline queue by default", () => {
    expect(DEFAULT_POS_SETTINGS.offlineQueueEnabled).toBe(true);
    expect(mergePosSettings(null)).toEqual(DEFAULT_POS_SETTINGS);
    expect(mergePosSettings({ offlineQueueEnabled: false }).offlineQueueEnabled).toBe(false);
    expect(mergePosSettings({}).offlineQueueEnabled).toBe(true);
  });
});

describe("offline sync conflict resolution", () => {
  it("classifies checkout errors", () => {
    expect(classifyOfflineCheckoutError("Register duplicate sale already exists")).toBe("duplicate_sale");
    expect(classifyOfflineCheckoutError("Inventory depletion failed")).toBe("inventory_shortage");
    expect(classifyOfflineCheckoutError("Shift is not open for this register.")).toBe("shift_closed");
  });

  it("removes duplicate replays automatically", () => {
    expect(
      resolveOfflineSyncConflict({
        strategy: "manual_review",
        conflict: {
          offlineSaleId: "sale-1",
          reason: "duplicate_sale",
          message: "duplicate",
        },
      }),
    ).toBe("remove");
  });

  it("keeps inventory conflicts for manual review by default", () => {
    expect(
      resolveOfflineSyncConflict({
        strategy: "manual_review",
        conflict: {
          offlineSaleId: "sale-2",
          reason: "inventory_shortage",
          message: "no stock",
        },
      }),
    ).toBe("keep_conflict");
  });

  it("uses server_wins strategy to drop blocked replays", () => {
    expect(
      resolveOfflineSyncConflict({
        strategy: "server_wins",
        conflict: {
          offlineSaleId: "sale-3",
          reason: "inventory_shortage",
          message: "no stock",
        },
      }),
    ).toBe("remove");
  });
});

describe("offline sync labels", () => {
  it("describes queued offline state", () => {
    expect(
      offlineSyncStatusLabel({
        online: false,
        queuedCount: 2,
        conflictCount: 0,
        syncState: "idle",
      }),
    ).toContain("2 sale(s) queued");
  });

  it("builds stable offline payment references", () => {
    expect(offlinePaymentReference("abc-123")).toBe("offline:abc-123");
  });
});
