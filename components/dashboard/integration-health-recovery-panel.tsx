import Link from "next/link";
import { ArrowRight, ClipboardCheck, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_RECOVERY_ANCHOR,
} from "@/lib/integrations/integration-health-recovery-era19-policy";
import type {
  IntegrationHealthRecoveryModel,
  IntegrationHealthRecoverySeverity,
} from "@/lib/integrations/integration-health-recovery-era19";
import { cn } from "@/lib/utils";

function severityBadgeVariant(
  severity: IntegrationHealthRecoverySeverity,
): "default" | "secondary" | "destructive" | "outline" {
  switch (severity) {
    case "urgent":
      return "destructive";
    case "normal":
      return "secondary";
    default:
      return "outline";
  }
}

function severityLabel(severity: IntegrationHealthRecoverySeverity): string {
  switch (severity) {
    case "urgent":
      return "Urgent";
    case "normal":
      return "Next";
    default:
      return "Info";
  }
}

export function IntegrationHealthRecoveryPanel(props: {
  model: IntegrationHealthRecoveryModel;
}) {
  const { model } = props;

  return (
    <section
      id={INTEGRATION_HEALTH_RECOVERY_ANCHOR.slice(1)}
      className="scroll-mt-24 space-y-4"
      data-testid="integration-health-recovery-panel"
    >
      <Card
        className={cn(
          "border-border/80 shadow-sm",
          model.hasUrgentSteps ? "border-amber-200/80 bg-amber-50/10 dark:border-amber-900/40" : "bg-card/90",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListChecks className="h-5 w-5 text-muted-foreground" aria-hidden />
            Integration recovery checklist
          </CardTitle>
          <CardDescription>{model.headline}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {model.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No blocking recovery steps detected from channel cards or smoke artifacts. Use quick
              links below for routine verification.
            </p>
          ) : (
            <ol className="space-y-2" aria-label="Prioritized integration recovery steps">
              {model.steps.map((step, index) => (
                <li
                  key={step.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
                  data-testid={`integration-health-recovery-step-${step.id}`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                        {index + 1}
                      </span>
                      <p className="font-medium">{step.title}</p>
                      <Badge
                        variant={severityBadgeVariant(step.severity)}
                        className="rounded-full text-[10px]"
                      >
                        {severityLabel(step.severity)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {step.category} · {step.source}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant={step.severity === "urgent" ? "default" : "outline"}
                    className="w-full shrink-0 rounded-full sm:w-auto"
                  >
                    <Link href={step.href}>
                      Open
                      <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                </li>
              ))}
            </ol>
          )}

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ClipboardCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Safe operator links only — no risky mutations. Ops vault checklist:{" "}
              <span className="font-mono">{model.opsChecklistDoc}</span>
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-muted/10 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick recovery links</CardTitle>
          <CardDescription>
            Deep links to import center, webhook queue, product mapping, and related workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {model.quickLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              data-testid={`integration-health-recovery-quick-${link.id}`}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/30"
            >
              <div>
                <p className="font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.detail}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
