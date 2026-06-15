import Link from "next/link";
import { CalendarHeart, CreditCard, FileText, GitBranch, Share2, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATERING_CRM_P3_150_CAPABILITIES,
  CATERING_CRM_P3_150_EYEBROW,
  CATERING_CRM_P3_150_OPERATOR_LINKS,
  CATERING_CRM_P3_150_SUBLINE,
} from "@/lib/catering/catering-crm-p3-150-content";
import {
  CATERING_CRM_P3_150_COMPETITOR,
  CATERING_CRM_P3_150_HEADLINE,
  CATERING_CRM_P3_150_IMPLEMENTATION_REF,
  CATERING_CRM_P3_150_POLICY_ID,
  CATERING_CRM_P3_150_ROUTE,
  CATERING_CRM_P3_150_TEST_IDS,
} from "@/lib/catering/catering-crm-p3-150-policy";

const CAPABILITY_ICONS = [FileText, GitBranch, CreditCard, CalendarHeart, Share2, UtensilsCrossed] as const;

/** Capability ids: catering_quotes · quote_pipeline · deposit_checkout · event_sheets · public_proposals · quote_conversion · testid catering-crm-tripleseat */

/** Blueprint P3-150 — Tripleseat parity catering CRM hub. */
export function CateringCrmPanel() {
  return (
    <div className="space-y-8" data-testid={CATERING_CRM_P3_150_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full uppercase">
          {CATERING_CRM_P3_150_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{CATERING_CRM_P3_150_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {CATERING_CRM_P3_150_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          Competitor: {CATERING_CRM_P3_150_COMPETITOR} · implementation{" "}
          {CATERING_CRM_P3_150_IMPLEMENTATION_REF} · policy {CATERING_CRM_P3_150_POLICY_ID}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATERING_CRM_P3_150_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? FileText;
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
                <CardDescription>{capability.tripleseatTypical}</CardDescription>
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
        {CATERING_CRM_P3_150_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      <p className="sr-only">Hub route {CATERING_CRM_P3_150_ROUTE}</p>
    </div>
  );
}
