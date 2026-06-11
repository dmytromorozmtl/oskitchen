import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { listDeveloperAuditLogs } from "@/services/developer/logging-service";
import { formatDistanceToNow } from "date-fns";

export default async function DeveloperLogsPage() {
  const ctx = await requireDeveloperCenterAccess();
  const rows = await listDeveloperAuditLogs({
    userId: ctx.userId,
    platformSuper: ctx.platformSuper,
    take: 120,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Logs & tracing</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Developer-scoped audit entries. Payloads and tokens are never shown in this view.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent developer audit</CardTitle>
          <CardDescription>Action · entity · route · age</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Route</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDistanceToNow(r.createdAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {r.severity ? <Badge variant="outline">{r.severity}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate font-mono text-xs">{r.action}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {r.entityType}
                    {r.entityLabel ? ` · ${r.entityLabel}` : ""}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{r.route ?? "—"}</TableCell>
                </TableRow>
              ))}
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No developer audit entries yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
