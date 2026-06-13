"use client";

import { useTransition } from "react";
import { CalendarClock, Mail } from "lucide-react";

import { toggleScheduledReportsP2_48Action } from "@/actions/scheduled-reports-p2-48";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduledReportsPanelPayload } from "@/services/analytics/scheduled-reports-p2-48-service";

export function ScheduledReportsP2_48Panel({ data }: { data: ScheduledReportsPanelPayload }) {
  const [pending, startTransition] = useTransition();
  const { settings } = data;

  function onToggle() {
    startTransition(async () => {
      await toggleScheduledReportsP2_48Action(!settings.enabled);
    });
  }

  return (
    <Card className="border-border/80 shadow-sm" data-testid="scheduled-reports-p2-48">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              Scheduled weekly reports
            </CardTitle>
            <CardDescription>
              Lightspeed parity — email PDF weekly digest. BETA directional reporting — not audited
              GL.
            </CardDescription>
          </div>
          <Badge
            variant={settings.enabled ? "default" : "outline"}
            className="rounded-full text-xs"
            data-testid="scheduled-reports-enabled"
          >
            {settings.enabled ? "Enabled" : "Off"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Report template
            </p>
            <p className="mt-1 font-medium">{data.reportTitle}</p>
          </div>
          <div
            className="rounded-xl border border-border/70 bg-muted/20 p-4"
            data-testid="scheduled-reports-next-send"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              Next send
            </p>
            <p className="mt-1 font-medium">{data.nextSendLabel} · 07:00 UTC</p>
            {settings.lastSentAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Last sent {settings.lastSentAt.slice(0, 10)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant={settings.enabled ? "outline" : "default"}
            disabled={pending}
            onClick={onToggle}
          >
            {settings.enabled ? "Disable weekly email" : "Enable weekly email PDF"}
          </Button>
          <p className="text-muted-foreground">
            PDF attachment emailed every Monday with your weekly executive summary.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
