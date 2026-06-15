import Link from "next/link";
import { AlertTriangle, Clock, Gauge, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  KITCHEN_SLA_TIMERS_CAPABILITIES,
  KITCHEN_SLA_TIMERS_EYEBROW,
  KITCHEN_SLA_TIMERS_HEADLINE,
  KITCHEN_SLA_TIMERS_OPERATOR_LINKS,
  KITCHEN_SLA_TIMERS_SUBLINE,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-content";
import {
  formatKitchenSlaDuration,
  kitchenSlaLevelBadgeVariant,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-operations";
import { KITCHEN_SLA_TIMERS_TEST_IDS } from "@/lib/kitchen/kitchen-sla-timers-p2-92-policy";
import type { KitchenSlaTimersSnapshot } from "@/services/kitchen/kitchen-sla-timers-p2-92-service";

const CAPABILITY_ICONS = [Timer, AlertTriangle, Gauge] as const;

/** Blueprint P2-92 — kitchen SLA timers panel. */
export function KitchenSlaTimersPanel({ snapshot }: { snapshot: KitchenSlaTimersSnapshot }) {
  return (
    <div className="space-y-8" data-testid={KITCHEN_SLA_TIMERS_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {KITCHEN_SLA_TIMERS_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{KITCHEN_SLA_TIMERS_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {KITCHEN_SLA_TIMERS_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.activeTicketCount} active ticket(s) · {snapshot.stationCount} station(s) · policy{" "}
          {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Avg prep time</CardDescription>
            <CardTitle className="text-2xl">
              {formatKitchenSlaDuration(snapshot.avgPrepTimeSeconds)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-200/80 shadow-sm dark:border-emerald-900/40">
          <CardHeader className="pb-2">
            <CardDescription>Green (&lt;5m)</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              {snapshot.levelCounts.green}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200/80 shadow-sm dark:border-amber-900/40">
          <CardHeader className="pb-2">
            <CardDescription>Yellow (5–10m)</CardDescription>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
              {snapshot.levelCounts.yellow}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-rose-200/80 shadow-sm dark:border-rose-900/40">
          <CardHeader className="pb-2">
            <CardDescription>Red (&gt;10m)</CardDescription>
            <CardTitle className="text-2xl text-rose-600 dark:text-rose-400">
              {snapshot.levelCounts.red}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {snapshot.bottleneck ? (
        <Card className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <CardTitle className="text-base">Bottleneck alert</CardTitle>
              <CardDescription className="mt-1">{snapshot.bottleneck.message}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Avg wait {snapshot.bottleneck.avgWaitMinutes}m · load {snapshot.bottleneck.loadPercent}%
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {KITCHEN_SLA_TIMERS_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Clock;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={KITCHEN_SLA_TIMERS_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {snapshot.tickets.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ticket SLA levels</CardTitle>
            <CardDescription>Longest-waiting tickets first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {snapshot.tickets.slice(0, 12).map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0"
              >
                <span className="font-mono text-xs">{ticket.id.slice(0, 8)}</span>
                <span className="flex items-center gap-2">
                  <Badge variant={kitchenSlaLevelBadgeVariant(ticket.level)} className="capitalize">
                    {ticket.level}
                  </Badge>
                  <span className="text-muted-foreground">{ticket.clock}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          No active tickets — open KDS during service to populate SLA timers.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {KITCHEN_SLA_TIMERS_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
