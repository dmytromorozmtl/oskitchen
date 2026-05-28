import { describe, expect, it } from "vitest";

import {
  PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID,
  PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/production/production-calendar-today-focus-era18-policy";
import {
  pickProductionCalendarAttentionItems,
  productionCalendarTaskHref,
  summarizeProductionCalendarFocus,
} from "@/lib/production/production-calendar-today-focus-era18";

function task(
  over: Partial<{
    id: string;
    title: string;
    planDate: string;
    status: string;
    batchSize: number | null;
  }> = {},
) {
  return {
    id: over.id ?? "task-1",
    title: over.title ?? "Sourdough batch",
    planDate: new Date(`${over.planDate ?? "2026-05-28"}T12:00:00`),
    status: over.status ?? "SCHEDULED",
    batchSize: over.batchSize ?? 12,
  };
}

describe("production calendar today focus era18", () => {
  it("locks era18 production calendar today focus policy id", () => {
    expect(PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-production-calendar-today-focus-v1",
    );
    expect(PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_PROOF_STATUS).toBe(
      "production_calendar_today_focus_wired",
    );
  });

  it("counts overdue and due-today open tasks", () => {
    const summary = summarizeProductionCalendarFocus(
      [
        task({ planDate: "2026-05-26", status: "SCHEDULED" }),
        task({ id: "t2", planDate: "2026-05-28", status: "IN_PROGRESS" }),
        task({ id: "t3", planDate: "2026-05-28", status: "COMPLETED" }),
      ],
      "2026-05-28",
    );
    expect(summary.overdue).toBe(1);
    expect(summary.dueToday).toBe(1);
    expect(summary.inProgress).toBe(1);
    expect(summary.completedToday).toBe(1);
  });

  it("prioritizes overdue batches in attention strip", () => {
    const items = pickProductionCalendarAttentionItems(
      [
        task({ planDate: "2026-05-26", title: "Late prep" }),
        task({ id: "t2", planDate: "2026-05-28", title: "Today batch" }),
      ],
      "2026-05-28",
    );
    expect(items[0]?.id).toBe("overdue-batches");
    expect(items[0]?.tone).toBe("urgent");
  });

  it("builds week anchor href for a task", () => {
    const href = productionCalendarTaskHref(task({ planDate: "2026-05-26" }));
    expect(href).toContain("week=2026-05-25");
    expect(href).toContain("#day-2026-05-26");
  });
});
