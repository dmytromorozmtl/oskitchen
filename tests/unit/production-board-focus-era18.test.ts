import { describe, expect, it } from "vitest";

import {
  PRODUCTION_BOARD_FOCUS_ERA18_BACKLOG_ID,
  PRODUCTION_BOARD_FOCUS_ERA18_POLICY_ID,
  PRODUCTION_BOARD_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/production/production-board-focus-era18-policy";
import {
  buildProductionBoardFocusSnapshot,
  pickProductionBoardAttentionItems,
  productionWorkItemAnchor,
  resolveProductionWorkItemRowNextAction,
  summarizeProductionBoardFocus,
} from "@/lib/production/production-board-focus-era18";

function item(
  over: Partial<{
    id: string;
    title: string;
    status: string;
    station: string | null;
    dueAt: string | null;
    requiresPacking: boolean;
  }> = {},
) {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Sourdough batch",
    status: "TO_PREP" as const,
    station: "Bakery",
    dueAt: null,
    requiresPacking: false,
    ...over,
  };
}

describe("production-board-focus-era18 policy", () => {
  it("registers era18 production board focus proof", () => {
    expect(PRODUCTION_BOARD_FOCUS_ERA18_POLICY_ID).toBe("era18-production-board-focus-v1");
    expect(PRODUCTION_BOARD_FOCUS_ERA18_PROOF_STATUS).toBe("production_board_focus_attention_wired");
    expect(PRODUCTION_BOARD_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-030");
  });
});

describe("pickProductionBoardAttentionItems", () => {
  it("prioritizes late and hold tasks", () => {
    const workItems = [
      item({
        id: "late-1",
        dueAt: "2020-01-01T12:00:00.000Z",
        status: "IN_PROGRESS",
      }),
      item({ id: "hold-1", status: "HOLD" }),
    ];
    const focus = buildProductionBoardFocusSnapshot(workItems, []);
    const items = pickProductionBoardAttentionItems(
      workItems,
      focus,
      [],
      "2026-05-28T00:00:00.000Z",
    );

    expect(items.some((entry) => entry.id === "late-tasks")).toBe(true);
    expect(items.some((entry) => entry.id === "hold-tasks")).toBe(true);
  });

  it("surfaces overloaded stations", () => {
    const workItems = [item({ status: "IN_PROGRESS" })];
    const focus = buildProductionBoardFocusSnapshot(workItems, [
      { station: "Grill", count: 8, overloaded: true },
    ]);
    const items = pickProductionBoardAttentionItems(
      workItems,
      focus,
      [{ station: "Grill", count: 8, overloaded: true }],
      "2026-05-28T00:00:00.000Z",
    );
    expect(items.some((entry) => entry.id === "station-overload")).toBe(true);
  });
});

describe("resolveProductionWorkItemRowNextAction", () => {
  it("routes hold tasks to clear hold action", () => {
    const action = resolveProductionWorkItemRowNextAction(
      item({ status: "HOLD" }),
    );
    expect(action?.label).toBe("Clear hold");
    expect(action?.href).toBe(productionWorkItemAnchor("00000000-0000-0000-0000-000000000001"));
  });

  it("routes pack handoff to packing", () => {
    const action = resolveProductionWorkItemRowNextAction(
      item({ status: "PACK_HANDOFF" }),
    );
    expect(action?.label).toBe("Open packing");
    expect(action?.href).toBe("/dashboard/packing");
  });
});

describe("summarizeProductionBoardFocus", () => {
  it("flags urgent when late tasks exist", () => {
    const focus = buildProductionBoardFocusSnapshot(
      [item({ dueAt: "2020-01-01T12:00:00.000Z", status: "TO_PREP" })],
      [],
    );
    expect(summarizeProductionBoardFocus(focus).hasUrgent).toBe(true);
  });
});
