"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, GripVertical } from "lucide-react";

import { deleteShiftAction, moveScheduleGridShiftAction } from "@/actions/labor/schedule";
import { Badge } from "@/components/ui/badge";
import {
  SCHEDULE_GRID_DAY_LABELS,
  parseScheduleGridCellId,
  scheduleGridCellId,
} from "@/lib/labor/schedule-grid-drag-drop-policy";
import { assessScheduleGridMove } from "@/lib/labor/schedule-grid-drag-drop-policy";
import {
  buildScheduleGridCellLaborOverlay,
  buildScheduleGridDayLaborOverlays,
  maxScheduleGridCellLabor,
  scheduleGridConflictShiftClass,
  scheduleGridDropTargetClass,
  scheduleGridLaborHeatBarClass,
  scheduleGridLaborHeatCellClass,
  summarizeScheduleGridDesignConflicts,
} from "@/lib/labor/schedule-grid-design-data";
import {
  SCHEDULE_GRID_CONFLICT_LEGEND_TEST_ID,
  SCHEDULE_GRID_DESIGN_TEST_ID,
  SCHEDULE_GRID_LABOR_HEATMAP_TEST_ID,
  SCHEDULE_GRID_LABOR_OVERLAY_TEST_ID,
} from "@/lib/labor/schedule-grid-design-policy";
import type { ScheduleGridDragDropModel } from "@/services/labor/schedule-grid-drag-drop-service";
import { cn } from "@/lib/utils";

type ShiftRow = ScheduleGridDragDropModel["shifts"][number];
type StaffRow = ScheduleGridDragDropModel["staffRows"][number];

function GridCell({
  staffMemberId,
  shiftDate,
  dayLabel,
  laborTotal,
  laborHeat,
  children,
}: {
  staffMemberId: string;
  shiftDate: string;
  dayLabel: string;
  laborTotal: number;
  laborHeat: ReturnType<typeof buildScheduleGridCellLaborOverlay>["heat"];
  children: React.ReactNode;
}) {
  const cellId = scheduleGridCellId(staffMemberId, shiftDate);
  const { setNodeRef, isOver } = useDroppable({ id: cellId });

  return (
    <td
      ref={setNodeRef}
      className={cn(
        scheduleGridDropTargetClass(isOver),
        !isOver && scheduleGridLaborHeatCellClass(laborHeat),
      )}
      data-testid="schedule-grid-cell"
      data-cell-id={cellId}
      data-labor-heat={laborHeat}
    >
      <p className="mb-1 text-[10px] font-medium text-muted-foreground">{dayLabel}</p>
      <div className="space-y-1">{children}</div>
      <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">${laborTotal.toFixed(0)}</p>
    </td>
  );
}

function DraggableShiftCard({
  shift,
  canManage,
  hasConflict,
}: {
  shift: ShiftRow;
  canManage: boolean;
  hasConflict: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    disabled: !canManage,
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border bg-background p-1.5 text-[11px] shadow-sm",
        isDragging && "opacity-50",
        scheduleGridConflictShiftClass(hasConflict),
      )}
      data-testid="schedule-grid-shift"
    >
      {canManage ? (
        <button
          type="button"
          className="flex w-full cursor-grab items-start gap-1 text-left active:cursor-grabbing"
          {...listeners}
          {...attributes}
          aria-label={`Drag shift ${shift.startTime} to ${shift.endTime} for ${shift.staffName}`}
        >
          <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0">
            <span className="block font-medium leading-tight">
              {shift.startTime}–{shift.endTime}
            </span>
            {shift.roleLabel ? (
              <span className="block text-muted-foreground">{shift.roleLabel}</span>
            ) : null}
            <span className="block tabular-nums text-muted-foreground">${shift.laborCost.toFixed(0)}</span>
          </span>
        </button>
      ) : (
        <div>
          <p className="font-medium">
            {shift.startTime}–{shift.endTime}
          </p>
          {shift.roleLabel ? <p className="text-muted-foreground">{shift.roleLabel}</p> : null}
          <p className="tabular-nums text-muted-foreground">${shift.laborCost.toFixed(0)}</p>
        </div>
      )}
      {canManage && (
        <form action={deleteShiftAction} className="mt-1">
          <input type="hidden" name="shiftId" value={shift.id} />
          <button type="submit" className="text-[10px] text-destructive hover:underline">
            Remove
          </button>
        </form>
      )}
    </div>
  );
}

export function ScheduleGridDragDrop({
  model,
  canManage = true,
}: {
  model: ScheduleGridDragDropModel;
  canManage?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [lastConflict, setLastConflict] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const shiftsByCell = useMemo(() => {
    const map = new Map<string, ShiftRow[]>();
    for (const shift of model.shifts) {
      const key = scheduleGridCellId(shift.staffMemberId, shift.shiftDate);
      const list = map.get(key) ?? [];
      list.push(shift);
      map.set(key, list);
    }
    return map;
  }, [model.shifts]);

  const conflictShiftIds = useMemo(() => {
    const ids = new Set<string>();
    for (const shift of model.shifts) {
      const conflicts = assessScheduleGridMove(model.shifts, {
        shiftId: shift.id,
        staffMemberId: shift.staffMemberId,
        shiftDate: shift.shiftDate,
      });
      if (conflicts.some((c) => c.kind === "overlap")) ids.add(shift.id);
    }
    return ids;
  }, [model.shifts]);

  const dayLaborOverlays = useMemo(
    () =>
      buildScheduleGridDayLaborOverlays({
        days: model.days,
        dailyLaborTotals: model.dailyLaborTotals,
        weekLaborTotal: model.weekLaborTotal,
      }),
    [model.days, model.dailyLaborTotals, model.weekLaborTotal],
  );

  const maxCellLabor = useMemo(() => maxScheduleGridCellLabor(shiftsByCell), [shiftsByCell]);

  const designConflictSummary = useMemo(() => {
    const allConflicts = model.shifts.flatMap((shift) =>
      assessScheduleGridMove(model.shifts, {
        shiftId: shift.id,
        staffMemberId: shift.staffMemberId,
        shiftDate: shift.shiftDate,
      }),
    );
    return summarizeScheduleGridDesignConflicts(allConflicts);
  }, [model.shifts]);

  function onDragEnd(event: DragEndEvent) {
    if (!canManage) return;
    const { active, over } = event;
    if (!over) return;

    const shiftId = String(active.id);
    const target = parseScheduleGridCellId(String(over.id));
    if (!target) return;

    const shift = model.shifts.find((row) => row.id === shiftId);
    if (!shift) return;
    if (shift.staffMemberId === target.staffMemberId && shift.shiftDate === target.shiftDate) return;

    const conflicts = assessScheduleGridMove(model.shifts, {
      shiftId,
      staffMemberId: target.staffMemberId,
      shiftDate: target.shiftDate,
    });
    const overlap = conflicts.find((c) => c.kind === "overlap");
    if (overlap) {
      setLastConflict(overlap.message);
      return;
    }
    setLastConflict(null);

    const fd = new FormData();
    fd.set("shiftId", shiftId);
    fd.set("staffMemberId", target.staffMemberId);
    fd.set("shiftDate", target.shiftDate);
    startTransition(() => moveScheduleGridShiftAction(fd));
  }

  return (
    <div className="space-y-3" data-testid="schedule-grid-drag-drop">
      <div data-testid={SCHEDULE_GRID_DESIGN_TEST_ID} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          7shifts parity · staff × day grid
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          Week labor ${model.weekLaborTotal.toFixed(0)}
        </Badge>
        {conflictShiftIds.size > 0 && (
          <Badge variant="outline" className="rounded-full border-amber-500/50 text-amber-700 dark:text-amber-300">
            {conflictShiftIds.size} overlap conflict{conflictShiftIds.size === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      <div
        className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
        data-testid={SCHEDULE_GRID_CONFLICT_LEGEND_TEST_ID}
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-amber-500/60 bg-amber-500/10" aria-hidden />
          Overlap conflict
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("h-3 w-8 rounded", scheduleGridLaborHeatBarClass("high"))} aria-hidden />
          High labour day
        </span>
        <span>
          {designConflictSummary.overlapCount} overlap · {designConflictSummary.overtimeCount} OT warning
          {designConflictSummary.overtimeCount === 1 ? "" : "s"}
        </span>
      </div>

      {(lastConflict || conflictShiftIds.size > 0) && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            {lastConflict ??
              "Some shifts overlap on the same day — drag to resolve or adjust times."}
          </p>
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className={`overflow-x-auto rounded-xl border ${isPending ? "opacity-70" : ""}`}>
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="sticky left-0 z-10 min-w-[140px] border-r bg-muted/30 px-3 py-2 text-left text-xs font-semibold">
                  Team member
                </th>
                {model.days.map((day, idx) => {
                  const overlay = dayLaborOverlays[idx];
                  return (
                  <th key={day} className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground">
                    <div className="space-y-1">
                      <span>
                        {SCHEDULE_GRID_DAY_LABELS[idx]} · {day.slice(5)}
                      </span>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40"
                        data-testid={SCHEDULE_GRID_LABOR_HEATMAP_TEST_ID}
                        data-day={day}
                        title={`${overlay?.sharePercent ?? 0}% of week labor`}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            scheduleGridLaborHeatBarClass(overlay?.heat ?? "none"),
                          )}
                          style={{ width: `${Math.max(overlay?.sharePercent ?? 0, 4)}%` }}
                        />
                      </div>
                    </div>
                  </th>
                  );
                })}
                <th className="min-w-[72px] px-2 py-2 text-right text-xs font-semibold text-muted-foreground">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody>
              {model.staffRows.map((staff: StaffRow) => (
                <tr key={staff.id} className="border-b" data-testid="schedule-grid-staff-row">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r bg-background px-3 py-2 text-left font-medium"
                  >
                    <span className="block">{staff.name}</span>
                    <span className="text-[10px] font-normal tabular-nums text-muted-foreground">
                      ${staff.weeklyLaborCost.toFixed(0)} labor
                    </span>
                  </th>
                  {model.days.map((day, idx) => {
                    const cellLabor = (shiftsByCell.get(scheduleGridCellId(staff.id, day)) ?? []).reduce(
                      (sum, shift) => sum + shift.laborCost,
                      0,
                    );
                    const cellOverlay = buildScheduleGridCellLaborOverlay(cellLabor, maxCellLabor);
                    return (
                    <GridCell
                      key={scheduleGridCellId(staff.id, day)}
                      staffMemberId={staff.id}
                      shiftDate={day}
                      dayLabel={SCHEDULE_GRID_DAY_LABELS[idx]}
                      laborTotal={cellLabor}
                      laborHeat={cellOverlay.heat}
                    >
                      {(shiftsByCell.get(scheduleGridCellId(staff.id, day)) ?? []).map((shift) => (
                        <DraggableShiftCard
                          key={shift.id}
                          shift={shift}
                          canManage={canManage}
                          hasConflict={conflictShiftIds.has(shift.id)}
                        />
                      ))}
                    </GridCell>
                    );
                  })}
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                    {staff.weeklyHours.toFixed(1)}h
                  </td>
                </tr>
              ))}
              <tr
                className="bg-muted/20 text-xs font-medium"
                data-testid={SCHEDULE_GRID_LABOR_OVERLAY_TEST_ID}
              >
                <td className="sticky left-0 border-r bg-muted/20 px-3 py-2">Daily labor</td>
                {model.days.map((day, idx) => {
                  const overlay = dayLaborOverlays[idx];
                  return (
                  <td key={day} className="px-2 py-2 tabular-nums">
                    <span className="block">${model.dailyLaborTotals[day]?.toFixed(0) ?? "0"}</span>
                    <span className="text-[10px] text-muted-foreground">{overlay?.sharePercent ?? 0}%</span>
                  </td>
                  );
                })}
                <td className="px-2 py-2 text-right tabular-nums">${model.weekLaborTotal.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DndContext>

      </div>

      <p className="text-xs text-muted-foreground">
        Drag shifts between team members and days. Overlapping shifts on the same day are blocked;
        weekly overtime warnings appear in the labor cards above.
      </p>
    </div>
  );
}
