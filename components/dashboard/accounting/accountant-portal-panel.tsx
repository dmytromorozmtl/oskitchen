import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_BADGE_ROW_CLASS,
  DESIGN_POLISH_CARD_CLASS,
  DESIGN_POLISH_HERO_BANNER_CLASS,
  DESIGN_POLISH_ROW_SURFACE_CLASS,
  DESIGN_POLISH_STRIPE_OK_CLASS,
} from "@/lib/design/absolute-final-design-polish-tokens";
import {
  ACCOUNTANT_PORTAL_PILLARS,
  ACCOUNTANT_PORTAL_ROUTE,
  type AccountantPortalDeliverable,
  type AccountantPortalModel,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";
import { ACCOUNTANT_PORTAL_ONBOARDING } from "@/lib/accounting/accountant-portal-content";
import { cn } from "@/lib/utils";

function pillarLabel(pillar: (typeof ACCOUNTANT_PORTAL_PILLARS)[number]) {
  switch (pillar) {
    case "export_package_hub":
      return "Export hub";
    case "coa_and_journal_readiness":
      return "COA & journals";
    case "reconciliation_status":
      return "Reconciliation";
    case "quickbooks_handoff":
      return "QuickBooks";
    case "read_only_accountant_posture":
      return "Read-only";
    default:
      return pillar;
  }
}

function maturityBadge(maturity: AccountantPortalDeliverable["maturity"]) {
  if (maturity === "LIVE") {
    return (
      <Badge className="rounded-full text-[10px] font-normal">LIVE</Badge>
    );
  }
  if (maturity === "BETA") {
    return (
      <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
        BETA
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-[10px] font-normal">
      SKIPPED
    </Badge>
  );
}

export function AccountantPortalPanel({ model }: { model: AccountantPortalModel }) {
  const { deliverables, summary, period, periodLabel } = model;

  const byPillar = ACCOUNTANT_PORTAL_PILLARS.map((pillar) => ({
    pillar,
    items: deliverables.filter((d) => d.pillar === pillar),
  }));

  return (
    <div className="space-y-6" data-testid="accountant-portal-panel">
      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">
          {ACCOUNTANT_PORTAL_ONBOARDING.title} · BETA
        </p>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/90">
          {ACCOUNTANT_PORTAL_ONBOARDING.subtitle} read-only navigation and export downloads —
          not a certified GL or multi-tenant CPA login. Do not claim audit-grade handoff.
        </p>
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        <Badge variant="outline" className="rounded-full tabular-nums">
          {summary.liveCount} LIVE · {summary.betaCount} BETA
        </Badge>
        <Badge variant="secondary" className="rounded-full tabular-nums">
          {summary.coaCoveragePercent}% COA mapped
        </Badge>
        <Badge variant="outline" className="rounded-full tabular-nums">
          {summary.reconciliationPercent}% reconciled
        </Badge>
        {summary.periodCloseReady ? (
          <Badge className="rounded-full">
            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />
            Period-close ready
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">
            Period-close review needed
          </Badge>
        )}
      </div>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg">Period-close checklist</CardTitle>
          <CardDescription className="dark:text-muted-foreground/90">
            {periodLabel} — accountant review before posting
          </CardDescription>
        </CardHeader>
        <CardContent className={DESIGN_POLISH_ROW_SURFACE_CLASS}>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
            {ACCOUNTANT_PORTAL_ONBOARDING.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {byPillar.map(({ pillar, items }) => (
          <Card
            key={pillar}
            className={DESIGN_POLISH_CARD_CLASS}
            data-testid="accountant-portal-pillar"
          >
            <CardHeader className="pb-2">
              <Briefcase className={`h-4 w-4 ${DESIGN_POLISH_STRIPE_OK_CLASS}`} aria-hidden />
              <CardTitle className="text-sm">{pillarLabel(pillar)}</CardTitle>
              <CardDescription className="text-xs dark:text-muted-foreground/90">
                {items.length} deliverable(s)
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg">Finance deliverables</CardTitle>
          <CardDescription className="dark:text-muted-foreground/90">
            Export package hub — COA mapping, journals, reconciliation, QuickBooks handoff
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {deliverables.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-border/50",
                DESIGN_POLISH_ROW_SURFACE_CLASS,
              )}
              data-testid="accountant-portal-deliverable"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.label}</p>
                  {maturityBadge(item.maturity)}
                  <Badge variant="outline" className="rounded-full text-[10px] font-normal">
                    {item.statusLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">
                  {pillarLabel(item.pillar)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href={item.route}>
                    Open
                    <ExternalLink
                      className={`ml-1 h-3 w-3 ${DESIGN_POLISH_STRIPE_OK_CLASS}`}
                      aria-hidden
                    />
                  </Link>
                </Button>
                {item.exportRoute && summary.canExport ? (
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <a href={`${item.exportRoute}?period=${period}`} download>
                      <Download
                        className={`mr-1 h-3.5 w-3.5 ${DESIGN_POLISH_STRIPE_OK_CLASS}`}
                        aria-hidden
                      />
                      Export
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {summary.canExport ? (
        <Card className={cn("border-primary/20 bg-primary/5 dark:bg-primary/10", DESIGN_POLISH_CARD_CLASS)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className={`h-5 w-5 ${DESIGN_POLISH_STRIPE_OK_CLASS}`} aria-hidden />
              <CardTitle className="text-lg">Quick export bundle</CardTitle>
            </div>
            <CardDescription className="dark:text-muted-foreground/90">
              Download journal + reconciliation for {periodLabel.toLowerCase()} period
            </CardDescription>
          </CardHeader>
          <CardContent className={`flex flex-wrap gap-2 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={`/api/export/gl-journal?period=${period}`} download>
                Journal CSV
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={`/api/export/gl-journal/json?period=${period}`} download>
                Journal JSON
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={`/api/export/pnl-reconciliation?period=${period}`} download>
                Reconciliation CSV
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">
        Policy: accountant-portal-absolute-final-v1 · Route: {ACCOUNTANT_PORTAL_ROUTE}
      </p>
      <p className="sr-only">{DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}</p>
    </div>
  );
}
