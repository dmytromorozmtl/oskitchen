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

import { updateStorefrontFooterSettingsFormAction } from "@/actions/storefront-navigation";
import {
  type FooterBlock,
  defaultFooterLinksBlock,
  parseFooterBlocks,
  serializeFooterBlocks,
} from "@/lib/storefront-builder/nav-footer-parse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SortableFooterBlock({
  block,
  onChange,
  onRemove,
}: {
  block: FooterBlock;
  onChange: (b: FooterBlock) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground"
          {...attributes}
          {...listeners}
          aria-label="Drag block"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <select
          className="rounded-lg border border-input bg-background px-2 py-1 text-sm"
          value={block.type}
          onChange={(e) => {
            const t = e.target.value;
            if (t === "text") onChange({ id: block.id, type: "text", body: "" });
            else onChange(defaultFooterLinksBlock());
          }}
        >
          <option value="links">Link column</option>
          <option value="text">Text block</option>
        </select>
        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {block.type === "text" ? (
        <Textarea
          rows={3}
          value={block.body}
          onChange={(e) => onChange({ ...block, body: e.target.value })}
          className="rounded-xl text-sm"
          placeholder="Footer blurb…"
        />
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Column title</Label>
            <Input value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} className="rounded-xl" />
          </div>
          {block.links.map((link, li) => (
            <div key={link.id} className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(e) => {
                  const links = [...block.links];
                  links[li] = { ...link, label: e.target.value };
                  onChange({ ...block, links });
                }}
                className="rounded-xl"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="/menu or https://"
                  value={link.href}
                  onChange={(e) => {
                    const links = [...block.links];
                    links[li] = { ...link, href: e.target.value };
                    onChange({ ...block, links });
                  }}
                  className="rounded-xl font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange({ ...block, links: block.links.filter((_, i) => i !== li) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() =>
              onChange({
                ...block,
                links: [...block.links, { id: `link-${Date.now()}`, label: "Link", href: "/menu" }],
              })
            }
          >
            Add link
          </Button>
        </div>
      )}
    </div>
  );
}

export function FooterVisualEditor({ initialRaw }: { initialRaw: unknown }) {
  const router = useRouter();
  const [blocks, setBlocks] = React.useState<FooterBlock[]>(() => parseFooterBlocks(initialRaw));
  const [pending, setPending] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  async function save() {
    setPending(true);
    const fd = new FormData();
    fd.set("blocksJson", JSON.stringify(serializeFooterBlocks(blocks)));
    await updateStorefrontFooterSettingsFormAction(fd);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <SortableFooterBlock
                key={block.id}
                block={block}
                onChange={(next) => setBlocks((prev) => prev.map((b) => (b.id === block.id ? next : b)))}
                onRemove={() => setBlocks((prev) => prev.filter((b) => b.id !== block.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setBlocks((p) => [...p, defaultFooterLinksBlock()])}>
          <Plus className="mr-1 h-4 w-4" />
          Add block
        </Button>
        <Button type="button" className="rounded-full" disabled={pending} onClick={() => void save()}>
          {pending ? "Saving…" : "Save footer"}
        </Button>
      </div>
    </div>
  );
}
