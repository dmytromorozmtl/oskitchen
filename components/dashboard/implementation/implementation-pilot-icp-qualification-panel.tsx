import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Era20PilotIcpQualificationBridgeSlice } from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

function statusBadge(
  qualified: boolean,
  configured: boolean,
): { label: string; variant: "default" | "destructive" | "outline" } {
  if (!configured) {
    return { label: "Env not set", variant: "outline" };
  }
  return qualified
    ? { label: "Qualified", variant: "default" }
    : { label: "Not qualified", variant: "destructive" };
}

export function ImplementationPilotIcpQualificationPanel(props: {
  slice: Era20PilotIcpQualificationBridgeSlice;
}) {
  const { slice } = props;
  const liveBadge = statusBadge(slice.liveQualification.qualified, slice.envConfigured);
  const exampleBadge = statusBadge(slice.exampleQualification.qualified, true);

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="implementation-pilot-icp-qualification"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-muted-foreground" aria-hidden />
              Pilot ICP qualification
            </CardTitle>
            <CardDescription className="mt-1 max-w-2xl">{slice.headline}</CardDescription>
          </div>
          <Badge variant={liveBadge.variant} className="rounded-full tabular-nums">
            Live · {liveBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <QualificationCard
            title="Live prospect (GO/NO-GO)"
            badge={liveBadge}
            result={slice.liveQualification}
            reportLine={slice.liveReportLine}
            detail={
              slice.envConfigured
                ? slice.gonoGoIcpGatePass
                  ? "Re-run npm run smoke:pilot-gono-go after other gates pass."
                  : "Remediate disqualifiers before paid pilot."
                : `Set ${slice.envVarName} from real prospect JSON.`
            }
          />
          <QualificationCard
            title={slice.exampleLabel}
            badge={exampleBadge}
            result={slice.exampleQualification}
            reportLine={slice.exampleReportLine}
            detail={slice.prospectDisclaimer}
            muted
          />
        </div>

        <pre
          className="overflow-x-auto rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground"
          data-testid="pilot-icp-setup-command"
        >
          {slice.setupCommand}
        </pre>

        <p className="text-xs text-muted-foreground">
          Example template: {slice.templatePath} · Real prospect draft:{" "}
          {slice.prospectDraftTemplatePath} — example qualifies ghost kitchen profile only; does not
          replace signed LOI or PILOT_GONOGO_CUSTOMER_NAME.
        </p>
      </CardContent>
    </Card>
  );
}

function QualificationCard(props: {
  title: string;
  badge: { label: string; variant: "default" | "destructive" | "outline" };
  result: Era20PilotIcpQualificationBridgeSlice["liveQualification"];
  reportLine: string;
  detail: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3 text-sm",
        props.muted ? "border-border/50 bg-muted/20" : "border-border/60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{props.title}</p>
        <Badge variant={props.badge.variant} className="rounded-full text-[10px]">
          {props.badge.label}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{props.reportLine}</p>
      {props.result.disqualifiers.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
          {props.result.disqualifiers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {props.result.missingCriteria.length > 0 ? (
        <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
          {props.result.missingCriteria.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">{props.detail}</p>
    </div>
  );
}
