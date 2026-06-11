import Link from "next/link";
import { ChefHat, Flame, GlassWater, Package, Salad, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MULTI_STATION_KDS_EYEBROW,
  MULTI_STATION_KDS_HEADLINE,
  MULTI_STATION_KDS_OPERATOR_LINKS,
  MULTI_STATION_KDS_STATIONS,
  MULTI_STATION_KDS_SUBLINE,
} from "@/lib/kitchen/multi-station-kds-p2-90-content";
import { MULTI_STATION_KDS_TEST_IDS } from "@/lib/kitchen/multi-station-kds-p2-90-policy";
import type { MultiStationKdsPilotSnapshot } from "@/services/kitchen/multi-station-kds-p2-90-service";

const STATION_ICONS = [Flame, UtensilsCrossed, Salad, GlassWater, ChefHat, Package] as const;

/** Blueprint P2-90 — multi-station KDS pilot panel. */
export function MultiStationKdsPanel({ snapshot }: { snapshot: MultiStationKdsPilotSnapshot }) {
  const loadByName = new Map(snapshot.stations.map((row) => [row.station.toLowerCase(), row]));

  return (
    <div className="space-y-8" data-testid={MULTI_STATION_KDS_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {MULTI_STATION_KDS_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{MULTI_STATION_KDS_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {MULTI_STATION_KDS_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.routedItemCount} active routed item(s)
          {snapshot.bottleneckStation ? ` · bottleneck: ${snapshot.bottleneckStation}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MULTI_STATION_KDS_STATIONS.map((station, index) => {
          const Icon = STATION_ICONS[index] ?? ChefHat;
          const live = loadByName.get(station.label.toLowerCase());
          return (
            <Card
              key={station.id}
              className="border-border/80 shadow-sm"
              data-testid={MULTI_STATION_KDS_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{station.label}</CardTitle>
                  <CardDescription className="mt-1">
                    {station.foodType} · keywords: {station.keywords}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Queued</span>
                  <span>{live?.queuedItems ?? 0}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">In progress</span>
                  <span>{live?.inProgressItems ?? 0}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Overdue</span>
                  <span>{live?.overdueItems ?? 0}</span>
                </div>
                {live?.isBottleneck ? (
                  <Badge variant="outline" className="mt-1">
                    Bottleneck
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {MULTI_STATION_KDS_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
