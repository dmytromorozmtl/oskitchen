import { format } from "date-fns";

import type { ActivityTimelineItem } from "@/lib/activity/activity-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ActivityTimeline({
  title = "Activity",
  description = "Recent audit-safe events for this record.",
  items,
  emptyLabel = "No activity recorded yet.",
}: {
  title?: string;
  description?: string;
  items: ActivityTimelineItem[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
            >
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/80" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{item.title}</p>
                {item.subtitle ? (
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                ) : null}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}
                  {item.severity ? (
                    <span
                      className={cn(
                        "ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase",
                        item.severity === "CRITICAL"
                          ? "bg-destructive/15 text-destructive"
                          : item.severity === "WARNING"
                            ? "bg-amber-500/15 text-amber-900"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.severity}
                    </span>
                  ) : null}
                </p>
                {item.href ? (
                  <Link href={item.href} className="mt-1 inline-block text-xs font-medium text-primary">
                    Open related view
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
