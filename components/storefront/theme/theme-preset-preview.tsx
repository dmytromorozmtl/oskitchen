export function ThemePresetPreview({ themePreset, layoutPreset }: { themePreset?: string | null; layoutPreset?: string | null }) {
  const tp = (themePreset ?? "").trim() || "default";
  const lp = (layoutPreset ?? "").trim() || "default";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-border/70 p-3 text-sm">
        <p className="font-medium">Theme preset</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{tp}</p>
        <p className="mt-2 text-xs text-muted-foreground">Keys are stored as text; rendering uses global storefront styles.</p>
      </div>
      <div className="rounded-lg border border-border/70 p-3 text-sm">
        <p className="font-medium">Layout preset</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{lp}</p>
      </div>
    </div>
  );
}
