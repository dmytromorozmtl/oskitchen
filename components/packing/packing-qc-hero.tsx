import { AlertTriangle, PackageCheck, PackageOpen } from "lucide-react";

import { buildPackingQcHero } from "@/lib/packing/packing-qc-clarity-era19";
import type { PackingFocusSnapshot } from "@/lib/packing/packing-focus-era18";
import { cn } from "@/lib/utils";

export function PackingQcHero(props: {
  focus: PackingFocusSnapshot;
  hasTasks: boolean;
}) {
  const hero = buildPackingQcHero(props);

  const Icon =
    hero.tone === "urgent"
      ? AlertTriangle
      : hero.tone === "success"
        ? PackageCheck
        : PackageOpen;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        hero.tone === "urgent" &&
          "border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20",
        hero.tone === "success" &&
          "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20",
        hero.tone === "neutral" && "border-border/80 bg-background/80",
      )}
      data-testid="packing-qc-hero"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            hero.tone === "urgent" && "text-amber-600",
            hero.tone === "success" && "text-emerald-600",
            hero.tone === "neutral" && "text-muted-foreground",
          )}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-medium leading-snug">{hero.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hero.subline}</p>
        </div>
      </div>
    </div>
  );
}
