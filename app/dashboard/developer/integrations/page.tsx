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
import { listIntegrationHealthCards } from "@/services/developer/integration-health-service";
import { formatDistanceToNow } from "date-fns";

export default async function DeveloperIntegrationsPage() {
  const ctx = await requireDeveloperCenterAccess();
  const cards = await listIntegrationHealthCards(ctx.userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integration health</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Connection posture without exposing tokens or encrypted payloads.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
          <CardDescription>Provider · status · last sync · webhook secret present</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last sync</TableHead>
                <TableHead>Webhook secret</TableHead>
                <TableHead>Last error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.provider}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.lastSyncAt ? formatDistanceToNow(c.lastSyncAt, { addSuffix: true }) : "—"}
                  </TableCell>
                  <TableCell>{c.hasWebhookSecret ? "configured" : "missing"}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {c.lastError ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {!cards.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No integration connections yet.
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
