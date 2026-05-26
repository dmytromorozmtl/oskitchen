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
import { getWebhookMonitorSummary } from "@/services/developer/webhook-monitor-service";
import { formatDistanceToNow } from "date-fns";

export default async function DeveloperWebhooksPage() {
  const ctx = await requireDeveloperCenterAccess();
  const webhooks = await getWebhookMonitorSummary(ctx.userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Webhook monitor</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Scoped to your workspace. Payloads are not rendered here — open the integration webhook log for safe
          inspection.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>24h deliveries</CardDescription>
            <CardTitle className="text-2xl">{webhooks.total24h}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>24h failures</CardDescription>
            <CardTitle className="text-2xl text-destructive">{webhooks.failed24h}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{webhooks.pending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Provider · topic · pipeline status · age</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.recent.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.provider}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{r.topic}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {r.pipelineStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.signatureValid ? "valid" : "invalid"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(r.receivedAt, { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {!webhooks.recent.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No recent webhook rows for this workspace.
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
