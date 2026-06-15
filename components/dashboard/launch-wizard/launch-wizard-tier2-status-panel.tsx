import { CheckCircle2, Circle, AlertTriangle, Route } from "lucide-react";

import { Tier2GoldenPathPhasesPanel } from "@/components/dashboard/tier2-golden-path-phases-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LaunchWizardTier2StatusSlice } from "@/lib/launch-wizard/launch-wizard-tier2-status-era21";
import { cn } from "@/lib/utils";

export function LaunchWizardTier2StatusPanel(props: { slice: LaunchWizardTier2StatusSlice }) {
  const { slice } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="launch-wizard-tier2-status-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Route className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          Tier 2 golden path (staging)
        </CardTitle>
        <CardDescription className="max-w-3xl">{slice.headline}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {slice.tier2ProofStatus ? (
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              tier2: {slice.tier2ProofStatus}
            </Badge>
          ) : null}
          {slice.overall ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              overall: {slice.overall}
            </Badge>
          ) : null}
          {slice.blockedOnP0 ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              blocked on P0
            </Badge>
          ) : null}
          {!slice.blockedOnP0 && !slice.tier2IntegrityPassed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              integrity FAIL
            </Badge>
          ) : null}
        </div>

        <ul className="space-y-2">
          {slice.rows.map((row) => (
            <li
              key={row.id}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                row.status === "PASSED" && "border-emerald-200/60 bg-emerald-50/10",
                row.status === "FAILED" && "border-destructive/30 bg-destructive/5",
                row.status === "BLOCKED" && "border-amber-200/70 bg-amber-50/10",
              )}
            >
              {row.status === "PASSED" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              ) : row.status === "FAILED" ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div>
                <p className="font-medium">{row.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 font-mono text-xs text-muted-foreground">
          <p>{slice.orchestratorCommand}</p>
          <p className="mt-1">{slice.integrityValidateCommand}</p>
          <p className="mt-1">npm run ops:validate-tier2-golden-path-env</p>
          <p className="mt-1">{slice.syncIntegrityBaselineCommand}</p>
          <p className="mt-1">Playbook: {slice.playbookDoc}</p>
        </div>

        {slice.goldenPathUi ? (
          <Tier2GoldenPathPhasesPanel slice={slice.goldenPathUi} variant="dashboard" />
        ) : null}
      </CardContent>
    </Card>
  );
}
