import {
  POSITIONING_REFORMULATION_EYEBROW,
  POSITIONING_REFORMULATION_PRIMARY_LINE,
  POSITIONING_REFORMULATION_SUBLINE,
  POSITIONING_REFORMULATION_SUPPORTING_PILLARS,
} from "@/lib/marketing/positioning-reformulation-content";
import { POSITIONING_REFORMULATION_STRIP_TEST_ID } from "@/lib/marketing/positioning-reformulation-policy";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "dark" | "light";
};

/** Blueprint P1-72 — canonical positioning line on public marketing surfaces. */
export function PositioningReformulationStrip({ className, variant = "dark" }: Props) {
  const isDark = variant === "dark";

  return (
    <section
      className={cn("mx-auto max-w-3xl px-4 text-center", className)}
      data-testid={POSITIONING_REFORMULATION_STRIP_TEST_ID}
      aria-label="Positioning"
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-widest",
          isDark ? "text-primary/80" : "text-primary",
        )}
      >
        {POSITIONING_REFORMULATION_EYEBROW}
      </p>
      <p
        className={cn(
          "mt-3 text-balance text-lg font-medium leading-relaxed sm:text-xl",
          isDark ? "text-white/90" : "text-foreground",
        )}
      >
        {POSITIONING_REFORMULATION_PRIMARY_LINE}
      </p>
      <p
        className={cn(
          "mt-3 text-sm leading-relaxed sm:text-base",
          isDark ? "text-white/70" : "text-muted-foreground",
        )}
      >
        {POSITIONING_REFORMULATION_SUBLINE}
      </p>
      <ul className="mt-6 grid gap-3 text-left sm:grid-cols-3">
        {POSITIONING_REFORMULATION_SUPPORTING_PILLARS.map((pillar) => (
          <li
            key={pillar.id}
            className={cn(
              "rounded-xl border px-4 py-3",
              isDark
                ? "border-white/10 bg-white/5 text-white/90"
                : "border-border bg-card text-foreground",
            )}
          >
            <p className="text-sm font-semibold">{pillar.title}</p>
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed",
                isDark ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {pillar.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
