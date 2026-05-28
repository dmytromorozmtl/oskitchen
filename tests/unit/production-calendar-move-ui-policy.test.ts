import { describe, expect, it } from "vitest";

import {
  PRODUCTION_CALENDAR_MOVE_ACTION_NAME,
  PRODUCTION_CALENDAR_MOVE_UI_EXTENDS_POLICY_ID,
  PRODUCTION_CALENDAR_MOVE_UI_POLICY_ID,
  productionCalendarPageWiresMoveTaskAction,
} from "@/lib/production/production-calendar-move-ui-policy";

describe("production calendar move UI policy", () => {
  it("locks era8 production calendar move UI policy id", () => {
    expect(PRODUCTION_CALENDAR_MOVE_UI_POLICY_ID).toBe(
      "era8-production-calendar-move-ui-v1",
    );
    expect(PRODUCTION_CALENDAR_MOVE_UI_EXTENDS_POLICY_ID).toBe(
      "era6-production-calendar-form-deny-v1",
    );
  });

  it("detects move task form wiring in page source", () => {
    const wired = `
      import { movePlanTaskAction } from "@/actions/production-calendar";
      <form action={movePlanTaskAction}>
        <input name="taskId" />
        <input name="planDate" />
      </form>
    `;
    expect(productionCalendarPageWiresMoveTaskAction(wired)).toBe(true);
    expect(productionCalendarPageWiresMoveTaskAction("no move")).toBe(false);
    expect(PRODUCTION_CALENDAR_MOVE_ACTION_NAME).toBe("movePlanTaskAction");
  });
});
