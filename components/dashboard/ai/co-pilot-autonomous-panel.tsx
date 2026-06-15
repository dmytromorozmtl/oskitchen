"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AlertTriangle, Bot, CalendarDays, CheckCircle2, Play } from "lucide-react";
import { toast } from "sonner";

import {
  resolveCoPilotExceptionAction,
  runCoPilotAutonomousCycleAction,
  updateCoPilotAutonomousSettingsAction,
} from "@/actions/co-pilot-autonomous";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { CoPilotAutonomousDashboard } from "@/lib/ai/co-pilot-autonomous-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: CoPilotAutonomousDashboard;
  canManage: boolean;
};

const SEVERITY_CLASS = {
  critical: "bg-red-600 hover:bg-red-600",
  warning: "bg-amber-500 hover:bg-amber-500",
  info: "bg-muted text-muted-foreground",
};

export function CoPilotAutonomousPanel({ dashboard, canManage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { digest, exceptions, settings } = dashboard;

  function run(action: () => Promise<{ ok: boolean; error?: string; data?: { message?: string } }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Request failed.");
        return;
      }
      toast.success(result.data?.message ?? "Done.");
      router.refresh();
    });
  }

  function toggleSetting(key: "enabled" | "autoRunSafeActions", value: boolean) {
    if (!canManage) return;
    run(() => updateCoPilotAutonomousSettingsAction({ [key]: value }));
  }

  return (
    <div className="space-y-6" data-testid="co-pilot-autonomous-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" aria-hidden />
            AI Co-Pilot 2.0
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Fully autonomous mode — daily digest, exception log, and safe auto-execution for info-level
            hygiene actions.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/ai/co-pilot">Manual Co-Pilot →</Link>
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" aria-hidden />
            Daily digest — {digest.date}
          </CardTitle>
          <CardDescription>{digest.headline}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{digest.stats.recommendationsScanned} scanned</Badge>
            <Badge variant="destructive">{digest.stats.criticalCount} critical</Badge>
            <Badge variant="secondary">{digest.stats.warningCount} warning</Badge>
            <Badge variant="outline">{digest.stats.autoExecuted} auto-ran</Badge>
          </div>
          {digest.sections.map((section) => (
            <div key={section.id} className="rounded-lg border bg-background p-3">
              <p className="text-sm font-medium">
                {section.title}{" "}
                <span className="text-muted-foreground font-normal">({section.itemCount})</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{section.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Autonomous controls</CardTitle>
          <CardDescription>
            Safe actions: report exports and demand re-runs only. Critical items always land in the
            exception log.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Autonomous mode</p>
              <p className="text-xs text-muted-foreground">Run safe actions on each cycle</p>
            </div>
            <Switch
              checked={settings.enabled}
              disabled={!canManage || pending}
              data-testid="co-pilot-autonomous-enabled"
              onCheckedChange={(v) => toggleSetting("enabled", v)}
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Auto-run safe actions</p>
              <p className="text-xs text-muted-foreground">Info-level hygiene only</p>
            </div>
            <Switch
              checked={settings.autoRunSafeActions}
              disabled={!canManage || pending || !settings.enabled}
              onCheckedChange={(v) => toggleSetting("autoRunSafeActions", v)}
            />
          </label>
          {settings.lastRunAt ? (
            <p className="text-xs text-muted-foreground">
              Last cycle {new Date(settings.lastRunAt).toLocaleString()}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={!canManage || pending}
            data-testid="co-pilot-autonomous-run"
            onClick={() => run(runCoPilotAutonomousCycleAction)}
          >
            <Play className="mr-1.5 h-4 w-4" aria-hidden />
            Run autonomous cycle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Exception log
          </CardTitle>
          <CardDescription>Critical and warning items requiring human review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {exceptions.length === 0 ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              No open exceptions — great shift.
            </p>
          ) : (
            exceptions.slice(0, 20).map((exc) => (
              <div
                key={exc.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-2 rounded-lg border px-3 py-2",
                  exc.resolved && "opacity-50",
                )}
                data-testid={`co-pilot-exception-${exc.id}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("capitalize", SEVERITY_CLASS[exc.severity])}>{exc.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{exc.category}</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{exc.title}</p>
                  <p className="text-xs text-muted-foreground">{exc.detail}</p>
                </div>
                {!exc.resolved && canManage ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => run(() => resolveCoPilotExceptionAction(exc.id))}
                  >
                    Resolve
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
