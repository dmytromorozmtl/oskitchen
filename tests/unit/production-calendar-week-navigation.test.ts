import { describe, expect, it } from "vitest";

import {
  adjacentProductionPlanDateIso,
  parseProductionCalendarWeekStart,
  productionCalendarWeekDays,
  productionCalendarWeekHref,
  weekStartMonday,
} from "@/lib/production/production-calendar-week-navigation";

describe("production calendar week navigation", () => {
  it("normalizes week start to Monday", () => {
    const wed = new Date("2026-05-27T12:00:00");
    const mon = weekStartMonday(wed);
    expect(mon.getDay()).toBe(1);
    expect(mon.toISOString().slice(0, 10)).toBe("2026-05-25");
  });

  it("parses week query param to Monday of that week", () => {
    const start = parseProductionCalendarWeekStart("2026-05-28");
    expect(start.toISOString().slice(0, 10)).toBe("2026-05-25");
  });

  it("builds seven day columns for a week", () => {
    const start = parseProductionCalendarWeekStart("2026-05-25");
    const days = productionCalendarWeekDays(start);
    expect(days).toHaveLength(7);
    expect(days[0]!.toISOString().slice(0, 10)).toBe("2026-05-25");
    expect(days[6]!.toISOString().slice(0, 10)).toBe("2026-05-31");
  });

  it("adjacent plan dates cross week boundaries on Monday and Sunday columns", () => {
    const start = parseProductionCalendarWeekStart("2026-05-25");
    expect(adjacentProductionPlanDateIso(start, 0, "previous")).toBe("2026-05-24");
    expect(adjacentProductionPlanDateIso(start, 6, "next")).toBe("2026-06-01");
    expect(adjacentProductionPlanDateIso(start, 1, "previous")).toBe("2026-05-25");
  });

  it("builds week navigation hrefs with week query param", () => {
    const start = parseProductionCalendarWeekStart("2026-05-25");
    expect(productionCalendarWeekHref(start, -7)).toBe(
      "/dashboard/production/calendar?week=2026-05-18",
    );
    expect(productionCalendarWeekHref(start, 7)).toBe(
      "/dashboard/production/calendar?week=2026-06-01",
    );
  });
});
