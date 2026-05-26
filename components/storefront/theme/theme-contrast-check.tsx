import { contrastRatio, isValidHexColor } from "@/lib/storefront/theme-validation";

export function ThemeContrastCheck({
  brandColor,
  textColor,
}: {
  brandColor?: string | null;
  textColor?: string | null;
}) {
  const a = brandColor ?? "";
  const b = textColor ?? "";
  if (!a && !b) {
    return <p className="text-xs text-muted-foreground">Set accent and text colors to preview contrast.</p>;
  }
  if (!isValidHexColor(a) || !isValidHexColor(b)) {
    return <p className="text-xs text-amber-800 dark:text-amber-200">Enter valid hex colors to compute contrast.</p>;
  }
  const r = contrastRatio(a, b);
  if (r == null) return null;
  const ok = r >= 4.5;
  return (
    <div className="rounded-lg border border-border/70 p-3 text-sm">
      <p className="font-medium">Contrast (accent vs text)</p>
      <p className="mt-1 font-mono text-xs">
        Ratio: {r.toFixed(2)}:1 {ok ? "(OK for body text)" : "(low — consider WCAG-friendly pairing)"}
      </p>
      <div className="mt-3 flex gap-2">
        <span className="h-10 flex-1 rounded-md border" style={{ backgroundColor: a }} title="Accent" />
        <span className="h-10 flex-1 rounded-md border" style={{ backgroundColor: b }} title="Text" />
      </div>
    </div>
  );
}
