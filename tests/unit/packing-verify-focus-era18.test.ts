import { describe, expect, it } from "vitest";

import {
  PACKING_VERIFY_FOCUS_ERA18_POLICY_ID,
  PACKING_VERIFY_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/packing-verification/packing-verify-focus-era18-policy";
import {
  buildPackingVerifyFocusSnapshot,
  packingVerifyItemAnchor,
  pickPackingVerifyAttentionItems,
  resolvePackingVerifyItemRowNextAction,
  resolvePackingVerifySessionRowNextAction,
  shouldShowPackingVerifyAttentionStrip,
  summarizePackingVerifyFocus,
} from "@/lib/packing-verification/packing-verify-focus-era18";

const openSessions = [
  {
    id: "session-1",
    status: "IN_PROGRESS",
    itemCount: 3,
    customerName: "Alex",
    startedAt: "2026-05-28T09:00:00.000Z",
  },
] as const;

const recentScans = [
  { success: false },
  { success: true },
] as const;

const sessionItems = [
  {
    id: "item-1",
    title: "Meal prep box",
    status: "MISSING",
    allergenCheckStatus: "PENDING",
    labelCheckStatus: null,
    expectedQuantity: 2,
    verifiedQuantity: 0,
  },
  {
    id: "item-2",
    title: "Side salad",
    status: "PENDING",
    allergenCheckStatus: "CONFIRMED",
    labelCheckStatus: "PENDING",
    expectedQuantity: 1,
    verifiedQuantity: 0,
  },
] as const;

describe("packing verify focus era18", () => {
  it("locks era18 packing verify focus policy id", () => {
    expect(PACKING_VERIFY_FOCUS_ERA18_POLICY_ID).toBe("era18-packing-verify-focus-v1");
    expect(PACKING_VERIFY_FOCUS_ERA18_PROOF_STATUS).toBe("packing_verify_focus_attention_wired");
  });

  it("builds focus snapshot for open sessions, failed scans, and session gaps", () => {
    expect(buildPackingVerifyFocusSnapshot(openSessions, recentScans, sessionItems)).toEqual({
      openSessionCount: 1,
      failedScanCount: 1,
      pendingItemCount: 1,
      allergenPendingCount: 1,
      labelPendingCount: 1,
      issueItemCount: 1,
    });
  });

  it("prioritizes flagged lines and allergen attention items", () => {
    const focus = buildPackingVerifyFocusSnapshot(openSessions, recentScans, sessionItems);
    const items = pickPackingVerifyAttentionItems(openSessions, focus, sessionItems);

    expect(items[0]?.id).toBe("issue-lines");
    expect(items.some((item) => item.id === "allergen-pending")).toBe(true);
    expect(items.some((item) => item.id === "open-sessions")).toBe(true);
    expect(items[0]?.href).toBe(packingVerifyItemAnchor("item-1"));
  });

  it("shows attention strip when verify signals exist", () => {
    const focus = buildPackingVerifyFocusSnapshot(openSessions, recentScans, sessionItems);
    expect(shouldShowPackingVerifyAttentionStrip(focus)).toBe(true);
    expect(shouldShowPackingVerifyAttentionStrip(buildPackingVerifyFocusSnapshot([], [], []))).toBe(false);
  });

  it("summarizes urgent verify focus", () => {
    const focus = buildPackingVerifyFocusSnapshot(openSessions, recentScans, sessionItems);
    expect(summarizePackingVerifyFocus(focus).hasUrgent).toBe(true);
  });

  it("resolves session and item row next actions", () => {
    expect(resolvePackingVerifySessionRowNextAction(openSessions[0])).toEqual({
      label: "Resume verify",
      kind: "resume",
      sessionId: "session-1",
      tone: "urgent",
    });

    expect(resolvePackingVerifyItemRowNextAction(sessionItems[0])).toEqual({
      label: "Review flagged line",
      href: packingVerifyItemAnchor("item-1"),
      tone: "urgent",
    });

    expect(resolvePackingVerifyItemRowNextAction(sessionItems[1])).toEqual({
      label: "Check label",
      href: packingVerifyItemAnchor("item-2"),
      tone: "urgent",
    });
  });
});
