"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Hourglass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KDS_EXPO_VIEW_ROUTE, type ExpoViewLane, type ExpoViewSnapshot } from "@/lib/kitchen/kds-expo-view";
import { kdsTicketAgeClassName } from "@/lib/kitchen/kds-queue-clarity-era18";
import { cn } from "@/lib/utils";

type ExpoViewClientProps = {
  snapshot: ExpoViewSnapshot;
};

const LANE_META: Record<
  ExpoViewLane,
  { icon: typeof CheckCircle2; accent: string; description: string }
> = {
  ready: {
    icon: CheckCircle2,
    accent: "border-emerald-500/40 bg-emerald-500/5",
    description: "Plated and waiting for pickup or run.",
  },
  waiting: {
    icon: Hourglass,
    accent: "border-sky-500/40 bg-sky-500/5",
    description: "Still on the line — expo watches prep progress.",
  },
  delayed: {
    icon: AlertTriangle,
    accent: "border-rose-500/40 bg-rose-500/5",
    description: "Overdue tickets — prioritize runner handoff.",
  },
};

export function ExpoViewClient({ snapshot }: ExpoViewClientProps) {
  return (
    <div className="space-y-6" data-testid="kds-expo-view-root">
      <div className="grid gap-4 md:grid-cols-3">
        {snapshot.lanes.map((lane) => {
          const meta = LANE_META[lane.lane];
          const Icon = meta.icon;
          return (
            <Card key={lane.lane} className={cn("border-border/80 shadow-sm", meta.accent)}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Icon className="h-4 w-4" aria-hidden />
                  {lane.label}
                </CardDescription>
                <CardTitle className="text-3xl tabular-nums">{lane.count}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {snapshot.totalTickets === 0 ? (
        <Card className="border-dashed border-border/80 shadow-sm" data-testid="kds-expo-view-empty">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Expo is clear — ready tickets will appear here when the line bumps orders.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {snapshot.lanes.map((lane) => {
            const meta = LANE_META[lane.lane];
            const Icon = meta.icon;
            return (
              <Card
                key={lane.lane}
                className="border-border/80 shadow-sm"
                data-testid={`kds-expo-lane-${lane.lane}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5" aria-hidden />
                    {lane.label}
                  </CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lane.tickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tickets in this lane.</p>
                  ) : (
                    lane.tickets.map((ticket) => (
                      <div
                        key={`${ticket.kind}-${ticket.id}`}
                        className={cn(
                          "rounded-xl border border-l-4 p-3",
                          kdsTicketAgeClassName(ticket.elapsedSeconds),
                        )}
                        data-testid="kds-expo-ticket"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {ticket.ticketNumber}
                              {ticket.subtitle ? ` · ${ticket.subtitle}` : null}
                            </p>
                          </div>
                          <Badge variant="outline" className="tabular-nums">
                            <Clock3 className="mr-1 h-3 w-3" aria-hidden />
                            {ticket.elapsedLabel}
                          </Badge>
                        </div>
                        {ticket.itemSummary ? (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ticket.itemSummary}</p>
                        ) : null}
                        {ticket.tableName ? (
                          <p className="mt-1 text-xs font-medium">Table {ticket.tableName}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Snapshot {snapshot.generatedAtIso.slice(11, 19)} UTC ·{" "}
        <Link href="/dashboard/kitchen" className="text-primary underline-offset-2 hover:underline">
          Open KDS
        </Link>{" "}
        ·{" "}
        <Link href="/dashboard/kitchen/production" className="text-primary underline-offset-2 hover:underline">
          Production view
        </Link>{" "}
        · route {KDS_EXPO_VIEW_ROUTE}
      </p>
    </div>
  );
}
