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
import { GripVertical, Plus, Trash2 } from "lucide-react";

import type { MediaPickerAsset } from "@/components/storefront/media/media-picker-dialog";
import { MediaUrlField } from "@/components/storefront/media/media-url-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SliderSlideDraft = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  altText: string;
  ctaLabel: string;
  ctaHref: string;
};

function emptySlide(): SliderSlideDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    imageUrl: "",
    altText: "",
    ctaLabel: "",
    ctaHref: "",
  };
}

function SortableSlideRow({
  slide,
  index,
  onChange,
  onRemove,
  canRemove,
  mediaAssets,
}: {
  slide: SliderSlideDraft;
  index: number;
  onChange: (next: SliderSlideDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
  mediaAssets: MediaPickerAsset[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          aria-label={`Drag slide ${index + 1}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-muted-foreground">Slide {index + 1}</span>
        <Button type="button" variant="ghost" size="icon" disabled={!canRemove} onClick={onRemove} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`slide_title_${slide.id}`}>Title</Label>
          <Input
            id={`slide_title_${slide.id}`}
            name={`slide_title_${index}`}
            value={slide.title}
            onChange={(e) => onChange({ ...slide, title: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`slide_subtitle_${slide.id}`}>Subtitle</Label>
          <Input
            id={`slide_subtitle_${slide.id}`}
            name={`slide_subtitle_${index}`}
            value={slide.subtitle}
            onChange={(e) => onChange({ ...slide, subtitle: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <MediaUrlField
          id={`slide_imageUrl_${slide.id}`}
          name={`slide_imageUrl_${index}`}
          label="Image"
          defaultValue={slide.imageUrl}
          assets={mediaAssets}
        />
        <div className="space-y-1">
          <Label htmlFor={`slide_altText_${slide.id}`}>Alt text</Label>
          <Input
            id={`slide_altText_${slide.id}`}
            name={`slide_altText_${index}`}
            value={slide.altText}
            onChange={(e) => onChange({ ...slide, altText: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`slide_ctaLabel_${slide.id}`}>Button label</Label>
          <Input
            id={`slide_ctaLabel_${slide.id}`}
            name={`slide_ctaLabel_${index}`}
            value={slide.ctaLabel}
            onChange={(e) => onChange({ ...slide, ctaLabel: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`slide_ctaHref_${slide.id}`}>Button link</Label>
          <Input
            id={`slide_ctaHref_${slide.id}`}
            name={`slide_ctaHref_${index}`}
            value={slide.ctaHref}
            onChange={(e) => onChange({ ...slide, ctaHref: e.target.value })}
            className="rounded-xl font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}

/** Client-only multi-slide editor; indices map to server `slide_*_{index}` fields. */
export function SliderSectionEditor({
  initialSlides,
  mediaAssets = [],
}: {
  initialSlides: SliderSlideDraft[];
  mediaAssets?: MediaPickerAsset[];
}) {
  const [slides, setSlides] = React.useState<SliderSlideDraft[]>(
    initialSlides.length > 0 ? initialSlides : [emptySlide()],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setSlides(arrayMove(slides, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="slideCount" value={String(slides.length)} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <SortableSlideRow
                key={slide.id}
                slide={slide}
                index={index}
                canRemove={slides.length > 1}
                onChange={(next) => setSlides((prev) => prev.map((s, i) => (i === index ? next : s)))}
                onRemove={() => setSlides((prev) => prev.filter((_, i) => i !== index))}
                mediaAssets={mediaAssets}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSlides((p) => [...p, emptySlide()])}>
        <Plus className="mr-1 h-4 w-4" />
        Add slide
      </Button>
    </div>
  );
}
