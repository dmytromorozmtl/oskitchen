import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateBqPrivateLinkCompliance,
  isBqPrivateLinkEnabled,
  readBqPrivateLinkAudit,
  requiredCmekKeyArn,
} from "@/lib/compliance/experiment-bq-private-link";

export function BqPrivateLinkCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const audit = readBqPrivateLinkAudit(themeExperimentJson) ?? evaluateBqPrivateLinkCompliance();
  const cmek = requiredCmekKeyArn();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Private Link BQ + CMEK</CardTitle>
        <CardDescription>
          {isBqPrivateLinkEnabled()
            ? "VPC-SC ingest · CMEK on audit S3 · BQ row-level workspace ACL."
            : "Set THEME_EXPERIMENT_BQ_PRIVATE_LINK=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={audit.status === "compliant" ? "text-emerald-700" : "text-amber-700"}>
          Status: {audit.status}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          VPC-SC: {audit.vpcScEnabled ? audit.vpcScPerimeter : "off"} · CMEK: {cmek ? "configured" : "missing"}
        </p>
        <p className="text-xs text-muted-foreground">
          Row-level ACL rows: {audit.rowLevelAclCount} · ingest: {audit.ingestEndpoint ?? "—"}
        </p>
      </CardContent>
    </Card>
  );
}
