import Link from "next/link";
import { Route } from "lucide-react";

import { toggleKdsRoutingRuleAction } from "@/actions/kitchen/routing-rules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { KdsStationRoutingRulesModel } from "@/services/kitchen/kds-station-routing-rules-service";

function kindBadge(kind: string) {
  return (
    <Badge variant="outline" className="rounded-full text-[10px] font-normal capitalize">
      {kind}
    </Badge>
  );
}

export function KdsStationRoutingRulesPanel({ model }: { model: KdsStationRoutingRulesModel }) {
  const { rules, preview, stationNames, enabledRuleCount, defaultRuleCount } = model;

  return (
    <div className="space-y-6" data-testid="kds-station-routing-rules-panel">
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          {enabledRuleCount}/{rules.length} rules enabled
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {stationNames.length} KDS stations
        </Badge>
        <Badge variant="outline" className="rounded-full">
          NCR Aloha parity: product → category → keyword → default
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Routing rules</CardTitle>
          <CardDescription>
            Configurable station assignment — evaluated before legacy keyword routing. Default{" "}
            {defaultRuleCount} rules ship enabled; toggle per line for pilot kitchens.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Toggle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} data-testid="kds-routing-rule-row">
                  <TableCell className="font-medium">{rule.label}</TableCell>
                  <TableCell>{kindBadge(rule.kind)}</TableCell>
                  <TableCell className="font-mono text-xs">{rule.match}</TableCell>
                  <TableCell>{rule.stationName}</TableCell>
                  <TableCell className="tabular-nums">{rule.priority}</TableCell>
                  <TableCell>
                    <Badge
                      variant={rule.enabled ? "secondary" : "outline"}
                      className="rounded-full text-[10px]"
                    >
                      {rule.enabled ? "enabled" : "disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleKdsRoutingRuleAction}>
                      <input type="hidden" name="ruleId" value={rule.id} />
                      <input type="hidden" name="enabled" value={rule.enabled ? "false" : "true"} />
                      <Button type="submit" size="sm" variant="ghost" className="rounded-full">
                        {rule.enabled ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live routing preview</CardTitle>
          <CardDescription>
            Sample menu items routed through current rules — matches production KDS assignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((row) => (
                <TableRow key={row.title} data-testid="kds-routing-preview-row">
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.category ?? "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Route className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      {row.station}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        POS → KDS enqueue uses these rules for work item station assignment. Explicit station
        overrides on tickets always win. Configure production stations under Settings → Operations.
      </p>

      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link href="/dashboard/kitchen/production">Open production view</Link>
      </Button>
    </div>
  );
}
