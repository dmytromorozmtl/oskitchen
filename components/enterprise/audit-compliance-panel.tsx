"use client";

import Link from "next/link";
import { ClipboardCheck, FileSearch, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditComplianceDashboard, Soc2ControlReadiness } from "@/lib/enterprise/audit-compliance-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: AuditComplianceDashboard;
};

const READINESS_VARIANT: Record<Soc2ControlReadiness, string> = {
  ready: "bg-emerald-600 hover:bg-emerald-600",
  partial: "bg-amber-500 hover:bg-amber-500",
  gap: "bg-red-600 hover:bg-red-600",
};

export function AuditCompliancePanel({ dashboard }: Props) {
  const { kpis, soc2Controls, categoryBreakdown, recentCritical, warnings } = dashboard;

  return (
    <div className="space-y-6" data-testid="audit-compliance-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <ClipboardCheck className="h-8 w-8 text-primary" aria-hidden />
            Audit &amp; compliance
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            SOC2-ready audit trail — immutable logs, PII redaction, retention policy, and auditor
            export. Not a SOC 2 Type II attestation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full capitalize">
            SOC 2: {dashboard.soc2CertificationStatus.replace(/_/g, " ")}
          </Badge>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/audit-logs">Audit log center</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/audit-logs/retention">Retention policy</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/sso-scim">Enterprise SSO</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{dashboard.complianceScore}%</p>
            <p className="text-xs text-muted-foreground">SOC2 control readiness (internal)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{kpis.eventsLast30Days}</p>
            <p className="text-xs text-muted-foreground">{kpis.eventsToday} today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{dashboard.retentionDays}d</p>
            <p className="text-xs text-muted-foreground">
              {dashboard.retentionConfigured ? "Policy configured" : "Default policy"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical / warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {kpis.critical} / {kpis.warnings}
            </p>
            <p className="text-xs text-muted-foreground">{kpis.redactedEvents} redacted rows</p>
          </CardContent>
        </Card>
      </div>

      {warnings.length > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Compliance notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="soc2-controls-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSearch className="h-4 w-4" aria-hidden />
              SOC 2 control readiness
            </CardTitle>
            <CardDescription>CC6 / CC7 evidence mapped to audit trail capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {soc2Controls.map((control) => (
              <div
                key={control.id}
                className="rounded-lg border border-border/80 bg-muted/30 p-3"
                data-testid={`soc2-control-${control.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {control.tsc} — {control.label}
                  </p>
                  <Badge className={cn("capitalize", READINESS_VARIANT[control.readiness])}>
                    {control.readiness}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{control.evidence}</p>
                <p className="mt-1 text-sm">{control.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category breakdown (30d)</CardTitle>
            <CardDescription>
              {kpis.exportsCompleted} auditor export(s) · {kpis.permissionChanges} permission changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {categoryBreakdown.map((row) => (
                  <tr key={row.category} className="border-b border-border/50">
                    <td className="py-2 pr-3">{row.category}</td>
                    <td className="py-2 text-right tabular-nums font-medium">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4" aria-hidden />
            Recent critical &amp; warning events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCritical.length === 0 ? (
            <p className="text-sm text-muted-foreground">No WARNING or CRITICAL events in scope.</p>
          ) : (
            <div className="space-y-2">
              {recentCritical.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                  data-testid={`critical-event-${event.id}`}
                >
                  <div>
                    <p className="font-medium">{event.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.createdAtIso.slice(0, 19)} · {event.category ?? "—"} ·{" "}
                      {event.actorEmail ?? "system"}
                    </p>
                  </div>
                  <Badge variant={event.severity === "CRITICAL" ? "destructive" : "secondary"}>
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Policy {dashboard.policyId} · Generated {new Date(dashboard.generatedAtIso).toLocaleString()}
      </p>
    </div>
  );
}
