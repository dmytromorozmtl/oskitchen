"use client";

import type { StorefrontThemePresetDefinition } from "@/lib/storefront-builder/theme-presets";

/** Mini storefront hero preview using preset design tokens (no apply). */
export function ThemePresetPreviewMini({ preset }: { preset: StorefrontThemePresetDefinition }) {
  const c = preset.tokens.colors;
  const accent = c.accent || c.primary;
  const bg = c.background;
  const text = c.text;

  return (
    <div
      className="overflow-hidden rounded-lg border border-border/60 text-[10px] leading-tight shadow-inner"
      style={{ background: bg, color: text }}
    >
      <div className="px-2 py-1.5" style={{ background: `linear-gradient(135deg, ${c.primary}22, ${accent}33)` }}>
        <p className="font-semibold truncate">Your Kitchen</p>
        <p className="truncate opacity-70">Fresh preorders this week</p>
      </div>
      <div className="flex flex-wrap gap-1 px-2 py-2">
        <span
          className="rounded-full px-2 py-0.5 font-medium text-white"
          style={{ background: accent }}
        >
          Order now
        </span>
        <span className="rounded-full border px-2 py-0.5" style={{ borderColor: `${text}33` }}>
          View menu
        </span>
      </div>
    </div>
  );
}
