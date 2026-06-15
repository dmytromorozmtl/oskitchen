import { Badge } from "@/components/ui/badge";
import type { PlatformIntegrationAggregateRow } from "@/services/platform/platform-integrations-service";

export function IntegrationMaturityCard({ row }: { row: PlatformIntegrationAggregateRow }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{row.label}</h3>
        <Badge variant="outline" className="rounded-full text-[10px] font-normal text-zinc-100">
          {row.maturity.replace(/_/g, " ")}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-zinc-400">{row.worksSummary}</p>
      <p className="mt-1 text-xs text-amber-100/90">{row.gapsSummary}</p>
      <dl className="mt-3 grid gap-1 text-xs text-zinc-500">
        <div className="flex justify-between gap-2">
          <dt>Workspaces</dt>
          <dd className="font-mono text-zinc-300">{row.workspaceCount}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Connections</dt>
          <dd className="font-mono text-zinc-300">{row.connectionCount}</dd>
        </div>
      </dl>
    </div>
  );
}
