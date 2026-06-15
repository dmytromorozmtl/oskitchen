import Link from "next/link";
import { CheckCircle2, Link2, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES,
  AI_CONFIDENCE_LABELS_P2_107_EYEBROW,
  AI_CONFIDENCE_LABELS_P2_107_HEADLINE,
  AI_CONFIDENCE_LABELS_P2_107_OPERATOR_LINKS,
  AI_CONFIDENCE_LABELS_P2_107_SUBLINE,
} from "@/lib/ai/ai-confidence-labels-p2-107-content";
import { AI_CONFIDENCE_LABELS_P2_107_TEST_IDS } from "@/lib/ai/ai-confidence-labels-p2-107-policy";
import type { AiConfidenceLabelsSnapshot } from "@/services/ai/ai-confidence-labels-p2-107-service";

const CAPABILITY_ICONS = [CheckCircle2, ShieldAlert, Link2] as const;

/** Blueprint P2-107 — AI confidence labels panel. */
export function AiConfidenceLabelsPanel({ snapshot }: { snapshot: AiConfidenceLabelsSnapshot }) {
  return (
    <div className="space-y-8" data-testid={AI_CONFIDENCE_LABELS_P2_107_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {AI_CONFIDENCE_LABELS_P2_107_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {AI_CONFIDENCE_LABELS_P2_107_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {AI_CONFIDENCE_LABELS_P2_107_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live AI outputs"} ·{" "}
          {snapshot.needsApprovalCount} need approval · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>High</CardDescription>
            <CardTitle className="text-2xl">{snapshot.highCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Medium</CardDescription>
            <CardTitle className="text-2xl">{snapshot.mediumCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Low</CardDescription>
            <CardTitle className="text-2xl">{snapshot.lowCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Needs approval</CardDescription>
            <CardTitle className="text-2xl">{snapshot.needsApprovalCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? CheckCircle2;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={AI_CONFIDENCE_LABELS_P2_107_TEST_IDS[index + 1]}
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

      {snapshot.labels.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Labeled AI outputs</h3>
          <div className="grid gap-2">
            {snapshot.labels.map((row) => (
              <Card key={row.id} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      {row.module}: {row.outputLabel}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={row.badgeVariant}>{row.tierLabel}</Badge>
                      {row.needsApprovalLabel && (
                        <Badge variant="outline">{row.needsApprovalLabel}</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Score {(row.confidenceScore * 100).toFixed(0)}% · {row.sourceDescription}
                  </CardDescription>
                  <CardContent className="px-0 pt-2 font-mono text-xs text-muted-foreground">
                    {row.sourceReference}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {AI_CONFIDENCE_LABELS_P2_107_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
