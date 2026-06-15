"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import type { NavItem } from "@/lib/storefront-builder/navigation-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SortableChildRow({
  child,
  customPages,
  onChange,
  onRemove,
}: {
  child: NavItem;
  customPages: { slug: string; title: string }[];
  onChange: (next: NavItem) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: child.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="grid gap-2 rounded-lg border border-dashed border-border/70 p-2 sm:grid-cols-[auto_1fr_auto]">
      <button
        type="button"
        className="mt-2 cursor-grab self-start text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag child link"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input value={child.label} onChange={(e) => onChange({ ...child, label: e.target.value })} className="rounded-xl text-sm" />
      <div className="flex gap-2">
        <select
          className="flex h-10 flex-1 rounded-xl border border-input bg-background px-2 text-sm"
          value={child.target.kind === "page" ? child.target.slug : child.target.kind}
          onChange={(e) => {
            const v = e.target.value;
            onChange(
              v === "menu" || v === "contact"
                ? { ...child, target: { kind: v } }
                : { ...child, target: { kind: "page", slug: v } },
            );
          }}
        >
          <option value="menu">Menu</option>
          <option value="contact">Contact</option>
          {customPages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function NavChildrenSortable({
  items,
  customPages,
  onChange,
}: {
  items: NavItem[];
  customPages: { slug: string; title: string }[];
  onChange: (next: NavItem[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  }

  if (items.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((child) => (
            <SortableChildRow
              key={child.id}
              child={child}
              customPages={customPages}
              onChange={(next) => onChange(items.map((c) => (c.id === child.id ? next : c)))}
              onRemove={() => onChange(items.filter((c) => c.id !== child.id))}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
