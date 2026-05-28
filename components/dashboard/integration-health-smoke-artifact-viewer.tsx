import Link from "next/link";
import { ArrowRight, FileJson } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ANCHOR,
  INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";
import type {
  IntegrationHealthSmokeArtifactRow,
  IntegrationHealthSmokeDisplayStatus,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import type { IntegrationHealthSmokeArtifactsModel } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import { cn } from "@/lib/utils";

function statusBadgeVariant(
  status: IntegrationHealthSmokeDisplayStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PASSED":
      return "default";
    case "FAILED":
      return "destructive";
    case "SKIPPED WITH REASON":
      return "secondary";
    default:
      return "outline";
  }
}

export function IntegrationHealthSmokeArtifactViewer(props: {
  model: IntegrationHealthSmokeArtifactsModel;
}) {
  const { model } = props;

  return (
    <section
      id={INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ANCHOR.slice(1)}
      className="scroll-mt-24 space-y-4"
      data-testid="integration-health-smoke-artifact-viewer"
    >
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileJson className="h-5 w-5 text-muted-foreground" aria-hidden />
            Engineering smoke artifacts
          </CardTitle>
          <CardDescription>{model.headline}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!model.hasAnyArtifact ? (
            <p className="text-sm text-muted-foreground">
              No smoke summary artifacts found on this host. Run the smoke scripts locally or in CI
              — SKIPPED WITH REASON is honest when credentials are missing.
            </p>
          ) : null}

          {model.rows.map((row) => (
            <SmokeArtifactRowCard key={row.id} row={row} />
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-muted/10 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recovery checklist</CardTitle>
          <CardDescription>
            Safe operator links — no risky mutations. Ops vault checklist:{" "}
            <span className="font-mono text-xs">{INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {model.recoveryLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              data-testid={`integration-health-recovery-${link.id}`}
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

function SmokeArtifactRowCard(props: { row: IntegrationHealthSmokeArtifactRow }) {
  const { row } = props;
  const toneClass =
    row.displayStatus === "FAILED"
      ? "border-rose-200/80 bg-rose-50/20 dark:border-rose-900/40"
      : row.displayStatus === "PASSED"
        ? "border-emerald-200/60 bg-emerald-50/10 dark:border-emerald-900/30"
        : "border-border/70 bg-background/80";

  return (
    <div
      className={cn("rounded-xl border px-3 py-3", toneClass)}
      data-testid={`integration-health-smoke-row-${row.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{row.label}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{row.artifactPath}</p>
          <p className="mt-1 text-xs text-muted-foreground">{row.smokeScript}</p>
        </div>
        <Badge variant={statusBadgeVariant(row.displayStatus)} className="rounded-full">
          {row.displayStatus}
        </Badge>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{row.detail}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{row.honestyNote}</p>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {row.overall ? (
          <Badge variant="outline" className="rounded-full">
            overall {row.overall}
          </Badge>
        ) : null}
        {row.proofStatus ? (
          <Badge variant="outline" className="rounded-full">
            proof {row.proofStatus.replaceAll("_", " ")}
          </Badge>
        ) : null}
        {row.runAt ? (
          <Badge variant="secondary" className="rounded-full">
            {new Date(row.runAt).toLocaleString()}
          </Badge>
        ) : null}
      </div>

      {row.missingEnvVars.length > 0 ? (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          Missing: {row.missingEnvVars.join(", ")}
        </p>
      ) : null}

      {row.nextAction ? (
        <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
          <Link href={row.nextAction.href}>{row.nextAction.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
