import Link from "next/link";
import { DollarSign, Receipt, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SALES_BY_STAFF_P2_112_CAPABILITIES,
  SALES_BY_STAFF_P2_112_EYEBROW,
  SALES_BY_STAFF_P2_112_HEADLINE,
  SALES_BY_STAFF_P2_112_OPERATOR_LINKS,
  SALES_BY_STAFF_P2_112_SUBLINE,
} from "@/lib/analytics/sales-by-staff-p2-112-content";
import { SALES_BY_STAFF_P2_112_TEST_IDS } from "@/lib/analytics/sales-by-staff-p2-112-policy";
import type { SalesByStaffSnapshot } from "@/services/analytics/sales-by-staff-p2-112-service";

const CAPABILITY_ICONS = [DollarSign, Receipt, Trophy] as const;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Blueprint P2-112 — sales-by-staff analytics panel. */
export function SalesByStaffPanel({ snapshot }: { snapshot: SalesByStaffSnapshot }) {
  return (
    <div className="space-y-8" data-testid={SALES_BY_STAFF_P2_112_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {SALES_BY_STAFF_P2_112_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{SALES_BY_STAFF_P2_112_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {SALES_BY_STAFF_P2_112_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live POS data"} · {snapshot.staffCount}{" "}
          servers · {snapshot.totalOrders} orders · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total sales</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(snapshot.totalSales)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Overall avg check</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(snapshot.overallAvgCheck)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Top server</CardDescription>
            <CardTitle className="text-lg">{snapshot.topServerName ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Top server sales</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(snapshot.topServerSales)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SALES_BY_STAFF_P2_112_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? DollarSign;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={SALES_BY_STAFF_P2_112_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {snapshot.staffRows.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Server leaderboard</h3>
          <div className="grid gap-2">
            {snapshot.staffRows.map((row) => (
              <Card key={row.staffId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      #{row.rank} {row.staffName}
                    </CardTitle>
                    <Badge variant="outline">{formatMoney(row.totalSales)}</Badge>
                  </div>
                  <CardDescription>
                    {row.orderCount} orders · avg check {formatMoney(row.avgCheck)} ·{" "}
                    {row.shiftCount} shift{row.shiftCount === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {SALES_BY_STAFF_P2_112_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
