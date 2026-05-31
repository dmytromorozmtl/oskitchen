"use client";

import { useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlarmClock, CheckCircle2, PauseCircle } from "lucide-react";

import { updateB2bCollectorTaskStatusAction } from "@/actions/shopify-b2b-collector-queue";
import { SHOPIFY_MARKET_B2B_COLLECTOR_QUEUE_HONESTY } from "@/lib/commercial/shopify-market-b2b-collector-queue";
import type {
  B2bArCollectorQueueSnapshot,
  B2bArCollectorTask,
} from "@/lib/integrations/shopify-b2b-collector-queue-metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

const PRIORITY_VARIANT: Record<
  B2bArCollectorTask["priority"],
  "destructive" | "default" | "outline" | "secondary"
> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function B2bCollectorTaskQueue({
  queue,
  connectionId,
}: {
  queue: B2bArCollectorQueueSnapshot;
  connectionId: string | null;
}) {
  const [filter, setFilter] = useState<"active" | "breached" | "all">("active");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const visibleTasks = useMemo(() => {
    if (filter === "breached") {
      return queue.tasks.filter(
        (task) => task.slaBreached && (task.status === "open" || task.status === "snoozed"),
      );
    }
    if (filter === "all") return queue.tasks;
    return queue.tasks.filter((task) => task.status === "open" || task.status === "snoozed");
  }, [filter, queue.tasks]);

  function runTaskAction(taskId: string, status: B2bArCollectorTask["status"]) {
    if (!connectionId) {
      setMessage("Connect Shopify to manage collector tasks.");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await updateB2bCollectorTaskStatusAction({ taskId, status });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(`Task ${status === "done" ? "completed" : status}.`);
    });
  }

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm" id="b2b-collector-task-queue">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Collector task queue</CardTitle>
        <CardDescription className="max-w-3xl">{SHOPIFY_MARKET_B2B_COLLECTOR_QUEUE_HONESTY}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="grid gap-2 sm:grid-cols-4">
            <StatPill label="Open" value={String(queue.openCount)} />
            <StatPill label="Snoozed" value={String(queue.snoozedCount)} />
            <StatPill label="SLA breach" value={String(queue.slaBreachedCount)} highlight={queue.slaBreachedCount > 0} />
            <StatPill label="Escalated" value={String(queue.escalatedCount)} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["active", "breached", "all"] as const).map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? "default" : "outline"}
                className="rounded-full text-xs"
                onClick={() => setFilter(key)}
              >
                {key === "active" ? "Active" : key === "breached" ? "SLA breached" : "All"}
              </Button>
            ))}
          </div>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        {visibleTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collector tasks in this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Max past due</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTasks.map((task) => (
                  <TableRow key={task.taskId}>
                    <TableCell className="text-sm">
                      {task.companyName}
                      {task.paymentDriftCount > 0 ? (
                        <Badge variant="outline" className="ml-1 rounded-full text-[9px]">
                          {task.paymentDriftCount} drift
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">{task.assignee ?? "Unassigned"}</TableCell>
                    <TableCell className="text-xs capitalize">{task.status}</TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_VARIANT[task.priority]} className="rounded-full text-[10px]">
                        {task.priority}
                        {task.slaBreached ? " · SLA" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">{task.maxDaysPastDue}d</TableCell>
                    <TableCell className="text-xs">
                      {task.dueAt
                        ? formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {formatCurrency(task.openAmountCents / 100)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {task.status !== "done" ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-full px-2 text-xs"
                              disabled={pending}
                              onClick={() => runTaskAction(task.taskId, "snoozed")}
                            >
                              <PauseCircle className="size-3" aria-hidden />
                              <span className="ml-1">Snooze</span>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-full px-2 text-xs"
                              disabled={pending}
                              onClick={() => runTaskAction(task.taskId, "done")}
                            >
                              <CheckCircle2 className="size-3" aria-hidden />
                              <span className="ml-1">Done</span>
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-full px-2 text-xs"
                            disabled={pending}
                            onClick={() => runTaskAction(task.taskId, "open")}
                          >
                            <AlarmClock className="size-3" aria-hidden />
                            <span className="ml-1">Reopen</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        highlight ? "border-destructive/40 bg-destructive/5" : "border-border/70"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
