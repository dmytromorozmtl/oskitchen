"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { handoffProductionWorkItemFormAction } from "@/actions/production";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductionWorkItemDTO } from "@/components/dashboard/production-command-center";

export function StationHandoffPanel({
  workItems,
  stations,
}: {
  workItems: ProductionWorkItemDTO[];
  stations: string[];
}) {
  const router = useRouter();
  const orderedStations = stations.length ? stations : ["Prep", "Cook", "Finish", "Pack"];

  async function handoff(workItemId: string, toStation: string) {
    const fd = new FormData();
    fd.set("workItemId", workItemId);
    fd.set("toStation", toStation);
    await handoffProductionWorkItemFormAction(fd);
    router.refresh();
  }

  const handoffItems = workItems.filter((w) => w.status === "HANDOFF" || w.status === "READY");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Multi-station handoff
        </CardTitle>
        <CardDescription>
          Move work between stations — sets status to HANDOFF and updates the target station.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {orderedStations.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-1">
              <Badge variant="outline" className="rounded-full">
                {s}
              </Badge>
              {i < orderedStations.length - 1 ? <ChevronRight className="h-3 w-3" /> : null}
            </span>
          ))}
        </div>
        {handoffItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items ready for handoff.</p>
        ) : (
          <ul className="space-y-3">
            {handoffItems.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{w.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.station ?? "Unassigned"} · {w.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {orderedStations
                    .filter((s) => s !== (w.station ?? ""))
                    .map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => void handoff(w.id, s)}
                      >
                        → {s}
                      </Button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
