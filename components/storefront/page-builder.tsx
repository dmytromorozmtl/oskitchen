"use client";

import * as React from "react";
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
import { GripVertical, Redo2, Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { builderSectionLabel } from "@/lib/storefront/builder-section-type-map";
import { Button } from "@/components/ui/button";

const SECTION_TYPES = [
  { type: "HERO", label: "Hero", icon: "🏠" },
  { type: "PRODUCT_GRID", label: "Product grid", icon: "🛍️" },
  { type: "HOW_IT_WORKS", label: "How it works", icon: "📋" },
  { type: "TESTIMONIALS", label: "Testimonials", icon: "💬" },
  { type: "CONTACT", label: "Contact", icon: "📧" },
  { type: "CATERING", label: "Catering", icon: "🍽️" },
  { type: "FAQ", label: "FAQ", icon: "❓" },
  { type: "REVIEWS", label: "Reviews", icon: "⭐" },
  { type: "GALLERY", label: "Gallery", icon: "🖼️" },
  { type: "SLIDER", label: "Slider", icon: "🎠" },
] as const;

export type PageBuilderSection = {
  id: string;
  type: string;
  sortOrder: number;
  visible: boolean;
};

function SortableRow({
  section,
  onRemove,
}: {
  section: PageBuilderSection;
  onRemove: (id: string) => void;
}) {
  const meta = SECTION_TYPES.find((s) => s.type === section.type || builderSectionLabel(section.type) === s.label);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-lg">{meta?.icon ?? "📄"}</span>
        <div>
          <p className="text-sm font-medium">{meta?.label ?? builderSectionLabel(section.type)}</p>
          <p className="text-xs text-muted-foreground">{section.type}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(section.id)}
        className="rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
      >
        <Trash2 className="mr-1 inline h-3.5 w-3.5" />
        Remove
      </button>
    </div>
  );
}

export function PageBuilder({
  pageId,
  storefrontId,
  storeSlug,
  sections: initial,
  layoutPublishedAt,
  initialDirty,
}: {
  pageId: string;
  storefrontId: string;
  storeSlug: string;
  sections: PageBuilderSection[];
  layoutPublishedAt: string | null;
  initialDirty: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [history, setHistory] = React.useState<PageBuilderSection[][]>([initial]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [isDirty, setIsDirty] = React.useState(initialDirty);
  const [lastPublished, setLastPublished] = React.useState<string | null>(
    layoutPublishedAt ? new Date(layoutPublishedAt).toLocaleString() : null,
  );
  const [publishing, setPublishing] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function pushHistory(next: PageBuilderSection[], markDirty = true) {
    const trimmed = history.slice(0, historyIndex + 1);
    trimmed.push(next);
    setHistory(trimmed);
    setHistoryIndex(trimmed.length - 1);
    setItems(next);
    if (markDirty) setIsDirty(true);
  }

  function undo() {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setItems(history[nextIndex] ?? []);
    setIsDirty(true);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setItems(history[nextIndex] ?? []);
    setIsDirty(true);
  }

  async function persistOrder(next: PageBuilderSection[]) {
    const res = await fetch("/api/storefront/builder/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, order: next.map((s) => s.id) }),
    });
    if (!res.ok) toast.error("Could not save order");
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    pushHistory(reordered);
    void persistOrder(reordered);
  }

  async function addSection(type: string) {
    const res = await fetch("/api/storefront/builder/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, type }),
    });
    const data = (await res.json()) as PageBuilderSection & { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Could not add section");
      return;
    }
    pushHistory([...items, data]);
    toast.success("Section added (draft)");
  }

  async function removeSection(id: string) {
    const res = await fetch("/api/storefront/builder/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: id }),
    });
    if (!res.ok) {
      toast.error("Could not remove section");
      return;
    }
    pushHistory(items.filter((i) => i.id !== id));
    toast.success("Section removed (draft)");
  }

  async function onPublish() {
    setPublishing(true);
    try {
      const res = await fetch("/api/storefront/builder/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storefrontId }),
      });
      const data = (await res.json()) as { error?: string; publishedAt?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not publish");
        return;
      }
      setIsDirty(false);
      const label = data.publishedAt ? new Date(data.publishedAt).toLocaleString() : new Date().toLocaleString();
      setLastPublished(label);
      toast.success("Home layout published — guests can see it now");
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Add section</p>
        {SECTION_TYPES.map((s) => (
          <button
            key={s.type}
            type="button"
            onClick={() => void addSection(s.type)}
            className="flex w-full items-center gap-2 rounded-xl border border-border/80 px-3 py-2 text-sm transition hover:bg-muted"
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
        <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-full">
          <a href={`/s/${storeSlug}?preview=1`} target="_blank" rel="noopener noreferrer">
            Preview draft storefront
          </a>
        </Button>
      </div>

      <div className="lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="inline-flex items-center gap-1 rounded-lg border border-border/80 px-3 py-1.5 text-xs font-medium disabled:opacity-30"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="inline-flex items-center gap-1 rounded-lg border border-border/80 px-3 py-1.5 text-xs font-medium disabled:opacity-30"
          >
            <Redo2 className="h-3.5 w-3.5" />
            Redo
          </button>
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Home page layout — drag to reorder (draft)
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((section) => (
                <SortableRow key={section.id} section={section} onRemove={(id) => void removeSection(id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No sections yet — add a Hero block to get started.</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/80 pt-4">
          <Button
            type="button"
            onClick={() => void onPublish()}
            disabled={!isDirty || publishing}
            className="rounded-full"
          >
            {publishing ? "Publishing…" : isDirty ? "Publish home layout" : "Published"}
          </Button>
          {lastPublished && !isDirty ? (
            <p className="text-xs text-muted-foreground">Last published: {lastPublished}</p>
          ) : null}
          {isDirty ? (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">You have unpublished layout changes</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
