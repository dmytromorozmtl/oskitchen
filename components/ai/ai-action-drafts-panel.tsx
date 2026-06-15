import Link from "next/link";
import { Calendar, FileText, ShoppingCart, TrendingDown, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_ACTION_DRAFTS_P2_106_CAPABILITIES,
  AI_ACTION_DRAFTS_P2_106_EYEBROW,
  AI_ACTION_DRAFTS_P2_106_HEADLINE,
  AI_ACTION_DRAFTS_P2_106_OPERATOR_LINKS,
  AI_ACTION_DRAFTS_P2_106_SUBLINE,
} from "@/lib/ai/ai-action-drafts-p2-106-content";
import { AI_ACTION_DRAFTS_P2_106_TEST_IDS } from "@/lib/ai/ai-action-drafts-p2-106-policy";
import type { AiActionDraftsSnapshot } from "@/services/ai/ai-action-drafts-p2-106-service";

const CAPABILITY_ICONS = [ShoppingCart, TrendingDown, FileText] as const;

const DRAFT_TYPE_ICONS = {
  create_po: ShoppingCart,
  draft_schedule: Calendar,
  flag_low_margin: TrendingDown,
  commission_spike: Zap,
  daily_briefing: FileText,
} as const;

const STATUS_VARIANT = {
  NEEDS_APPROVAL: "default" as const,
  DRAFT: "secondary" as const,
  APPROVED: "default" as const,
  EXECUTED: "secondary" as const,
  REJECTED: "destructive" as const,
  CANCELLED: "outline" as const,
};

/** Blueprint P2-106 — AI action drafts panel. */
export function AiActionDraftsPanel({ snapshot }: { snapshot: AiActionDraftsSnapshot }) {
  return (
    <div className="space-y-8" data-testid={AI_ACTION_DRAFTS_P2_106_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {AI_ACTION_DRAFTS_P2_106_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{AI_ACTION_DRAFTS_P2_106_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {AI_ACTION_DRAFTS_P2_106_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live copilot drafts"} ·{" "}
          {snapshot.draftTypeCount} draft types · {snapshot.pendingApprovalCount} pending · policy{" "}
          {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Purchasing & schedule</CardDescription>
            <CardTitle className="text-2xl">{snapshot.purchasingScheduleCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Margin & commission</CardDescription>
            <CardTitle className="text-2xl">{snapshot.marginCommissionCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Daily briefing</CardDescription>
            <CardTitle className="text-2xl">{snapshot.dailyBriefingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {AI_ACTION_DRAFTS_P2_106_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? FileText;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={AI_ACTION_DRAFTS_P2_106_TEST_IDS[index + 1]}
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

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Draft type templates</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.templates.map((template) => {
            const Icon = DRAFT_TYPE_ICONS[template.draftType] ?? FileText;
            return (
              <Card key={template.draftType} className="border-border/80 shadow-sm">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 py-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <CardTitle className="text-sm">{template.label}</CardTitle>
                    <CardDescription className="mt-1 text-xs">{template.description}</CardDescription>
                    {template.requiresApproval && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Needs approval
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {[...snapshot.purchasingScheduleDrafts, ...snapshot.marginCommissionDrafts, ...snapshot.dailyBriefingDrafts].length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recent drafts</h3>
          <div className="grid gap-2">
            {[
              ...snapshot.purchasingScheduleDrafts,
              ...snapshot.marginCommissionDrafts,
              ...snapshot.dailyBriefingDrafts,
            ]
              .slice(0, 6)
              .map((row) => (
                <Card key={row.id} className="border-border/80 shadow-sm">
                  <CardHeader className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm">
                        {row.label}: {row.title}
                      </CardTitle>
                      <Badge variant={STATUS_VARIANT[row.status as keyof typeof STATUS_VARIANT] ?? "secondary"}>
                        {row.status}
                      </Badge>
                    </div>
                    <CardDescription>{row.summary}</CardDescription>
                    <CardContent className="px-0 pt-2 text-xs text-muted-foreground">
                      Source: {row.sourceReference}
                    </CardContent>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {AI_ACTION_DRAFTS_P2_106_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
