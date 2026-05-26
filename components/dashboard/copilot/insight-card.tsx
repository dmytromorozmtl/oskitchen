import Link from "next/link";

import { resolveCopilotInsightFormAction } from "@/actions/copilot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Severity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

const COLOR: Record<Severity, string> = {
  INFO: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  SUCCESS: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  WARNING: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  CRITICAL: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
};

export function CopilotInsightCard({
  id,
  severity,
  title,
  summary,
  recommendedAction,
  actionRoute,
  canResolve,
}: {
  id: string;
  severity: Severity;
  title: string;
  summary: string;
  recommendedAction: string | null;
  actionRoute: string | null;
  canResolve: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR[severity]}`}>
            {severity}
          </span>
        </div>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 pt-0 text-sm">
        {recommendedAction && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Recommended:</span> {recommendedAction}
          </p>
        )}
        {actionRoute && (
          <Link
            href={actionRoute}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            Open module
          </Link>
        )}
        {canResolve && (
          <form action={resolveCopilotInsightFormAction}>
            <input type="hidden" name="id" value={id} />
            <button className="rounded-md border border-border px-3 py-1.5 text-xs">
              Mark resolved
            </button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
