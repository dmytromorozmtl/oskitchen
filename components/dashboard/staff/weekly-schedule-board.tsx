"use client";

import { useTransition } from "react";
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

import { deleteShiftAction, updateShiftAction } from "@/actions/labor/schedule";

type ShiftRow = {
  id: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  roleLabel: string | null;
  status: string;
  laborCost: number;
  staffName: string;
  locationName: string | null;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function DropDay({ day, label, children }: { day: string; label: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: day });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] rounded-lg border p-2 ${isOver ? "border-primary bg-primary/5" : "bg-muted/20"}`}
    >
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ShiftCard({ shift, canManage }: { shift: ShiftRow; canManage: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    disabled: !canManage,
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border bg-background p-2 text-xs shadow-sm ${isDragging ? "opacity-50" : ""}`}
    >
      {canManage ? (
        <button type="button" className="w-full cursor-grab text-left active:cursor-grabbing" {...listeners} {...attributes}>
          <p className="font-medium">{shift.staffName}</p>
          <p className="text-muted-foreground">
            {shift.startTime}–{shift.endTime}
            {shift.roleLabel ? ` · ${shift.roleLabel}` : ""}
          </p>
          <p className="text-muted-foreground">${shift.laborCost.toFixed(0)}</p>
        </button>
      ) : (
        <div className="text-left">
          <p className="font-medium">{shift.staffName}</p>
          <p className="text-muted-foreground">
            {shift.startTime}–{shift.endTime}
            {shift.roleLabel ? ` · ${shift.roleLabel}` : ""}
          </p>
          <p className="text-muted-foreground">${shift.laborCost.toFixed(0)}</p>
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

export function WeeklyScheduleBoard({
  weekStartIso,
  shifts,
  canManage = true,
}: {
  weekStartIso: string;
  shifts: ShiftRow[];
  canManage?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const weekStart = new Date(weekStartIso);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const byDay = new Map<string, ShiftRow[]>();
  for (const day of days) byDay.set(day, []);
  for (const s of shifts) {
    const list = byDay.get(s.shiftDate) ?? [];
    list.push(s);
    byDay.set(s.shiftDate, list);
  }

  function onDragEnd(event: DragEndEvent) {
    if (!canManage) return;
    const { active, over } = event;
    if (!over) return;
    const shiftId = String(active.id);
    const targetDay = String(over.id);
    if (!days.includes(targetDay)) return;
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift || shift.shiftDate === targetDay) return;

    const fd = new FormData();
    fd.set("shiftId", shiftId);
    fd.set("shiftDate", targetDay);
    fd.set("startTime", shift.startTime);
    fd.set("endTime", shift.endTime);
    startTransition(() => updateShiftAction(fd));
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className={`grid gap-2 md:grid-cols-7 ${isPending ? "opacity-70" : ""}`}>
        {days.map((day, idx) => (
          <DropDay key={day} day={day} label={`${DAY_LABELS[idx]} · ${day.slice(5)}`}>
            {(byDay.get(day) ?? []).map((s) => (
              <ShiftCard key={s.id} shift={s} canManage={canManage} />
            ))}
          </DropDay>
        ))}
      </div>
    </DndContext>
  );
}
