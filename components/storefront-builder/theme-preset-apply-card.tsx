"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { applyStorefrontThemePreset } from "@/actions/storefront-theme-preset";
import { ThemePresetPreviewMini } from "@/components/storefront-builder/theme-preset-preview-mini";
import { Button } from "@/components/ui/button";
import type { StorefrontThemePresetDefinition } from "@/lib/storefront-builder/theme-presets";

function CurrentThemePreviewMini({
  colors,
}: {
  colors: { brand: string; background: string; text: string; secondary: string };
}) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border/60 text-[10px] leading-tight shadow-inner"
      style={{ background: colors.background, color: colors.text }}
    >
      <div className="px-2 py-1.5" style={{ background: `linear-gradient(135deg, ${colors.brand}22, ${colors.secondary}33)` }}>
        <p className="font-semibold truncate">Your Kitchen</p>
        <p className="truncate opacity-70">Current draft theme</p>
      </div>
      <div className="flex flex-wrap gap-1 px-2 py-2">
        <span className="rounded-full px-2 py-0.5 font-medium text-white" style={{ background: colors.brand }}>
          Order now
        </span>
        <span className="rounded-full border px-2 py-0.5" style={{ borderColor: `${colors.text}33` }}>
          View menu
        </span>
      </div>
    </div>
  );
}

export function ThemePresetApplyCard({
  presets,
  activePresetId,
  currentColors,
}: {
  presets: StorefrontThemePresetDefinition[];
  activePresetId: string | null;
  currentColors: { brand: string; background: string; text: string; secondary: string };
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [previewId, setPreviewId] = React.useState<string | null>(presets[0]?.id ?? null);
  const preview = presets.find((p) => p.id === previewId) ?? presets[0];

  async function apply(presetId: string) {
    setPendingId(presetId);
    const res = await applyStorefrontThemePreset(presetId);
    setPendingId(null);
    if ("error" in res && res.error) {
      toast.error(getActionError(res) ?? "Something went wrong");
      return;
    }
    toast.success("Theme preset applied — review colors below, then publish when ready.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {presets.map((p) => {
          const active = activePresetId === p.id;
          const selected = previewId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreviewId(p.id)}
              className={`rounded-xl border p-3 text-left text-xs transition ${
                selected ? "border-primary ring-2 ring-primary/20" : "border-border/80 bg-muted/20 hover:border-border"
              }`}
            >
              <p className="font-semibold text-foreground">{p.name}</p>
              <p className="mt-1 line-clamp-2 text-muted-foreground">{p.description}</p>
              <div className="mt-2">
                <ThemePresetPreviewMini preset={p} />
              </div>
              {active ? (
                <p className="mt-2 text-[10px] font-medium text-primary">Currently applied</p>
              ) : null}
            </button>
          );
        })}
      </div>
      {preview ? (
        <div className="rounded-xl border border-border/80 bg-muted/10 p-4">
          <p className="text-sm font-medium">Compare before apply</p>
          <p className="mt-1 text-xs text-muted-foreground">{preview.description}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Current</p>
              <CurrentThemePreviewMini colors={currentColors} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Preset: {preview.name}</p>
              <ThemePresetPreviewMini preset={preview} />
            </div>
          </div>
          <Button
            type="button"
            className="mt-4 rounded-full"
            disabled={pendingId !== null}
            onClick={() => void apply(preview.id)}
          >
            {pendingId === preview.id ? "Applying…" : activePresetId === preview.id ? "Re-apply preset" : "Apply preset"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
