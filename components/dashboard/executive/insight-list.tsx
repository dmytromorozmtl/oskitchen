import Link from "next/link";

import {
  dismissExecutiveInsightFormAction,
  resolveExecutiveInsightFormAction,
} from "@/actions/executive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Insight = {
  id: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
  title: string;
  description: string;
  actionLabel: string | null;
  actionRoute: string | null;
  createdAt: Date;
};

const SEVERITY_COLOR: Record<Insight["severity"], string> = {
  INFO: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  WARNING: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  CRITICAL: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
  SUCCESS: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
};

export function InsightList({
  insights,
  canManage,
}: {
  insights: Insight[];
  canManage: boolean;
}) {
  if (insights.length === 0) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">No open insights</CardTitle>
          <CardDescription>All tracked operational signals are inside their guard rails.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {insights.map((i) => (
        <Card key={i.id} className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{i.title}</CardTitle>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLOR[i.severity]}`}
              >
                {i.severity}
              </span>
            </div>
            <CardDescription>{i.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0 text-sm">
            {i.actionRoute && (
              <Link
                href={i.actionRoute}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                {i.actionLabel ?? "Open"}
              </Link>
            )}
            {canManage && (
              <>
                <form action={resolveExecutiveInsightFormAction}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="rounded-md border border-border px-3 py-1.5 text-xs">
                    Mark resolved
                  </button>
                </form>
                <form action={dismissExecutiveInsightFormAction}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="rounded-md border border-border px-3 py-1.5 text-xs">
                    Dismiss
                  </button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
