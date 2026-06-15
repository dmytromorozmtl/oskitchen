import Link from "next/link";
import { BookOpen, Calculator, CheckSquare, FileSpreadsheet, Landmark, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACCOUNTING_DEPTH_P3_149_CAPABILITIES,
  ACCOUNTING_DEPTH_P3_149_EYEBROW,
  ACCOUNTING_DEPTH_P3_149_OPERATOR_LINKS,
  ACCOUNTING_DEPTH_P3_149_SUBLINE,
} from "@/lib/accounting/accounting-depth-p3-149-content";
import {
  ACCOUNTING_DEPTH_P3_149_COMPETITOR,
  ACCOUNTING_DEPTH_P3_149_HEADLINE,
  ACCOUNTING_DEPTH_P3_149_IMPLEMENTATION_REF,
  ACCOUNTING_DEPTH_P3_149_POLICY_ID,
  ACCOUNTING_DEPTH_P3_149_ROUTE,
  ACCOUNTING_DEPTH_P3_149_TEST_IDS,
} from "@/lib/accounting/accounting-depth-p3-149-policy";

const CAPABILITY_ICONS = [BookOpen, FileSpreadsheet, Calculator, Landmark, CheckSquare, Receipt] as const;

/** Capability ids: chart_of_accounts · journal_entries · gl_depth_sync · pnl_reconciliation · period_close · ap_automation · testid accounting-depth-r365 */

/** Blueprint P3-149 — R365 parity accounting depth hub. */
export function AccountingDepthPanel() {
  return (
    <div className="space-y-8" data-testid={ACCOUNTING_DEPTH_P3_149_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full uppercase">
          {ACCOUNTING_DEPTH_P3_149_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {ACCOUNTING_DEPTH_P3_149_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {ACCOUNTING_DEPTH_P3_149_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          Competitor: {ACCOUNTING_DEPTH_P3_149_COMPETITOR} · implementation{" "}
          {ACCOUNTING_DEPTH_P3_149_IMPLEMENTATION_REF} · policy {ACCOUNTING_DEPTH_P3_149_POLICY_ID}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACCOUNTING_DEPTH_P3_149_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? BookOpen;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={capability.testId}
              data-capability-id={capability.id}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                </div>
                <CardDescription>{capability.r365Typical}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                  {capability.osKitchenStatus}
                </Badge>
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <Link href={capability.route}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {ACCOUNTING_DEPTH_P3_149_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      <p className="sr-only">Hub route {ACCOUNTING_DEPTH_P3_149_ROUTE}</p>
    </div>
  );
}
