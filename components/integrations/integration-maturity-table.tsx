import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IntegrationMaturityTier } from "@/lib/integrations/integration-maturity-types";
import type { PlatformIntegrationAggregateRow } from "@/services/platform/platform-integrations-service";

function tierBadgeClass(tier: IntegrationMaturityTier): string {
  switch (tier) {
    case "LIVE":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-100";
    case "BETA":
    case "SETUP_READY":
      return "border-amber-400/40 bg-amber-400/10 text-amber-100";
    case "PARTNER_ACCESS_REQUIRED":
    case "PARTIAL":
      return "border-orange-400/40 bg-orange-400/10 text-orange-100";
    case "ROADMAP":
    case "NOT_AVAILABLE":
    case "DEV_ONLY":
    default:
      return "border-zinc-600 bg-zinc-800 text-zinc-200";
  }
}

export function IntegrationMaturityTable({
  rows,
  variant = "workspace",
}: {
  rows: PlatformIntegrationAggregateRow[];
  variant?: "workspace" | "platform";
}) {
  const isPlatform = variant === "platform";
  const cellMuted = isPlatform ? "text-zinc-400" : "text-muted-foreground";
  const cell = isPlatform ? "text-zinc-200" : "";

  return (
    <Table>
      <TableHeader>
        <TableRow className={isPlatform ? "border-zinc-800 hover:bg-transparent" : ""}>
          <TableHead className={cellMuted}>Provider</TableHead>
          <TableHead className={cellMuted}>Maturity</TableHead>
          <TableHead className={cellMuted}>Workspaces</TableHead>
          <TableHead className={cellMuted}>Connections</TableHead>
          <TableHead className={cellMuted}>Last sync</TableHead>
          <TableHead className={cellMuted}>Last error (sanitized)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.provider} className={isPlatform ? "border-zinc-800" : ""}>
            <TableCell className={cell}>
              <div className="font-medium">{r.label}</div>
              <p className={`mt-1 text-xs ${cellMuted}`}>{r.integrationHonestyNote}</p>
            </TableCell>
            <TableCell className={cell}>
              <Badge variant="outline" className={`rounded-full text-[10px] font-normal ${tierBadgeClass(r.maturity)}`}>
                {r.maturity.replace(/_/g, " ")}
              </Badge>
            </TableCell>
            <TableCell className={`tabular-nums ${cell}`}>{r.workspaceCount}</TableCell>
            <TableCell className={`text-xs ${cell}`}>
              {r.connectionCount} total · {r.connectedCount} connected · {r.errorCount} errors
            </TableCell>
            <TableCell className={`text-xs ${cellMuted}`}>
              {r.lastSyncAt ? r.lastSyncAt.toISOString().slice(0, 19) : "—"}
            </TableCell>
            <TableCell className={`max-w-[280px] truncate text-xs ${cellMuted}`}>
              <span>{r.lastErrorSample ?? "—"}</span>
              {r.lastErrorSampleRedacted ? (
                <span
                  className={`mt-0.5 block text-[10px] italic ${isPlatform ? "text-zinc-500" : "text-muted-foreground"}`}
                >
                  Sensitive details redacted
                </span>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function IntegrationHealthDocLink({ className }: { className?: string }) {
  return (
    <Link href="/help/getting-started" className={className ?? "text-xs text-amber-200/90 hover:underline"}>
      Setup checklist (docs)
    </Link>
  );
}
