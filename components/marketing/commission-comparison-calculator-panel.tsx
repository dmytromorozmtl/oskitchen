import Link from "next/link";
import { Calculator, LineChart, MessageSquare, Percent, PieChart, TrendingUp } from "lucide-react";

import { CommissionComparisonCalculator } from "@/components/marketing/commission-comparison-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  COMMISSION_COMPARISON_CALCULATOR_P3_148_EYEBROW,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURES,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_OPERATOR_LINKS,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_SUBLINE,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-content";
import {
  COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPETITOR,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_IMPLEMENTATION_REF,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_TEST_IDS,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-policy";

const FEATURE_ICONS = [PieChart, Percent, Calculator, TrendingUp, LineChart, MessageSquare] as const;

/** Feature ids: channel_mix · marketplace_benchmark · owned_channel_compare · annual_delta · live_commissions · commission_free_messaging · testid commission-comparison-chownow */

/** Blueprint P3-148 — ChowNow parity commission comparison hub. */
export function CommissionComparisonCalculatorPanel() {
  return (
    <div className="space-y-8" data-testid={COMMISSION_COMPARISON_CALCULATOR_P3_148_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full uppercase">
          {COMMISSION_COMPARISON_CALCULATOR_P3_148_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {COMMISSION_COMPARISON_CALCULATOR_P3_148_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          Competitor: {COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPETITOR} · implementation{" "}
          {COMMISSION_COMPARISON_CALCULATOR_P3_148_IMPLEMENTATION_REF} · policy{" "}
          {COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURES.map((feature, index) => {
          const Icon = FEATURE_ICONS[index] ?? Calculator;
          return (
            <Card
              key={feature.id}
              className="border-border/80 shadow-sm"
              data-testid={feature.testId}
              data-feature-id={feature.id}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">{feature.label}</CardTitle>
                </div>
                <CardDescription>{feature.chownowTypical}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                  {feature.osKitchenStatus}
                </Badge>
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <Link href={feature.route}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Interactive calculator</CardTitle>
          <CardDescription>
            Directional benchmark — reconcile against settlement statements. Full page at{" "}
            {COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommissionComparisonCalculator compact />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {COMMISSION_COMPARISON_CALCULATOR_P3_148_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      <p className="sr-only">
        Hub route {COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE} · public{" "}
        {COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE}
      </p>
    </div>
  );
}
