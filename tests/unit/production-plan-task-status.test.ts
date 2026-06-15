import { describe, expect, it } from "vitest";

import {
  normalizeProductionPlanTaskStatus,
  parseProductionPlanTaskStatus,
  productionPlanTaskStatusCardClass,
  PRODUCTION_PLAN_TASK_STATUSES,
} from "@/lib/production/production-plan-task-status";

describe("production plan task status", () => {
  it("parses canonical statuses case-insensitively", () => {
    expect(parseProductionPlanTaskStatus("scheduled")).toBe("SCHEDULED");
    expect(parseProductionPlanTaskStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(parseProductionPlanTaskStatus("completed")).toBe("COMPLETED");
    expect(parseProductionPlanTaskStatus("bogus")).toBeNull();
  });

  it("normalizes unknown values to SCHEDULED", () => {
    expect(normalizeProductionPlanTaskStatus("legacy")).toBe("SCHEDULED");
  });

  it("maps card classes for the three workflow states", () => {
    expect(productionPlanTaskStatusCardClass("SCHEDULED")).toContain("primary");
    expect(productionPlanTaskStatusCardClass("IN_PROGRESS")).toContain("amber");
    expect(productionPlanTaskStatusCardClass("COMPLETED")).toContain("muted");
  });

  it("locks the allowlisted status set", () => {
    expect(PRODUCTION_PLAN_TASK_STATUSES).toEqual([
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
    ]);
  });
});
