import Link from "next/link";
import { CheckCircle2, ClipboardList, Play, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_APPROVAL_WORKFLOW_P2_109_EYEBROW,
  AI_APPROVAL_WORKFLOW_P2_109_HEADLINE,
  AI_APPROVAL_WORKFLOW_P2_109_OPERATOR_LINKS,
  AI_APPROVAL_WORKFLOW_P2_109_STAGES,
  AI_APPROVAL_WORKFLOW_P2_109_SUBLINE,
} from "@/lib/ai/ai-approval-workflow-p2-109-content";
import { AI_APPROVAL_WORKFLOW_P2_109_TEST_IDS } from "@/lib/ai/ai-approval-workflow-p2-109-policy";
import type { AiApprovalWorkflowSnapshot } from "@/services/ai/ai-approval-workflow-p2-109-service";

const STAGE_ICONS = [Sparkles, CheckCircle2, Play, ClipboardList] as const;

/** Blueprint P2-109 — AI approval workflow panel. */
export function AiApprovalWorkflowPanel({ snapshot }: { snapshot: AiApprovalWorkflowSnapshot }) {
  const uniqueDrafts = [...new Set(snapshot.steps.map((s) => s.draftId))];

  return (
    <div className="space-y-8" data-testid={AI_APPROVAL_WORKFLOW_P2_109_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {AI_APPROVAL_WORKFLOW_P2_109_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {AI_APPROVAL_WORKFLOW_P2_109_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {AI_APPROVAL_WORKFLOW_P2_109_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live drafts"} · {uniqueDrafts.length}{" "}
          drafts · {snapshot.auditEventCount} audit events · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{snapshot.pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl">{snapshot.approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Executed</CardDescription>
            <CardTitle className="text-2xl">{snapshot.executedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Audit events</CardDescription>
            <CardTitle className="text-2xl">{snapshot.auditEventCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {AI_APPROVAL_WORKFLOW_P2_109_STAGES.map((stage, index) => {
          const Icon = STAGE_ICONS[index] ?? Sparkles;
          const completedSteps = snapshot.steps.filter(
            (s) => s.stageId === stage.id && s.completed,
          ).length;
          return (
            <Card
              key={stage.id}
              className="border-border/80 shadow-sm"
              data-testid={AI_APPROVAL_WORKFLOW_P2_109_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{stage.label}</CardTitle>
                  <CardDescription className="mt-1">{stage.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-mono text-xs text-muted-foreground">{stage.module}</p>
                <p className="text-xs text-muted-foreground">
                  Audit: {stage.auditEvent} · {completedSteps} completed
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {snapshot.auditTrail.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recent audit trail</h3>
          <div className="grid gap-2">
            {snapshot.auditTrail.slice(0, 8).map((entry) => (
              <Card key={entry.id} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-mono">{entry.eventType}</CardTitle>
                    <Badge variant="outline">{entry.actor}</Badge>
                  </div>
                  <CardDescription>
                    {entry.summary}
                    {entry.draftId ? ` · draft ${entry.draftId.slice(0, 8)}…` : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {AI_APPROVAL_WORKFLOW_P2_109_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
