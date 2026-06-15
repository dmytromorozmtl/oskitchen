"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MarketplaceProductMediaItem } from "@/services/marketplace/marketplace-product-detail-service";
import { cn } from "@/lib/utils";

export function MarketplaceProductGallery({
  name,
  media,
}: {
  name: string;
  media: MarketplaceProductMediaItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const items =
    media.length > 0
      ? media
      : [{ url: "", alt: name }];

  const active = items[Math.min(activeIndex, items.length - 1)]!;

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-muted"
          onClick={() => active.url && setZoomOpen(true)}
          aria-label="Zoom product image"
        >
          {active.url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.alt || name}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs shadow-sm">
                <ZoomIn className="h-3.5 w-3.5" />
                Zoom
              </span>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              No product image uploaded
            </div>
          )}
        </button>

        {items.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border",
                  index === activeIndex ? "border-primary" : "border-border/80",
                )}
              >
                {item.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.url} alt={item.alt || name} className="h-full w-full object-cover" />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          {active.url ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.url} alt={active.alt || name} className="h-full w-full object-contain" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
