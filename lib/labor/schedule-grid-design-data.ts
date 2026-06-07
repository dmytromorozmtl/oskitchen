import { cn } from "@/lib/utils";
import {
  SCHEDULE_GRID_LABOR_HEAT_LOW_MAX,
  SCHEDULE_GRID_LABOR_HEAT_MEDIUM_MAX,
  type ScheduleGridDesignConflictSummary,
  type ScheduleGridLaborHeatLevel,
} from "@/lib/labor/schedule-grid-design-policy";
import type { ScheduleGridConflict } from "@/lib/labor/schedule-grid-drag-drop-policy";

export type ScheduleGridDayLaborOverlay = {
  day: string;
  dollars: number;
  sharePercent: number;
  heat: ScheduleGridLaborHeatLevel;
};

export type ScheduleGridCellLaborOverlay = {
  dollars: number;
  heat: ScheduleGridLaborHeatLevel;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function resolveScheduleGridLaborHeat(sharePercent: number): ScheduleGridLaborHeatLevel {
  if (sharePercent <= 0) return "none";
  if (sharePercent <= SCHEDULE_GRID_LABOR_HEAT_LOW_MAX) return "low";
  if (sharePercent <= SCHEDULE_GRID_LABOR_HEAT_MEDIUM_MAX) return "medium";
  return "high";
}

export function buildScheduleGridDayLaborOverlays(input: {
  days: readonly string[];
  dailyLaborTotals: Record<string, number>;
  weekLaborTotal: number;
}): ScheduleGridDayLaborOverlay[] {
  const weekTotal = input.weekLaborTotal > 0 ? input.weekLaborTotal : 1;
  return input.days.map((day) => {
    const dollars = input.dailyLaborTotals[day] ?? 0;
    const sharePercent = round1((dollars / weekTotal) * 100);
    return {
      day,
      dollars,
      sharePercent,
      heat: resolveScheduleGridLaborHeat(sharePercent),
    };
  });
}

export function buildScheduleGridCellLaborOverlay(
  cellLaborDollars: number,
  maxCellLabor: number,
): ScheduleGridCellLaborOverlay {
  if (cellLaborDollars <= 0 || maxCellLabor <= 0) {
    return { dollars: cellLaborDollars, heat: "none" };
  }
  const sharePercent = (cellLaborDollars / maxCellLabor) * 100;
  return {
    dollars: cellLaborDollars,
    heat: resolveScheduleGridLaborHeat(sharePercent),
  };
}

export function maxScheduleGridCellLabor(
  shiftsByCell: ReadonlyMap<string, { laborCost: number }[]>,
): number {
  let max = 0;
  for (const shifts of shiftsByCell.values()) {
    const total = shifts.reduce((sum, shift) => sum + shift.laborCost, 0);
    if (total > max) max = total;
  }
  return max;
}

export function summarizeScheduleGridDesignConflicts(
  conflicts: readonly ScheduleGridConflict[],
): ScheduleGridDesignConflictSummary {
  const overlapCount = conflicts.filter((c) => c.kind === "overlap").length;
  const overtimeCount = conflicts.filter((c) => c.kind === "weekly_overtime").length;
  return {
    overlapCount,
    overtimeCount,
    hasBlockingConflict: overlapCount > 0,
  };
}

export function scheduleGridLaborHeatCellClass(heat: ScheduleGridLaborHeatLevel): string {
  switch (heat) {
    case "high":
      return "bg-violet-500/15 dark:bg-violet-500/20";
    case "medium":
      return "bg-violet-500/8 dark:bg-violet-500/12";
    case "low":
      return "bg-violet-500/4 dark:bg-violet-500/8";
    default:
      return "bg-muted/10";
  }
}

export function scheduleGridLaborHeatBarClass(heat: ScheduleGridLaborHeatLevel): string {
  switch (heat) {
    case "high":
      return "bg-violet-600 dark:bg-violet-400";
    case "medium":
      return "bg-violet-500/80 dark:bg-violet-400/80";
    case "low":
      return "bg-violet-400/60 dark:bg-violet-300/60";
    default:
      return "bg-muted-foreground/20";
  }
}

export function scheduleGridConflictShiftClass(hasConflict: boolean): string {
  return cn(
    hasConflict && "border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30",
  );
}

export function scheduleGridDropTargetClass(isOver: boolean): string {
  return cn(
    "min-w-[120px] border border-border/60 p-1 align-top transition-colors",
    isOver ? "bg-primary/10 ring-1 ring-primary/40" : scheduleGridLaborHeatCellClass("none"),
  );
}
