import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VaultReadinessReport } from "@/lib/ops/vault-readiness-report";
import { VAULT_READINESS_REPORT_ARTIFACT } from "@/lib/ops/vault-readiness-report";

export function VaultReadinessStatusStrip(props: {
  report: VaultReadinessReport;
  artifactPresent: boolean;
}) {
  const { report, artifactPresent } = props;

  return (
    <Card
      className="scroll-mt-24 border-zinc-800 bg-zinc-900/60"
      data-testid="vault-readiness-status-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-white">Ops vault readiness</CardTitle>
        <CardDescription className="text-zinc-400">
          Source:{" "}
          <span className="font-mono text-xs">{VAULT_READINESS_REPORT_ARTIFACT}</span>
          {artifactPresent && report.generatedAt
            ? ` · generated ${new Date(report.generatedAt).toLocaleString()}`
            : " · live recompute (artifact missing or invalid)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-zinc-300">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={report.vaultReady ? "default" : "destructive"}
            className="rounded-full"
          >
            {report.vaultReady ? "vault ready" : "vault not ready"}
          </Badge>
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {report.presentCount}/{report.totalCount} secrets
          </Badge>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            day0: {report.day0Milestone}
          </Badge>
        </div>

        {report.nextPhase ? (
          <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 px-3 py-2">
            <p className="font-medium text-amber-200">Next — {report.nextPhase.label}</p>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              {report.nextPhase.missingKeys.join(", ")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{report.nextPhase.docPath}</p>
          </div>
        ) : null}

        <p className="text-xs text-zinc-500">{report.honestyNote}</p>

        <ul className="list-inside list-disc font-mono text-[10px] text-zinc-500">
          {report.recommendedNextSteps.slice(0, 4).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
