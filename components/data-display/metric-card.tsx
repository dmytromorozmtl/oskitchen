import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  METRIC_CARD_ACCENT_CLASS,
  METRIC_CARD_CLASS,
  METRIC_CARD_TEST_ID,
} from "@/lib/design/metric-card-patterns";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Card
      className={cn(METRIC_CARD_CLASS, accent ? METRIC_CARD_ACCENT_CLASS : undefined, className)}
      data-testid={METRIC_CARD_TEST_ID}
    >
      <CardHeader
        className={cn("pb-2", Icon ? "flex flex-row items-start justify-between space-y-0" : undefined)}
      >
        {Icon ? (
          <>
            <CardDescription>{label}</CardDescription>
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </>
        ) : (
          <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
