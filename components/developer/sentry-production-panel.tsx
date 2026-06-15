import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SentryProductionDashboard } from "@/services/observability/sentry-production-service";

type Props = {
  dashboard: SentryProductionDashboard;
};

function statusBadge(ok: boolean, okLabel: string, badLabel: string) {
  return (
    <Badge variant={ok ? "secondary" : "destructive"} className="shrink-0">
      {ok ? okLabel : badLabel}
    </Badge>
  );
}

export function SentryProductionPanel({ dashboard }: Props) {
  const live = dashboard.sentryServer === "live";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="text-base">Server SDK</CardTitle>
              <CardDescription>
                Initialized via instrumentation.ts when SENTRY_DSN is set.
              </CardDescription>
            </div>
            {statusBadge(
              live,
              "Live",
              dashboard.sentryServer === "not_configured" ? "Not configured" : "DSN uninitialized",
            )}
          </CardHeader>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="text-base">Static wiring</CardTitle>
              <CardDescription>
                instrumentation, sentry.*.config, health route, captureErrorSafe.
              </CardDescription>
            </div>
            {statusBadge(dashboard.wiringOk, "Complete", "Gaps found")}
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Production activation</CardTitle>
          <CardDescription>
            Policy {dashboard.policyId} — never exposes DSN values in the UI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Observability backend
              </p>
              <p className="font-mono text-sm">{dashboard.observabilityBackend}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Proof status
              </p>
              <p className="font-mono text-sm">{dashboard.proofStatus}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Required env vars
            </p>
            <ul className="space-y-1 font-mono text-xs">
              {dashboard.requiredEnvVars.map((key) => (
                <li key={key}>
                  {dashboard.missingEnvVars.includes(key) ? "○" : "●"} {key}
                </li>
              ))}
            </ul>
          </div>

          {dashboard.wiringFailures.length > 0 ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {dashboard.wiringFailures.map((failure) => (
                <p key={failure}>{failure}</p>
              ))}
            </div>
          ) : null}

          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Operator commands</p>
            <p className="mt-2 font-mono">npm run sentry:production:activate</p>
            <p className="mt-1 font-mono">
              SENTRY_DSN=https://... npm run sentry:production:activate -- --apply --deploy
              --mirror-public-dsn
            </p>
            <p className="mt-1 font-mono">npm run smoke:sentry-production</p>
            <p className="mt-3">
              Docs: <span className="font-mono">{dashboard.opsDoc}</span>
            </p>
            <p className="mt-1">
              Artifact: <span className="font-mono">{dashboard.artifactPath}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
