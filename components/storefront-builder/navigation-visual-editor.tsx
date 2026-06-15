"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { updateStorefrontNavigationSettingsFormAction } from "@/actions/storefront-navigation";
import type { NavItem, NavItemTarget } from "@/lib/storefront-builder/navigation-types";
import { NAV_ICON_OPTIONS } from "@/lib/storefront-builder/nav-icons";
import {
  NAV_TARGET_OPTIONS,
  appendPublishedPagesToNav,
  defaultNavChildItem,
  defaultNavItem,
  parseNavigationItems,
  serializeNavigationItems,
} from "@/lib/storefront-builder/nav-footer-parse";
import { NavChildrenSortable } from "@/components/storefront-builder/nav-children-sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SortableNavRow({
  item,
  index,
  customPages,
  secondaryLocales,
  onChange,
  onRemove,
}: {
  item: NavItem;
  index: number;
  customPages: { slug: string; title: string }[];
  secondaryLocales: string[];
  onChange: (next: NavItem) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const kind = item.target.kind;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border/80 bg-card p-3 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-2 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Label ({index + 1})</Label>
            <Input
              value={item.label}
              onChange={(e) => onChange({ ...item, label: e.target.value })}
              className="rounded-xl"
            />
          </div>
          {secondaryLocales.map((loc) => (
            <div key={loc} className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label ({loc})</Label>
              <Input
                value={item.labels?.[loc] ?? ""}
                onChange={(e) =>
                  onChange({
                    ...item,
                    labels: { ...item.labels, [loc]: e.target.value },
                  })
                }
                className="rounded-xl"
                placeholder={`Translation (${loc})`}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label>Icon</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={item.icon ?? ""}
              onChange={(e) => onChange({ ...item, icon: e.target.value || undefined })}
            >
              {NAV_ICON_OPTIONS.map((o) => (
                <option key={o.value || "none"} value={o.value}>
                  {o.label} {o.glyph}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Link type</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={kind}
              onChange={(e) => {
                const k = e.target.value as NavItemTarget["kind"];
                let target: NavItemTarget;
                switch (k) {
                  case "page":
                    target = { kind: "page", slug: customPages[0]?.slug ?? "about-us" };
                    break;
                  case "external":
                    target = { kind: "external", href: "https://", newTab: true };
                    break;
                  default:
                    target = { kind: k };
                }
                onChange({ ...item, target });
              }}
            >
              {NAV_TARGET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {kind === "page" ? (
            <div className="space-y-2">
              <Label>Page slug</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={item.target.kind === "page" ? item.target.slug : ""}
                onChange={(e) => onChange({ ...item, target: { kind: "page", slug: e.target.value } })}
              >
                {customPages.length === 0 ? (
                  <option value="">No custom pages</option>
                ) : (
                  customPages.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title} ({p.slug})
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : null}
          {kind === "external" ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>External URL</Label>
              <Input
                className="rounded-xl font-mono text-sm"
                value={item.target.kind === "external" ? item.target.href : ""}
                onChange={(e) =>
                  onChange({
                    ...item,
                    target: { kind: "external", href: e.target.value, newTab: true },
                  })
                }
                placeholder="https://"
              />
            </div>
          ) : null}
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Dropdown children</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-full text-xs"
                onClick={() =>
                  onChange({
                    ...item,
                    children: [
                      ...(item.children ?? []),
                      defaultNavChildItem(customPages[0]?.slug ?? "about", customPages[0]?.title ?? "Page"),
                    ],
                  })
                }
              >
                Add child
              </Button>
            </div>
            <NavChildrenSortable
              items={item.children ?? []}
              customPages={customPages}
              onChange={(navChildren) => onChange({ ...item, children: navChildren })}
            />
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function NavigationVisualEditor({
  initialRaw,
  customPages,
  secondaryLocales,
}: {
  initialRaw: unknown;
  customPages: { slug: string; title: string }[];
  secondaryLocales: string[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<NavItem[]>(() => parseNavigationItems(initialRaw));
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setItems(arrayMove(items, oldIndex, newIndex));
  }

  async function save() {
    setError(null);
    setPending(true);
    const fd = new FormData();
    fd.set("itemsJson", JSON.stringify(serializeNavigationItems(items)));
    await updateStorefrontNavigationSettingsFormAction(fd);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Drag to reorder. Save navigation, then publish your theme snapshot on the Theme tab.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <SortableNavRow
                key={item.id}
                item={item}
                index={index}
                customPages={customPages}
                secondaryLocales={secondaryLocales}
                onChange={(next) => setItems((prev) => prev.map((x) => (x.id === item.id ? next : x)))}
                onRemove={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setItems((p) => [...p, defaultNavItem()])}>
          <Plus className="mr-1 h-4 w-4" />
          Add link
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setItems((p) => appendPublishedPagesToNav(p, customPages))}
          disabled={customPages.length === 0}
        >
          Add all published pages
        </Button>
        <Button type="button" className="rounded-full" disabled={pending} onClick={() => void save()}>
          {pending ? "Saving…" : "Save navigation"}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
