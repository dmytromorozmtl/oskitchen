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
import { getEnvironmentDiagnostics } from "@/services/developer/environment-service";
import { getPlatformHealthChecks } from "@/services/developer/platform-health-service";

export default async function DeveloperHealthPage() {
  await requireDeveloperCenterAccess();
  const [checks, env] = await Promise.all([getPlatformHealthChecks(), Promise.resolve(getEnvironmentDiagnostics())]);

  const grouped = new Map<string, (typeof env.rows)[number][]>();
  for (const row of env.rows) {
    const key = row.group;
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-8" id="top">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform health</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Operational probes and environment validation — never exposes secret values.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {checks.checks.map((c) => (
          <Card key={c.id} className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base">{c.label}</CardTitle>
                <CardDescription>{c.detail}</CardDescription>
              </div>
              <Badge variant={c.status === "operational" ? "secondary" : "destructive"} className="shrink-0 capitalize">
                {c.status.replace("_", " ")}
              </Badge>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card id="env" className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Environment diagnostics</CardTitle>
          <CardDescription>
            Grouped checks — statuses only (ok · missing · insecure · deprecated). Values are never shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {[...grouped.entries()].map(([group, rows]) => (
            <div key={group}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="font-mono text-xs">{row.key}</TableCell>
                      <TableCell className="capitalize">{row.status}</TableCell>
                      <TableCell className="max-w-md text-xs text-muted-foreground">{row.hint ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
