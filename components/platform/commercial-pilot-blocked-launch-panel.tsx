import Link from "next/link";
import { Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_STATUS_LABEL } from "@/lib/go-live/launch-stages";
import {
  COMMERCIAL_PILOT_BLOCKED_LAUNCHES_ANCHOR,
} from "@/lib/commercial/commercial-pilot-ops-go-live-bridge-era18-policy";
import {
  buildCommercialPilotOpsGoLiveBridgeRows,
  type CommercialPilotOpsGoLiveBridgeRow,
} from "@/lib/commercial/commercial-pilot-ops-go-live-bridge-era18";
import type { PlatformGoLiveProjectRow } from "@/lib/go-live/platform-go-live-focus-era18";
import { PLATFORM_GO_LIVE_ROUTE } from "@/lib/go-live/platform-go-live-focus-era18-policy";

function linkClass(tone: "urgent" | "normal"): string {
  return tone === "urgent"
    ? "font-medium text-amber-300 underline-offset-2 hover:underline"
    : "text-primary underline-offset-2 hover:underline";
}

export function CommercialPilotBlockedLaunchPanel(props: {
  projects: readonly PlatformGoLiveProjectRow[];
}) {
  const rows = buildCommercialPilotOpsGoLiveBridgeRows(props.projects);

  if (rows.length === 0) return null;

  return (
    <Card
      id={COMMERCIAL_PILOT_BLOCKED_LAUNCHES_ANCHOR.slice(1)}
      className="scroll-mt-24 border-rose-900/50 bg-rose-950/20"
      data-testid="commercial-pilot-blocked-launch-panel"
    >
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-white">
          <Rocket className="h-5 w-5 text-rose-400" aria-hidden />
          Blocked pilot launch projects
          <Badge variant="destructive" className="rounded-full">
            {rows.length} tenant{rows.length === 1 ? "" : "s"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Cross-link from GO/NO-GO evidence to tenant workspace go-live — open workspace sections to
          review launch validation while platform gates remain incomplete.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="py-2 pr-4 font-medium">Tenant</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Blocker</th>
              <th className="py-2 pr-4 font-medium">Readiness</th>
              <th className="py-2 font-medium">Next</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <BlockedLaunchRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-zinc-500">
          Full cross-tenant queue:{" "}
          <Link href={PLATFORM_GO_LIVE_ROUTE} className="text-amber-200/90 underline-offset-2 hover:underline">
            Platform go-live
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function BlockedLaunchRow(props: { row: CommercialPilotOpsGoLiveBridgeRow }) {
  const { row } = props;
  return (
    <tr
      className="border-b border-zinc-800/60"
      data-testid={`commercial-pilot-blocked-launch-${row.id}`}
    >
      <td className="py-2 pr-4">
        <p className="font-medium text-zinc-200">{row.label}</p>
        <p className="font-mono text-xs text-zinc-500">{row.ownerEmail}</p>
      </td>
      <td className="py-2 pr-4">
        <Badge variant="destructive" className="rounded-full text-[10px]">
          {LAUNCH_STATUS_LABEL[row.status]}
        </Badge>
      </td>
      <td className="max-w-xs py-2 pr-4 text-xs text-zinc-400">{row.blockerReason}</td>
      <td className="py-2 pr-4 tabular-nums text-zinc-300">{row.readinessScore}%</td>
      <td className="py-2">
        <div className="flex flex-col items-start gap-1">
          <Link
            href={row.workspaceProjectHref}
            className={`text-xs ${linkClass(row.tone)}`}
            data-testid={`commercial-pilot-blocked-workspace-${row.id}`}
          >
            Open workspace go-live
          </Link>
          <Link href={row.platformGoLiveHref} className="text-xs text-zinc-500 underline-offset-2 hover:underline">
            Launch queue
          </Link>
        </div>
      </td>
    </tr>
  );
}
