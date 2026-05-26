import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getIntegrationById } from "@/lib/integrations/integration-registry";
import {
  getGrubhubCapabilitySnapshot,
  listGrubhubDeliveries,
} from "@/services/integrations/grubhub/grubhub-service";

export default async function GrubhubIntegrationPage() {
  const { userId } = await getTenantActor();
  const integration = getIntegrationById("grubhub");
  const capability = getGrubhubCapabilitySnapshot();
  const deliveries = await listGrubhubDeliveries(userId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PlaceholderBanner
        feature="Grubhub integration"
        detail="KitchenOS keeps Grubhub in placeholder mode. Credentials can be prepared, but live sync and order ingestion are not production-ready."
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Grubhub integration</h1>
          <p className="text-sm text-muted-foreground">
            {integration?.name} · {integration?.status} · honest placeholder
          </p>
        </div>
        <Badge variant={capability.hasCredentials ? "secondary" : "outline"}>
          {capability.hasCredentials ? "Credentials present" : "Credentials missing"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ChecklistItem label="Environment credentials saved" done={capability.hasCredentials} />
          <ChecklistItem label="Live order ingestion implemented" done={capability.liveOrderReady} />
          <ChecklistItem label="Live menu sync implemented" done={capability.liveMenuReady} />
          <p className="pt-2 text-muted-foreground">
            {capability.hasCredentials
              ? "Credentials are visible to the app, but they do not unlock live provider sync yet."
              : "Save GRUBHUB_API_KEY and GRUBHUB_MERCHANT_ID only to prepare the workspace. The provider still stays placeholder-only."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What is intentionally disabled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>KitchenOS does not create new local Grubhub delivery rows just to simulate a live integration.</p>
          <p>This page is preparation-only until the provider implementation is actually shipped and verified.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="text-muted-foreground">
            Historical local rows from earlier scaffolding remain visible for audit only. New live provider records are not
            created from this page until Grubhub support is actually shipped.
          </p>
          {deliveries.length === 0 ? (
            <p className="text-muted-foreground">No historical Grubhub records found.</p>
          ) : (
            deliveries.map((d) => (
              <div key={d.id} className="flex justify-between border-b py-2">
                <span>{d.externalOrderId ?? d.id.slice(0, 8)}</span>
                <span className="text-muted-foreground">{d.status}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
          done ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-border text-muted-foreground"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
