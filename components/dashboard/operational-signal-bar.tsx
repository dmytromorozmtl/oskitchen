import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export type OperationalAttentionItem = {
  title: string;
  detail: string;
  href: string;
  /** Lower runs first (1 = most urgent). */
  priority: number;
};

type OperationalSignalBarProps = {
  items: OperationalAttentionItem[];
  activeOrders: number;
  ordersToday: number;
};

/**
 * Sticky operational strip for dashboard home — surfaces urgency without duplicating full cards.
 */
export function OperationalSignalBar({
  items,
  activeOrders,
  ordersToday,
}: OperationalSignalBarProps) {
  const sorted = [...items].sort((a, b) => a.priority - b.priority);
  const top = sorted.slice(0, 3);

  return (
    <div className="sticky top-0 z-chrome -mx-4 mb-2 border-b border-border/60 bg-background/90 px-4 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 md:static md:mx-0 md:mb-0 md:rounded-xl md:border md:py-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:text-sm">
          {sorted.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Ops clear — {ordersToday} today · {activeOrders} active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {sorted.length} signal{sorted.length === 1 ? "" : "s"} need review
            </span>
          )}
        </div>
        {top.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {top.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="inline-flex max-w-[220px] items-center truncate rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-950 hover:bg-amber-500/20 dark:text-amber-50 md:max-w-xs"
                title={item.detail}
              >
                {item.title}
              </Link>
            ))}
            {sorted.length > 3 ? (
              <Link
                href="#operational-alerts"
                className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/60"
              >
                +{sorted.length - 3} more
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
