"use client";

import * as React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export type MediaPickerAsset = {
  id: string;
  url: string;
  label: string | null;
  altText: string | null;
};

type Props = {
  assets: MediaPickerAsset[];
  /** When set, renders a button that opens the picker. */
  triggerLabel?: string;
  /** Controlled mode: external open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (url: string) => void;
};

export function MediaPickerDialog({ assets, triggerLabel, open: controlledOpen, onOpenChange, onSelect }: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  function pick(url: string) {
    onSelect(url);
    setOpen(false);
  }

  return (
    <>
      {triggerLabel ? (
        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          {triggerLabel}
        </Button>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="border-b border-border/80 px-4 py-3">
              <p className="text-sm font-medium">Pick from media library</p>
              <p className="text-xs text-muted-foreground">HTTPS URLs from your configured storage.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {assets.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No assets yet — upload on the Media tab first.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {assets.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className="flex gap-3 rounded-xl border border-border/80 p-2 text-left hover:bg-muted/50"
                      onClick={() => pick(a.url)}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={a.url} alt={a.altText ?? a.label ?? ""} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.label ?? "Untitled"}</p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">{a.url}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border/80 px-4 py-3">
              <Button type="button" variant="secondary" className="rounded-full" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function MediaPickerDialogTrigger({
  assets,
  onSelect,
}: {
  assets: MediaPickerAsset[];
  onSelect?: (url: string) => void;
}) {
  const [url, setUrl] = React.useState<string | null>(null);
  return (
    <>
      <MediaPickerDialog
        assets={assets}
        triggerLabel="Pick media"
        onSelect={(u) => {
          setUrl(u);
          onSelect?.(u);
        }}
      />
      {url ? <p className="mt-1 font-mono text-[10px] text-muted-foreground">Selected: {url}</p> : null}
    </>
  );
}
