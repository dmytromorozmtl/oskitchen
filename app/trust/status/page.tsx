import Link from "next/link";

import { PublicShell } from "@/components/marketing/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadExtendedHealthSnapshot } from "@/services/observability/health-check-service";
import { describeQueuePosture } from "@/services/queue/queue-service";

export const metadata = {
  title: "Service status",
  description: "High-level KitchenOS component status for operators (not a formal SLA-backed status page).",
};

const COMPONENTS = [
  { id: "app", label: "Application", note: "Reachability is inferred from deployment target — use /api/health on your host." },
  { id: "db", label: "Database", note: "Postgres via Prisma — see health check." },
  { id: "webhooks", label: "Webhooks", note: "Inline low-volume mode by default; async queue optional." },
  { id: "email", label: "Email", note: "Resend when configured; otherwise outbound is disabled." },
  { id: "storefront", label: "Storefront", note: "Requires published theme + Stripe for card checkout." },
  { id: "pos", label: "POS", note: "First-party terminal — requires network; offline queue not shipped." },
  { id: "integrations", label: "Integrations", note: "Maturity varies by provider — see capability matrix." },
  { id: "jobs", label: "Jobs / imports", note: "Background workers for huge files are partial — see docs." },
] as const;

export default async function TrustStatusPage() {
  const extended = await loadExtendedHealthSnapshot();
  const queue = describeQueuePosture();

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Status</p>
          <h1 className="text-3xl font-semibold tracking-tight">Operational snapshot</h1>
          <p className="text-muted-foreground">
            This page is an honest engineering summary for pilots — not a contractual SLA or third-party status
            product. For automated probes, call{" "}
            <Link className="underline" href="/api/health">
              /api/health
            </Link>{" "}
            on your deployment.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live checks (this deployment)</CardTitle>
            <CardDescription>Values are coarse — no secrets are displayed.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm">
            <Badge variant={extended.database.ok ? "default" : "destructive"}>
              Database: {extended.database.ok ? "reachable" : "degraded"}
            </Badge>
            <Badge variant="secondary">Queue mode: {queue.mode}</Badge>
            <Badge variant="outline">Observability: {extended.observability}</Badge>
            <Badge variant="outline">Sentry (server): {extended.sentryServer}</Badge>
            <Badge variant="outline">Rate limit: {extended.rateLimit.adapter}</Badge>
            {extended.rateLimit.productionMemoryWarning ? (
              <Badge variant="destructive" className="max-w-full whitespace-normal">
                {extended.rateLimit.productionMemoryWarning}
              </Badge>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Components</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {COMPONENTS.map((c) => (
              <li key={c.id}>
                <span className="font-medium text-foreground">{c.label}:</span> {c.note}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          <Link href="/trust" className="underline">
            Back to trust center
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
