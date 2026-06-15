import Link from "next/link";
import { AlertTriangle, Clock, RotateCcw, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BUMP_RECALL_AUDIT_DIMENSIONS,
  BUMP_RECALL_AUDIT_EYEBROW,
  BUMP_RECALL_AUDIT_HEADLINE,
  BUMP_RECALL_AUDIT_OPERATOR_LINKS,
  BUMP_RECALL_AUDIT_SUBLINE,
} from "@/lib/kitchen/bump-recall-audit-p2-91-content";
import { formatElapsedSeconds } from "@/lib/kitchen/bump-recall-audit-p2-91-operations";
import { BUMP_RECALL_AUDIT_TEST_IDS } from "@/lib/kitchen/bump-recall-audit-p2-91-policy";
import type { BumpRecallAuditSnapshot } from "@/services/kitchen/bump-recall-audit-p2-91-service";

const DIMENSION_ICONS = [UserCheck, Clock, AlertTriangle, RotateCcw] as const;

/** Blueprint P2-91 — bump/recall audit panel. */
export function BumpRecallAuditPanel({ snapshot }: { snapshot: BumpRecallAuditSnapshot }) {
  return (
    <div className="space-y-8" data-testid={BUMP_RECALL_AUDIT_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {BUMP_RECALL_AUDIT_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{BUMP_RECALL_AUDIT_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {BUMP_RECALL_AUDIT_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          Last {snapshot.lookbackDays} day(s) · {snapshot.eventCount} event(s) · policy{" "}
          {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Bumps</CardDescription>
            <CardTitle className="text-2xl">{snapshot.bumpCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Recalls</CardDescription>
            <CardTitle className="text-2xl">{snapshot.recallCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Late tickets</CardDescription>
            <CardTitle className="text-2xl">{snapshot.lateTicketCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Operators</CardDescription>
            <CardTitle className="text-2xl">{snapshot.uniqueOperators}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {BUMP_RECALL_AUDIT_DIMENSIONS.map((dimension, index) => {
          const Icon = DIMENSION_ICONS[index] ?? UserCheck;
          return (
            <Card
              key={dimension.id}
              className="border-border/80 shadow-sm"
              data-testid={BUMP_RECALL_AUDIT_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{dimension.label}</CardTitle>
                  <CardDescription className="mt-1">{dimension.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{dimension.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {snapshot.stationSummaries.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Time per station</CardTitle>
            <CardDescription>Average elapsed seconds at bump/recall by station</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {snapshot.stationSummaries.map((row) => (
              <div key={row.station} className="flex flex-wrap justify-between gap-2 border-b py-2 last:border-0">
                <span className="font-medium capitalize">{row.station}</span>
                <span className="text-muted-foreground">
                  {row.bumpCount} bump · {row.recallCount} recall · avg{" "}
                  {formatElapsedSeconds(row.avgElapsedSeconds)}
                  {row.lateCount > 0 ? ` · ${row.lateCount} late` : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {snapshot.recentEvents.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent bump/recall events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {snapshot.recentEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="flex flex-wrap justify-between gap-2 border-b py-2 last:border-0">
                <span>
                  <Badge variant="outline" className="mr-2 capitalize">
                    {event.kind}
                  </Badge>
                  {event.actorRole ?? "operator"} · {event.station}
                  {event.lateTicket ? (
                    <Badge variant="destructive" className="ml-2">
                      late
                    </Badge>
                  ) : null}
                </span>
                <span className="text-muted-foreground">
                  {formatElapsedSeconds(event.elapsedSeconds)}
                  {event.remakeReason ? ` · ${event.remakeReason}` : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          No bump or recall audit events in the lookback window — bump tickets on KDS to populate this report.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {BUMP_RECALL_AUDIT_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
