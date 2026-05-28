import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_STATUS_LABEL, RISK_LEVEL_LABEL } from "@/lib/go-live/launch-stages";
import { PLATFORM_GO_LIVE_PROJECTS_ANCHOR } from "@/lib/go-live/platform-go-live-focus-era18-policy";
import {
  isPlatformGoLiveProjectActive,
  platformGoLiveProjectLabel,
  resolvePlatformGoLiveRowNextAction,
  type PlatformGoLiveCommandCenterModel,
} from "@/lib/go-live/platform-go-live-focus-era18";

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  if (status === "BLOCKED" || status === "ROLLBACK_MODE") return "destructive";
  if (status === "LIVE" || status === "COMPLETED") return "default";
  if (status === "READY" || status === "APPROVED") return "secondary";
  return "outline";
}

export function PlatformGoLiveProjectsPanel(props: { model: PlatformGoLiveCommandCenterModel }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Active launches", props.model.kpis.activeLaunchProjects],
            ["Launch ≤14 days", props.model.kpis.launchingWithin14Days],
            ["High/critical risk", props.model.kpis.highRiskProjects],
            ["Open incidents", props.model.kpis.openIncidents],
          ] as const
        ).map(([label, value]) => (
          <Card key={label} className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-500">{label}</CardDescription>
              <CardTitle className="text-2xl text-white">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card
        id={PLATFORM_GO_LIVE_PROJECTS_ANCHOR.slice(1)}
        className="scroll-mt-24 border-zinc-800 bg-zinc-900/60"
        data-testid="platform-go-live-projects-panel"
      >
        <CardHeader>
          <CardTitle className="text-white">Cross-tenant launch projects</CardTitle>
          <CardDescription className="text-zinc-400">
            Latest 50 projects sorted by launch date and readiness. Open workspace to support tenant
            go-live validation — platform view does not bypass tenant RBAC.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {props.model.projects.length === 0 ? (
            <p className="text-sm text-zinc-500">No go-live projects yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 pr-4 font-medium">Tenant</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Readiness</th>
                  <th className="py-2 pr-4 font-medium">Risk</th>
                  <th className="py-2 pr-4 font-medium">Launch</th>
                  <th className="py-2 pr-4 font-medium">Incidents</th>
                  <th className="py-2 font-medium">Next</th>
                </tr>
              </thead>
              <tbody>
                {props.model.projects.map((row) => {
                  const nextAction = resolvePlatformGoLiveRowNextAction(row);
                  const active = isPlatformGoLiveProjectActive(row.status);
                  return (
                    <tr
                      key={row.id}
                      id={`go-live-project-${row.id}`}
                      className="scroll-mt-24 border-b border-zinc-800/60"
                      data-testid={`platform-go-live-project-${row.id}`}
                    >
                      <td className="py-2 pr-4">
                        <p className="font-medium text-zinc-200">{platformGoLiveProjectLabel(row)}</p>
                        <p className="font-mono text-xs text-zinc-500">{row.ownerEmail}</p>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={statusVariant(row.status)} className="rounded-full text-[10px]">
                          {LAUNCH_STATUS_LABEL[row.status]}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-zinc-300">
                        {row.readinessScore}%
                        {!active ? (
                          <span className="ml-1 text-xs text-zinc-600">· terminal</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-4 text-zinc-400">{RISK_LEVEL_LABEL[row.riskLevel]}</td>
                      <td className="py-2 pr-4 text-zinc-400">
                        {row.launchDate ? row.launchDate.toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2 pr-4 text-zinc-400">{row.openIncidentCount}</td>
                      <td className="py-2">
                        <Link
                          href={nextAction.href}
                          data-testid={`platform-go-live-next-${row.id}`}
                          className={
                            nextAction.tone === "urgent"
                              ? "font-medium text-amber-300 underline-offset-2 hover:underline"
                              : "text-primary underline-offset-2 hover:underline"
                          }
                        >
                          {nextAction.label}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
