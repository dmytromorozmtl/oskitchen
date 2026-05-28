import Link from "next/link";
import { ArrowRight, Headphones, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_SUPPORT_ADMIN_ANCHOR,
  type IntegrationHealthSupportAdminModel,
} from "@/lib/integrations/integration-health-support-admin-era19";
import { cn } from "@/lib/utils";

export function IntegrationHealthSupportAdminPanel(props: {
  model: IntegrationHealthSupportAdminModel;
  compact?: boolean;
}) {
  const { model, compact = false } = props;
  if (!model.visible) return null;

  const { tenantContext, smokeSummary } = model;

  return (
    <section
      id={INTEGRATION_HEALTH_SUPPORT_ADMIN_ANCHOR.slice(1)}
      className="scroll-mt-24"
      data-testid="integration-health-support-admin-panel"
    >
      <Card className="border-violet-200/70 bg-violet-50/20 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/15">
        <CardHeader className={cn("pb-3", compact && "py-3")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                {model.mode === "platform" ? (
                  <Shield className="h-5 w-5 text-muted-foreground" aria-hidden />
                ) : (
                  <Headphones className="h-5 w-5 text-muted-foreground" aria-hidden />
                )}
                Support admin triage
              </CardTitle>
              {!compact ? (
                <CardDescription className="mt-1 max-w-2xl">{model.headline}</CardDescription>
              ) : null}
            </div>
            <Badge variant="outline" className="rounded-full capitalize">
              {model.mode} mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={cn("space-y-4", compact && "pt-0")}>
          {compact ? <p className="text-sm text-muted-foreground">{model.headline}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TenantStat
              label="Workspace"
              value={tenantContext.businessName ?? "Unnamed workspace"}
              detail={tenantContext.workspaceId ? `ID ${tenantContext.workspaceId.slice(0, 8)}…` : "No workspace row"}
            />
            <TenantStat
              label="Connections"
              value={`${tenantContext.connectionCount} saved`}
              detail={
                tenantContext.errorConnectionCount > 0
                  ? `${tenantContext.errorConnectionCount} in ERROR`
                  : "No connection errors"
              }
            />
            <TenantStat
              label="Commercial GO/NO-GO"
              value={model.commercialDecisionLabel}
              detail={model.p0ProofStatusLabel ? `P0: ${model.p0ProofStatusLabel}` : "P0 artifact unavailable"}
            />
            <TenantStat
              label="Engineering smoke"
              value={`${smokeSummary.passed} pass · ${smokeSummary.skipped} skip`}
              detail={
                model.p0MissingEnvVarCount > 0
                  ? `${model.p0MissingEnvVarCount} host env var(s) missing`
                  : `${smokeSummary.failed} failed · ${smokeSummary.missing} missing`
              }
            />
          </div>

          {model.triageRows.length > 0 ? (
            <ul className="space-y-2">
              {model.triageRows.map((row) => (
                <li
                  key={row.id}
                  className={cn(
                    "rounded-xl border px-3 py-2.5",
                    row.tone === "urgent"
                      ? "border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15"
                      : "border-border/70 bg-background/80",
                  )}
                  data-testid={`integration-health-support-triage-${row.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{row.label}</p>
                        <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                          {row.category}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{row.detail}</p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full">
                      <Link href={row.href}>
                        Open
                        <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No urgent triage rows for this workspace — review channel cards and smoke artifacts below.
            </p>
          )}

          {model.platformLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {model.platformLinks.map((link) => (
                <Button key={link.id} asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Tenant-scoped view only — no cross-workspace data. Ops checklist:{" "}
            <span className="font-mono">{model.opsChecklistDoc}</span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function TenantStat(props: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {props.label}
      </p>
      <p className="mt-1 text-sm font-medium">{props.value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{props.detail}</p>
    </div>
  );
}
