export function ThemeLayoutPreview({ layoutPreset }: { layoutPreset?: string | null }) {
  const lp = (layoutPreset ?? "").trim() || "default";
  return (
    <div className="rounded-lg border border-border/70 p-3 text-sm">
      <p className="font-medium">Layout preview</p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">{lp}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border bg-card p-2 text-[10px] text-muted-foreground">Mobile card</div>
        <div className="rounded-md border bg-card p-2 text-[10px] text-muted-foreground">Desktop card</div>
      </div>
    </div>
  );
}
