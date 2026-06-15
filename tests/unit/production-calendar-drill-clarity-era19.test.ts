import { describe, expect, it } from "vitest";

import {
  buildProductionCalendarDrillChecklist,
  buildProductionCalendarDrillHero,
  buildProductionCalendarDrillHref,
  productionCalendarDrillPolicySnapshot,
  resolveProductionCalendarBriefingDrillHref,
  summarizeProductionCalendarDrillChecklist,
} from "@/lib/production/production-calendar-drill-clarity-era19";
import {
  PRODUCTION_CALENDAR_DRILL_ANCHOR,
  PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_BACKLOG_ID,
  PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID,
  PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_PROOF_STATUS,
} from "@/lib/production/production-calendar-drill-clarity-era19-policy";
import { productionCalendarActionsForBriefing } from "@/lib/briefing/owner-daily-briefing-production-calendar-era19";
import { buildOwnerDailyBriefingProductionCalendarSlice } from "@/lib/briefing/owner-daily-briefing-production-calendar-era19";

describe("production-calendar-drill-clarity-era19 policy", () => {
  it("locks era19 production calendar drill clarity policy", () => {
    expect(PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID).toBe(
      "era19-production-calendar-drill-clarity-v1",
    );
    expect(PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_BACKLOG_ID).toBe("KOS-E19-030");
    expect(PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_PROOF_STATUS).toBe(
      "production_calendar_drill_clarity_wired",
    );
    expect(PRODUCTION_CALENDAR_DRILL_ANCHOR).toBe("production-calendar-drill");
    expect(buildProductionCalendarDrillHref()).toContain("#production-calendar-drill");
  });
});

describe("buildProductionCalendarDrillChecklist", () => {
  it("blocks drill when no plan tasks exist", () => {
    const steps = buildProductionCalendarDrillChecklist({
      hasPlanTasks: false,
      summary: { overdue: 0, dueToday: 0, inProgress: 0, completedToday: 0 },
    });

    expect(steps[0]?.status).toBe("blocked");
    expect(steps.every((step) => step.status === "blocked" || step.id === "review_today_focus")).toBe(
      true,
    );
  });

  it("activates clear overdue when batches are past due", () => {
    const steps = buildProductionCalendarDrillChecklist({
      hasPlanTasks: true,
      summary: { overdue: 2, dueToday: 1, inProgress: 0, completedToday: 0 },
    });

    expect(steps.find((step) => step.id === "clear_overdue")?.status).toBe("active");
    expect(steps.find((step) => step.id === "mark_in_progress")?.status).toBe("blocked");
  });

  it("activates in progress when due today with no overdue", () => {
    const steps = buildProductionCalendarDrillChecklist({
      hasPlanTasks: true,
      summary: { overdue: 0, dueToday: 2, inProgress: 0, completedToday: 0 },
    });

    expect(steps.find((step) => step.id === "clear_overdue")?.status).toBe("complete");
    expect(steps.find((step) => step.id === "mark_in_progress")?.status).toBe("active");
  });

  it("completes drill when today's open batches are cleared", () => {
    const steps = buildProductionCalendarDrillChecklist({
      hasPlanTasks: true,
      summary: { overdue: 0, dueToday: 0, inProgress: 0, completedToday: 3 },
    });

    const summary = summarizeProductionCalendarDrillChecklist(steps);
    expect(steps.find((step) => step.id === "mark_completed")?.status).toBe("complete");
    expect(summary.drillComplete).toBe(true);
  });
});

describe("buildProductionCalendarDrillHero", () => {
  it("shows urgent hero when overdue batches exist", () => {
    const hero = buildProductionCalendarDrillHero({
      hasPlanTasks: true,
      summary: { overdue: 1, dueToday: 0, inProgress: 0, completedToday: 0 },
    });

    expect(hero.tone).toBe("urgent");
    expect(hero.headline).toContain("overdue");
  });

  it("shows success hero when today's drill is complete", () => {
    const hero = buildProductionCalendarDrillHero({
      hasPlanTasks: true,
      summary: { overdue: 0, dueToday: 0, inProgress: 0, completedToday: 2 },
    });

    expect(hero.tone).toBe("success");
    expect(hero.headline).toContain("complete");
  });
});

describe("resolveProductionCalendarBriefingDrillHref", () => {
  it("routes overdue briefing links to drill anchor", () => {
    const href = resolveProductionCalendarBriefingDrillHref({
      overdue: 2,
      calendarHref: "/dashboard/production/calendar",
      taskHref: "/dashboard/production/calendar?week=2026-05-26#day-2026-05-24",
    });

    expect(href).toContain("#production-calendar-drill");
  });

  it("preserves task href when no overdue batches", () => {
    const taskHref = "/dashboard/production/calendar?week=2026-05-26#day-2026-05-28";
    expect(
      resolveProductionCalendarBriefingDrillHref({
        overdue: 0,
        calendarHref: "/dashboard/production/calendar",
        taskHref,
      }),
    ).toBe(taskHref);
  });
});

describe("briefing production calendar drill cross-link", () => {
  it("wires overdue briefing action to production calendar drill", () => {
    const slice = buildOwnerDailyBriefingProductionCalendarSlice({
      tasks: [
        {
          id: "t1",
          title: "Sauce prep",
          planDate: new Date("2026-05-26T12:00:00Z"),
          status: "SCHEDULED",
          batchSize: 4,
        },
      ],
      today: new Date("2026-05-28T12:00:00Z"),
    });

    const actions = productionCalendarActionsForBriefing(slice);
    expect(actions[0]?.href).toContain("#production-calendar-drill");
  });

  it("exports policy snapshot with drill href", () => {
    const snapshot = productionCalendarDrillPolicySnapshot();
    expect(snapshot.policyId).toBe(PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID);
    expect(snapshot.drillHref).toContain("#production-calendar-drill");
  });
});
