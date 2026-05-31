import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getIntegrationById } from "@/lib/integrations/integration-registry";
import {
  getDoorDashCapabilitySnapshot,
  listDoorDashDeliveries,
} from "@/services/integrations/doordash/doordash-service";

export default async function DoorDashIntegrationPage() {
  const { userId } = await getTenantActor();
  const integration = getIntegrationById("doordash");
  const capability = getDoorDashCapabilitySnapshot();
  const deliveries = await listDoorDashDeliveries(userId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PlaceholderBanner
        feature="DoorDash integration"
        detail="OS Kitchen keeps DoorDash in placeholder mode. Credentials can be prepared, but live Drive quotes, deliveries, menu sync, and order import are not production-ready."
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">DoorDash integration</h1>
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
          <ChecklistItem label="Live quote flow implemented" done={capability.liveQuoteReady} />
          <ChecklistItem label="Live delivery creation implemented" done={capability.liveDeliveryReady} />
          <ChecklistItem label="Marketplace import / cron ingestion implemented" done={capability.liveImportReady} />
          <p className="pt-2 text-muted-foreground">
            {capability.hasCredentials
              ? "Credentials are visible to the app, but they do not unlock live provider traffic yet."
              : "Save DOORDASH_API_KEY and DOORDASH_MERCHANT_ID only to prepare the workspace. The provider still stays placeholder-only."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What is intentionally disabled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>OS Kitchen does not expose live quote or delivery buttons here while the provider remains placeholder-only.</p>
          <p>It also does not create new local delivery rows just to simulate success.</p>
          <p>When live partner support ships, this page will switch from preparation guidance to real provider-backed actions.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 overflow-x-auto">
          <p className="text-sm text-muted-foreground">
            Historical local rows from earlier scaffolding remain visible for audit only. New live provider records are not
            created from this page until DoorDash support is actually shipped.
          </p>
          {deliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No historical DoorDash records found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-4">{d.createdAt.toLocaleString()}</td>
                    <td className="py-2 pr-4">{d.status}</td>
                    <td className="py-2 pr-4">{d.order?.customerName ?? "—"}</td>
                    <td className="py-2">{d.trackingUrl ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
