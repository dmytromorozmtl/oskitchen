import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getUberDirectCapabilitySnapshot } from "@/services/delivery/uber-direct";

export default async function UberDirectPlaceholderPage() {
  const { userId } = await getTenantActor();
  const capability = getUberDirectCapabilitySnapshot();

  const recentDispatches = await prisma.deliveryDispatch.findMany({
    where: { userId, provider: "UBER_DIRECT" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      status: true,
      externalDeliveryId: true,
      quoteId: true,
      fee: true,
      currency: true,
      trackingUrl: true,
      createdAt: true,
    },
  });

  const hasCredentials = capability.hasClientCredentials;

  return (
    <div className="space-y-8">
      <PlaceholderBanner
        feature="Uber Direct dispatch"
        detail="KitchenOS records placeholder dispatch events for workflow rehearsal. Live Uber Direct courier APIs are not production-ready — see Integration Health and capability matrix."
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Uber Direct dispatch (placeholder)</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            KitchenOS does not call Uber APIs from this screen. Quote and dispatch buttons record placeholder events for the
            audit trail so you can rehearse the workflow before real partner credentials are wired.
          </p>
        </div>
        <Badge variant={hasCredentials ? "secondary" : "outline"}>
          {hasCredentials ? "Credentials present" : "No credentials configured"}
        </Badge>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Setup checklist</CardTitle>
          <CardDescription>You need partner access from Uber before enabling live dispatch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ChecklistItem label="Partner access approved (Uber Direct portal)" done={hasCredentials} />
          <ChecklistItem
            label="Credentials in environment: UBER_DIRECT_CLIENT_ID / UBER_DIRECT_CLIENT_SECRET"
            done={hasCredentials}
          />
          <ChecklistItem label="Webhook signing secret configured" done={capability.hasWebhookSecret} />
          <ChecklistItem label="Live quote / create dispatch implementation" done={capability.liveQuoteCreateReady} />
          <ChecklistItem label="Delivery status webhook handler implementation" done={capability.liveWebhookReady} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Uber Direct dispatches</CardTitle>
          <CardDescription>From order-driven flows elsewhere in the app, if any.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {recentDispatches.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No Uber Direct dispatches recorded yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">External ID</th>
                  <th className="px-4 py-3 font-medium">Quote</th>
                  <th className="px-4 py-3 font-medium">Fee</th>
                  <th className="px-4 py-3 font-medium">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {recentDispatches.map((d) => (
                  <tr key={d.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{d.createdAt.toISOString().slice(0, 16)}</td>
                    <td className="px-4 py-3">{d.status}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.externalDeliveryId ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.quoteId ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.fee != null ? `${d.fee.toString()} ${d.currency ?? ""}`.trim() : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.trackingUrl ? (
                        <a href={d.trackingUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
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
