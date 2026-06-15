import Link from "next/link";
import { ArrowRight, FileInput, GitMerge, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AP_AUTOMATION_P2_104_CAPABILITIES,
  AP_AUTOMATION_P2_104_EYEBROW,
  AP_AUTOMATION_P2_104_HEADLINE,
  AP_AUTOMATION_P2_104_OPERATOR_LINKS,
  AP_AUTOMATION_P2_104_SUBLINE,
} from "@/lib/accounting/ap-automation-p2-104-content";
import { AP_AUTOMATION_P2_104_TEST_IDS } from "@/lib/accounting/ap-automation-p2-104-policy";
import type { ApAutomationSnapshot } from "@/services/accounting/ap-automation-p2-104-service";

const CAPABILITY_ICONS = [FileInput, GitMerge, Wallet] as const;

const MATCH_BADGE = {
  unmatched: "destructive" as const,
  variance: "default" as const,
  matched: "secondary" as const,
};

/** Blueprint P2-104 — AP automation workflow panel. */
export function ApAutomationPanel({ snapshot }: { snapshot: ApAutomationSnapshot }) {
  return (
    <div className="space-y-8" data-testid={AP_AUTOMATION_P2_104_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {AP_AUTOMATION_P2_104_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{AP_AUTOMATION_P2_104_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {AP_AUTOMATION_P2_104_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live AP data"} · pending $
          {snapshot.pendingAmount.toFixed(2)} · approved ${snapshot.approvedAmount.toFixed(2)} ·
          policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {snapshot.stageSummaries
          .filter((s) => s.count > 0)
          .map((stage) => (
            <Card key={stage.stage} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>{stage.label}</CardDescription>
                <CardTitle className="text-2xl">{stage.count}</CardTitle>
                <CardDescription>${stage.totalAmount.toFixed(2)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {AP_AUTOMATION_P2_104_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? FileInput;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={AP_AUTOMATION_P2_104_TEST_IDS[index + 1]}
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

      {snapshot.invoiceIntake.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Invoice intake queue</h3>
          <div className="grid gap-2">
            {snapshot.invoiceIntake.slice(0, 6).map((row) => (
              <Card key={row.invoiceId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      {row.invoiceNumber} · {row.supplierName}
                    </CardTitle>
                    <Badge variant="outline">{row.source.toUpperCase()}</Badge>
                  </div>
                  <CardDescription>
                    ${row.totalAmount.toFixed(2)} · {row.receivedAt} · {row.status}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {snapshot.poMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">PO matching</h3>
          <div className="grid gap-2">
            {snapshot.poMatches.slice(0, 6).map((row) => (
              <Card key={row.invoiceId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      {row.invoiceNumber} → {row.poNumber ?? "Unmatched"}
                    </CardTitle>
                    <Badge variant={MATCH_BADGE[row.matchStatus]}>{row.matchStatus}</Badge>
                  </div>
                  <CardDescription>{row.recommendation}</CardDescription>
                  {row.varianceAmount > 0 && (
                    <CardContent className="px-0 pt-2 text-xs text-muted-foreground">
                      Variance: ${row.varianceAmount.toFixed(2)}
                    </CardContent>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {snapshot.paymentRelease.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Payment release</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {snapshot.paymentRelease.slice(0, 6).map((row) => (
              <Card key={row.invoiceId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      {row.invoiceNumber} · {row.supplierName}
                    </CardTitle>
                    <Badge variant={row.status === "paid" ? "secondary" : "default"}>
                      {row.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    ${row.amount.toFixed(2)}
                    {row.dueDate ? ` · due ${row.dueDate}` : ""}
                    {row.daysUntilDue != null ? ` (${row.daysUntilDue}d)` : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowRight className="h-4 w-4" aria-hidden />
        Invoice → PO match → Approve → Payment
      </div>

      <div className="flex flex-wrap gap-2">
        {AP_AUTOMATION_P2_104_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
