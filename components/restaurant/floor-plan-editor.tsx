"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createRestaurantTable,
  deleteRestaurantTable,
  updateTablePosition,
  updateTableShapeAction,
  updateTableStatusAction,
} from "@/actions/restaurant/tables";
import type { TableData } from "@/components/restaurant/floor-plan";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import { useFloorPlanRealtime } from "@/hooks/use-floor-plan-realtime";
import { useSyncedServerState } from "@/hooks/use-synced-server-state";
import {
  listFloorPlanSections,
  resolveTableShapeClass,
  tableMatchesSectionFilter,
  VISUAL_FLOOR_PLAN_EDITOR_ROUTE,
  VISUAL_FLOOR_PLAN_TABLE_SHAPES,
  type VisualFloorPlanTableShape,
} from "@/lib/restaurant/visual-floor-plan-editor-absolute-final-policy";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 border-emerald-400 text-emerald-800",
  OCCUPIED: "bg-rose-100 border-rose-400 text-rose-800",
  RESERVED: "bg-amber-100 border-amber-400 text-amber-800",
  DIRTY: "bg-orange-100 border-orange-400 text-orange-800",
  CLEANING: "bg-blue-100 border-blue-400 text-blue-800",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Free",
  OCCUPIED: "Seated",
  RESERVED: "Reserved",
  DIRTY: "Dirty",
  CLEANING: "Cleaning",
};

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 640;
const GRID = 20;

function snap(value: number): number {
  return Math.round(value / GRID) * GRID;
}

function defaultPosition(index: number): { x: number; y: number } {
  const col = index % 6;
  const row = Math.floor(index / 6);
  return { x: snap(col * 130 + 24), y: snap(row * 130 + 24) };
}

function displayPosition(table: TableData, index: number): { x: number; y: number } {
  if (table.positionX === 0 && table.positionY === 0 && index > 0) {
    return defaultPosition(index);
  }
  return { x: table.positionX, y: table.positionY };
}

export function FloorPlanEditor({
  tables: initialTables,
  userId,
  workspaceId,
}: {
  tables: TableData[];
  userId: string;
  workspaceId: string | null;
}) {
  const [tables, setTables] = useSyncedServerState(initialTables);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const refreshFromServer = useCallback(() => {
    router.refresh();
  }, [router]);

  const { connectionLabel, isLive, reconnectAttempt } = useFloorPlanRealtime({
    userId,
    workspaceId,
    onRefresh: refreshFromServer,
  });

  const persistPosition = useCallback(
    (tableId: string, positionX: number, positionY: number) => {
      startTransition(async () => {
        const fd = new FormData();
        fd.append("tableId", tableId);
        fd.append("positionX", String(positionX));
        fd.append("positionY", String(positionY));
        const result = await updateTablePosition(fd);
        const err = getActionError(result);
        if (err) {
          toast.error(err);
          router.refresh();
        }
      });
    },
    [router],
  );

  function handlePointerDown(tableId: string, index: number, e: React.PointerEvent) {
    if (pending) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const pos = displayPosition(table, index);
    dragOffset.current = {
      x: e.clientX - rect.left - pos.x,
      y: e.clientY - rect.top - pos.y,
    };
    setDraggingId(tableId);
    setSelectedId(tableId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(tableId: string, e: React.PointerEvent) {
    if (draggingId !== tableId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const rawX = e.clientX - rect.left - dragOffset.current.x;
    const rawY = e.clientY - rect.top - dragOffset.current.y;
    const maxX = CANVAS_WIDTH - table.width;
    const maxY = CANVAS_HEIGHT - table.height;
    const positionX = snap(Math.max(0, Math.min(maxX, rawX)));
    const positionY = snap(Math.max(0, Math.min(maxY, rawY)));

    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, positionX, positionY } : t)),
    );
  }

  function handlePointerUp(tableId: string) {
    if (draggingId !== tableId) return;
    setDraggingId(null);
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    persistPosition(tableId, table.positionX, table.positionY);
  }

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await createRestaurantTable(formData);
      const err = getActionError(result);
      if (err) {
        toast.error(err);
        return;
      }
      if (isActionSuccess<{ table: TableData }>(result) && result.data?.table) {
        const table = result.data.table;
        const pos = defaultPosition(tables.length);
        const fd = new FormData();
        fd.append("tableId", table.id);
        fd.append("positionX", String(pos.x));
        fd.append("positionY", String(pos.y));
        await updateTablePosition(fd);
        setTables((prev) => [...prev, { ...table, positionX: pos.x, positionY: pos.y }]);
      }
      toast.success("Table added to floor plan");
      setShowAddForm(false);
      router.refresh();
    });
  }

  function handleStatusChange(tableId: string, status: string) {
    const previous = tables.find((t) => t.id === tableId)?.status;
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));

    startTransition(async () => {
      const fd = new FormData();
      fd.append("tableId", tableId);
      fd.append("status", status);
      const result = await updateTableStatusAction(fd);
      const err = getActionError(result);
      if (err) {
        if (previous) {
          setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status: previous } : t)));
        }
        toast.error(err);
        router.refresh();
        return;
      }
      toast.success(`Table marked ${STATUS_LABELS[status] ?? status}`);
      router.refresh();
    });
  }

  function handleDelete(tableId: string) {
    if (!confirm("Delete this table from the floor plan?")) return;
    const snapshot = tables;
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    setSelectedId(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append("tableId", tableId);
      const result = await deleteRestaurantTable(fd);
      const err = getActionError(result);
      if (err) {
        setTables(snapshot);
        toast.error(err);
        router.refresh();
        return;
      }
      toast.success("Table removed");
      router.refresh();
    });
  }

  function handleShapeChange(tableId: string, shape: VisualFloorPlanTableShape) {
    const previous = tables.find((t) => t.id === tableId)?.shape;
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, shape } : t)));

    startTransition(async () => {
      const fd = new FormData();
      fd.append("tableId", tableId);
      fd.append("shape", shape);
      const result = await updateTableShapeAction(fd);
      const err = getActionError(result);
      if (err) {
        if (previous) {
          setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, shape: previous } : t)));
        }
        toast.error(err);
        router.refresh();
        return;
      }
      toast.success(`Table shape set to ${shape.toLowerCase()}`);
      router.refresh();
    });
  }

  const selected = tables.find((t) => t.id === selectedId);
  const sectionZones = listFloorPlanSections(tables);
  const visibleTables = tables.filter((table) => tableMatchesSectionFilter(table.section, sectionFilter));

  return (
    <div className="space-y-6" data-testid="visual-floor-plan-editor">
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Oracle MICROS parity — BETA visual editor.</strong> Drag-and-drop
        canvas with section zones and table shapes. Supabase Realtime when configured; polling fallback
        otherwise. Not certified live occupancy sync for all venues.
      </div>
      <p
        className={cn(
          "rounded-lg border px-3 py-2 text-sm",
          isLive
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
            : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
        )}
        role="status"
        data-testid="floor-plan-connection-status"
      >
        {connectionLabel}
        {reconnectAttempt > 0 ? ` · reconnect ${reconnectAttempt}/5` : null}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Layout canvas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag tables · filter section zones · set shapes · link orders to Order Hub
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add table
        </button>
      </div>

      {showAddForm ? (
        <form action={handleAdd} className="space-y-3 rounded-xl border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              name="name"
              placeholder="Table name (e.g. T12)"
              required
              disabled={pending}
              className="h-10 rounded-xl border px-3 text-sm"
            />
            <input
              name="section"
              placeholder="Section (e.g. Patio)"
              disabled={pending}
              className="h-10 rounded-xl border px-3 text-sm"
            />
            <input
              name="capacity"
              type="number"
              defaultValue={4}
              min={1}
              max={20}
              disabled={pending}
              className="h-10 rounded-xl border px-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Shape:</span>
            {VISUAL_FLOOR_PLAN_TABLE_SHAPES.map((shape) => (
              <label key={shape} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1">
                <input type="radio" name="shape" value={shape} defaultChecked={shape === "RECTANGLE"} />
                {shape.toLowerCase()}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs">
            <span className={cn("h-3 w-3 rounded-full border", STATUS_COLORS[status].split(" ")[1])} />
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" data-testid="floor-plan-section-zones">
        <button
          type="button"
          onClick={() => setSectionFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs",
            sectionFilter === null && "border-primary bg-primary/10 text-primary",
          )}
        >
          All sections
        </button>
        {sectionZones.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setSectionFilter(section)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              sectionFilter === section && "border-primary bg-primary/10 text-primary",
            )}
            data-testid={`floor-plan-section-${section.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {section}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div
          ref={canvasRef}
          data-testid="floor-plan-canvas"
          className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/20"
          style={{ width: "100%", maxWidth: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: `${GRID}px ${GRID}px`,
            }}
          />
          {visibleTables.map((table) => {
            const index = tables.findIndex((t) => t.id === table.id);
            const pos = displayPosition(table, index >= 0 ? index : 0);
            const isSelected = selectedId === table.id;
            return (
              <div
                key={table.id}
                role="button"
                tabIndex={0}
                data-testid={`floor-plan-table-${table.id}`}
                onPointerDown={(e) => handlePointerDown(table.id, index >= 0 ? index : 0, e)}
                onPointerMove={(e) => handlePointerMove(table.id, e)}
                onPointerUp={() => handlePointerUp(table.id)}
                onPointerCancel={() => handlePointerUp(table.id)}
                className={cn(
                  "absolute touch-none select-none border-2 shadow-sm transition-shadow",
                  resolveTableShapeClass(table.shape),
                  STATUS_COLORS[table.status],
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  draggingId === table.id && "cursor-grabbing shadow-lg",
                  draggingId !== table.id && "cursor-grab",
                )}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: table.width,
                  height: table.height,
                }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-0.5 px-1 text-center">
                  <GripVertical className="h-3 w-3 opacity-40" aria-hidden />
                  <span className="text-sm font-bold">{table.name}</span>
                  <span className="text-[10px]">{table.capacity}p</span>
                  {table.section ? (
                    <span className="truncate text-[9px] opacity-70">{table.section}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
          {visibleTables.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              {tables.length === 0
                ? "Add a table to start laying out your dining room."
                : "No tables in this section — pick another zone or clear the filter."}
            </p>
          ) : null}
        </div>

        <aside className="rounded-xl border border-border/80 bg-card p-4 text-sm">
          <h2 className="font-semibold">Table details</h2>
          {!selected ? (
            <p className="mt-2 text-muted-foreground">Select a table on the canvas.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <p>
                <span className="text-muted-foreground">Name:</span> {selected.name}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                {STATUS_LABELS[selected.status] ?? selected.status}
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <button
                    key={status}
                    type="button"
                    disabled={pending}
                    onClick={() => handleStatusChange(selected.id, status)}
                    className={cn(
                      "rounded-lg border px-2 py-1 text-xs",
                      selected.status === status && "font-semibold ring-1 ring-primary",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Table shape</p>
                <div className="flex flex-wrap gap-1">
                  {VISUAL_FLOOR_PLAN_TABLE_SHAPES.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      disabled={pending}
                      onClick={() => handleShapeChange(selected.id, shape)}
                      className={cn(
                        "rounded-lg border px-2 py-1 text-xs capitalize",
                        selected.shape === shape && "font-semibold ring-1 ring-primary",
                      )}
                    >
                      {shape.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              {selected.currentOrderId ? (
                <Link
                  href={`/dashboard/orders/${selected.currentOrderId}`}
                  className="inline-flex text-xs font-medium text-primary hover:underline"
                  data-testid="floor-plan-order-link"
                >
                  Open order {selected.currentOrderCustomer ?? selected.currentOrderId.slice(0, 8)}
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground">No active order linked.</p>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDelete(selected.id)}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Delete table
              </button>
            </div>
          )}
        </aside>
      </div>
      <p className="sr-only">
        /dashboard/floor-plans · visual-floor-plan-editor-absolute-final-v1
      </p>
    </div>
  );
}
