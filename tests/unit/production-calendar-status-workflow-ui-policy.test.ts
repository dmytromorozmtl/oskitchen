import { describe, expect, it } from "vitest";

import {
  PRODUCTION_CALENDAR_STATUS_WORKFLOW_ACTION_NAME,
  PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_POLICY_ID,
  productionCalendarPageWiresStatusWorkflow,
} from "@/lib/production/production-calendar-status-workflow-ui-policy";

describe("production calendar status workflow UI policy", () => {
  it("locks era10 status workflow policy id", () => {
    expect(PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_POLICY_ID).toBe(
      "era10-production-calendar-status-workflow-ui-v1",
    );
  });

  it("detects status workflow wiring on the calendar page", () => {
    const sample = `
      import { updatePlanTaskStatusAction } from "@/actions/production-calendar";
      import { PRODUCTION_PLAN_TASK_STATUSES } from "@/lib/production/production-plan-task-status";
      <form action={updatePlanTaskStatusAction}>
        <input name="taskId" />
        <select name="status">{PRODUCTION_PLAN_TASK_STATUSES}</select>
      </form>
    `;
    expect(productionCalendarPageWiresStatusWorkflow(sample)).toBe(true);
    expect(PRODUCTION_CALENDAR_STATUS_WORKFLOW_ACTION_NAME).toBe("updatePlanTaskStatusAction");
  });
});
