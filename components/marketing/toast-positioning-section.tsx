import Link from "next/link";
import { ArrowRight, Monitor, Unlock, Wifi } from "lucide-react";

import {
  TOAST_POSITIONING_CTA,
  TOAST_POSITIONING_EYEBROW,
  TOAST_POSITIONING_PRIMARY_LINE,
  TOAST_POSITIONING_SUBLINE,
  TOAST_POSITIONING_TOAST_WINS,
  TOAST_POSITIONING_WEDGES,
} from "@/lib/marketing/toast-positioning-content";
import { TOAST_POSITIONING_SECTION_TEST_ID } from "@/lib/marketing/toast-positioning-policy";
import { cn } from "@/lib/utils";

const WEDGE_ICONS = {
  byo_hardware: Monitor,
  no_lease: Unlock,
  ops_truth: Wifi,
} as const;

type Props = {
  className?: string;
  variant?: "default" | "compact";
};

/** Blueprint P1-74 — Toast competitive positioning section. */
export function ToastPositioningSection({ className, variant = "default" }: Props) {
  const compact = variant === "compact";

  return (
    <section
      className={cn(
        "border-t border-border/60",
        compact ? "py-10 sm:py-12" : "py-16 sm:py-20",
        className,
      )}
      data-testid={TOAST_POSITIONING_SECTION_TEST_ID}
      aria-labelledby="toast-positioning-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("mx-auto text-center", compact ? "max-w-3xl" : "max-w-4xl")}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {TOAST_POSITIONING_EYEBROW}
          </p>
          <h2
            id="toast-positioning-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {TOAST_POSITIONING_PRIMARY_LINE}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {TOAST_POSITIONING_SUBLINE}
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {TOAST_POSITIONING_WEDGES.map((wedge) => {
            const Icon = WEDGE_ICONS[wedge.id as keyof typeof WEDGE_ICONS] ?? Unlock;
            return (
              <li
                key={wedge.id}
                className="rounded-2xl border border-border/80 bg-card/50 p-6"
                data-testid={`toast-positioning-wedge-${wedge.id}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{wedge.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{wedge.body}</p>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-center text-sm text-muted-foreground">
          {TOAST_POSITIONING_TOAST_WINS} Toast® is not affiliated with OS Kitchen — verify current
          Toast pricing and hardware bundles before purchase.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={TOAST_POSITIONING_CTA.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {TOAST_POSITIONING_CTA.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
