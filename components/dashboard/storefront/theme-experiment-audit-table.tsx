import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StorefrontExperimentAuditRow } from "@/services/storefront/storefront-experiment-audit-list";

function formatAction(action: string) {
  return action.replace("storefront.experiment.", "");
}

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ThemeExperimentAuditTable({ rows }: { rows: StorefrontExperimentAuditRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No experiment audit events yet (publish, apply winner, edge retry, DLQ, SRM warn).
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Action</TableHead>
            <TableHead className="text-xs">Actor</TableHead>
            <TableHead className="text-xs">Source</TableHead>
            <TableHead className="text-xs text-right">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {formatAction(row.action)}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {row.actorEmail ?? "system"}
              </TableCell>
              <TableCell className="font-mono text-[10px]">{row.source ?? "—"}</TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {formatWhen(row.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
