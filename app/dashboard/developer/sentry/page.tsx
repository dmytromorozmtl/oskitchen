import { SentryProductionPanel } from "@/components/developer/sentry-production-panel";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { loadSentryProductionDashboard } from "@/services/observability/sentry-production-service";

export default async function DeveloperSentryPage() {
  await requireDeveloperCenterAccess();
  const dashboard = await loadSentryProductionDashboard();

  return (
    <div className="space-y-8" id="top">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sentry production</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Error tracking activation for Vercel Production — SDK wiring is in-repo; DSN is an ops
          secret pushed via npm run sentry:production:activate.
        </p>
      </div>

      <SentryProductionPanel dashboard={dashboard} />
    </div>
  );
}
