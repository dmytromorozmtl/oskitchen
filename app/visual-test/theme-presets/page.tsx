import { ThemePresetPreviewMini } from "@/components/storefront-builder/theme-preset-preview-mini";
import { STOREFRONT_THEME_PRESETS } from "@/lib/storefront-builder/theme-presets";

/** Isolated page for Playwright / Chromatic snapshots — not linked in production nav. */
export default function VisualTestThemePresetsPage() {
  return (
    <div className="space-y-6" data-testid="visual-theme-presets">
      <h1 className="text-lg font-semibold">Theme preset previews</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STOREFRONT_THEME_PRESETS.map((p) => (
          <div key={p.id} data-preset-id={p.id} className="space-y-2">
            <p className="text-xs font-medium">{p.name}</p>
            <ThemePresetPreviewMini preset={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
