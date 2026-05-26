"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PreviewLine = {
  title: string;
  quantity: number;
  status: string;
  message?: string;
};

type Props = {
  storeSlug: string;
  orderToken: string;
  variant?: "default" | "outline" | "secondary" | "premium";
  className?: string;
};

export function StorefrontReorderActions({ storeSlug, orderToken, variant = "premium", className }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<{
    lines: PreviewLine[];
    availableCount: number;
    subtotal: number;
  } | null>(null);

  async function loadPreview() {
    setLoadingPreview(true);
    try {
      const res = await fetch(
        `/api/storefront/account/reorder/preview?storeSlug=${encodeURIComponent(storeSlug)}&orderToken=${encodeURIComponent(orderToken)}`,
        { credentials: "same-origin" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not load order preview.");
        return;
      }
      setPreview({
        lines: data.lines ?? [],
        availableCount: data.availableCount ?? 0,
        subtotal: data.subtotal ?? 0,
      });
    } finally {
      setLoadingPreview(false);
    }
  }

  async function applyReorder(merge: boolean) {
    setPending(true);
    try {
      const res = await fetch("/api/storefront/account/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ storeSlug, orderToken, merge }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not reorder.");
        return;
      }

      if (data.warnings?.length) {
        for (const w of data.warnings as { message: string }[]) {
          toast.message(w.message);
        }
      }

      window.dispatchEvent(new Event("kos-store-cart"));
      setOpen(false);
      toast.success(merge ? "Items added to your cart." : "Cart replaced with your previous order.");
      router.push(data.redirectTo ?? `/s/${storeSlug}/cart`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && !preview) void loadPreview();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant={variant} className={className}>
          Order again
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order again</DialogTitle>
          <DialogDescription>
            Review what can be added today. Unavailable items are skipped automatically.
          </DialogDescription>
        </DialogHeader>
        {loadingPreview ? (
          <p className="text-sm text-muted-foreground">Loading preview…</p>
        ) : preview ? (
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {preview.lines.map((line, i) => (
              <li key={`${line.title}-${i}`} className="flex justify-between gap-2">
                <span>
                  {line.quantity}× {line.title}
                  {line.status !== "available" ? (
                    <span className="block text-xs text-destructive">{line.message ?? line.status}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {preview && preview.availableCount > 0 ? (
          <p className="text-sm font-medium">
            {preview.availableCount} item(s) available · subtotal from ${preview.subtotal.toFixed(2)}
          </p>
        ) : preview ? (
          <p className="text-sm text-destructive">Nothing from this order is available right now.</p>
        ) : null}
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            className="w-full rounded-full"
            disabled={pending || !preview?.availableCount}
            onClick={() => void applyReorder(false)}
          >
            Replace cart
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            disabled={pending || !preview?.availableCount}
            onClick={() => void applyReorder(true)}
          >
            Add to current cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
