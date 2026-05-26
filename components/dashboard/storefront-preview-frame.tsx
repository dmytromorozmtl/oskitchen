"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/constants";

type ViewportPreset = "desktop" | "tablet" | "mobile";

const VIEWPORTS: { id: ViewportPreset; label: string; width: string; height: string }[] = [
  { id: "desktop", label: "Desktop", width: "100%", height: "720px" },
  { id: "tablet", label: "Tablet", width: "768px", height: "720px" },
  { id: "mobile", label: "Mobile", width: "375px", height: "720px" },
];

export function StorefrontPreviewFrame({
  storeSlug,
  previewCookieAvailable,
}: {
  storeSlug: string;
  previewCookieAvailable: boolean;
}) {
  const base = SITE_URL.replace(/\/$/, "");
  const previewPath = `${base}/s/${encodeURIComponent(storeSlug)}?preview=1`;
  const [src, setSrc] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>("Loading preview…");
  const [viewport, setViewport] = React.useState<ViewportPreset>("desktop");

  const setPreviewSrc = React.useCallback(() => {
    setSrc(`${previewPath}&cb=${Date.now()}`);
  }, [previewPath]);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!previewCookieAvailable) {
        if (!cancelled) {
          setPreviewSrc();
          setStatus("Preview mode — sign in as owner to see unpublished drafts.");
        }
        return;
      }
      try {
        const res = await fetch("/api/storefront/preview-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeSlug }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setPreviewSrc();
          setStatus(data.error ?? "Could not issue preview cookie — showing published preview.");
          return;
        }
        setPreviewSrc();
        setStatus("Signed preview cookie issued — iframe loads draft for ~15 minutes.");
      } catch {
        if (!cancelled) {
          setPreviewSrc();
          setStatus("Network error — showing preview without signed cookie.");
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [storeSlug, previewCookieAvailable, setPreviewSrc]);

  const vp = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0]!;

  return (
    <div className="space-y-3">
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      <div className="flex flex-wrap gap-2">
        {VIEWPORTS.map((v) => (
          <Button
            key={v.id}
            type="button"
            size="sm"
            variant={viewport === v.id ? "secondary" : "outline"}
            className="rounded-full"
            onClick={() => setViewport(v.id)}
          >
            {v.label} ({v.id === "mobile" ? "375" : v.id === "tablet" ? "768" : "full"}px)
          </Button>
        ))}
      </div>
      <div className="flex justify-center overflow-x-auto rounded-2xl border border-border/80 bg-muted/30 p-4">
        {src ? (
          <iframe
            title={`Storefront preview (${vp.label})`}
            src={src}
            className="max-w-full rounded-lg border border-border/60 bg-background shadow-sm transition-[width] duration-200"
            style={{ width: vp.width, height: vp.height }}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-background text-sm text-muted-foreground"
            style={{ width: vp.width, height: vp.height }}
          >
            Loading storefront…
          </div>
        )}
      </div>
    </div>
  );
}
