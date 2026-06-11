import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listBillingEvents } from "@/services/billing/billing-service";

export default async function HistoryPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const events = await listBillingEvents(dataUserId, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscription history</h1>
        <p className="text-sm text-muted-foreground">Audit trail of billing events (Stripe + admin + user actions).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent events</CardTitle>
          <CardDescription>Most recent first.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No billing events yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {events.map((e) => (
                <li key={e.id} className="rounded border px-2 py-1">
                  <span className="font-mono">{e.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
                  {" · "}
                  <span className="font-medium">{e.eventType}</span>
                  {" · "}
                  <span className="text-muted-foreground">{e.source}</span>
                  {e.summary ? ` · ${e.summary}` : ""}
                  {e.stripeEventId ? <span className="ml-2 text-muted-foreground">(stripe: {e.stripeEventId.slice(0, 14)}…)</span> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
