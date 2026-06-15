"use client";

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
import type { MutationRegistryDashboardSnapshot } from "@/services/platform/mutation-registry-dashboard-service";

function riskBadge(risk: string) {
  const variant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    critical: "destructive",
  };
  return <Badge variant={variant[risk] ?? "outline"}>{risk}</Badge>;
}

export function MutationRegistryDashboardPanel({
  snapshot,
}: {
  snapshot: MutationRegistryDashboardSnapshot;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total entries</CardDescription>
            <CardTitle className="text-3xl">{snapshot.counts.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Domain helpers</CardDescription>
            <CardTitle className="text-3xl">{snapshot.counts.domainHelpers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Action operations</CardDescription>
            <CardTitle className="text-3xl">{snapshot.counts.actionOperations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Linter violations</CardDescription>
            <CardTitle className="text-3xl">{snapshot.linter.violations}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {snapshot.linter.governedFiles}/{snapshot.linter.scannedFiles} action files governed
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk breakdown (action operations)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.entries(snapshot.riskBreakdown).map(([risk, count]) => (
            <span key={risk} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm">
              {riskBadge(risk)}
              <span>{count}</span>
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domains</CardTitle>
          <CardDescription>Governed mutations grouped by product domain</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead className="text-right">Helpers</TableHead>
                <TableHead className="text-right">Operations</TableHead>
                <TableHead className="text-right">Critical</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.domainSummaries.map((row) => (
                <TableRow key={row.domain}>
                  <TableCell className="font-mono text-xs">{row.domain}</TableCell>
                  <TableCell className="text-right">{row.helperCount}</TableCell>
                  <TableCell className="text-right">{row.operationCount}</TableCell>
                  <TableCell className="text-right">{row.criticalCount}</TableCell>
                  <TableCell className="text-right font-medium">{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
