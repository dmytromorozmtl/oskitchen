import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { canAccessOwnerOnlySurfaces } from "@/lib/platform-admin";
import { getFounderKpis } from "@/lib/kpi";

export default async function FounderDashboardPage() {
  const user = await requireUserProfile();
  const allowed = await canAccessOwnerOnlySurfaces(user.id, user.email, user.role);
  if (!allowed) {
    return <div className="mx-auto max-w-3xl p-8">Owner or platform access required.</div>;
  }
  const kpis = await getFounderKpis();
  const cards = [
    ["Total signups", kpis.totalSignups],
    ["Beta leads", kpis.betaLeads],
    ["Demo requests", kpis.demoRequests],
    ["Activated accounts", kpis.activatedAccounts],
    ["Trial users", kpis.trialUsers],
    ["Paid users", kpis.paidUsers],
    ["MRR", kpis.mrrPlaceholder],
    ["Churn", kpis.churnPlaceholder],
    ["Feedback", kpis.feedbackCount],
    ["Support tickets", kpis.supportTickets],
    ["Partner leads", kpis.partnerLeads],
    ["Sales inquiries", kpis.salesInquiries],
    ["Active workspaces", kpis.activeWorkspaces],
    ["Orders processed", kpis.ordersProcessed],
  ] as const;
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Founder KPIs</h1>
        <p className="mt-2 text-muted-foreground">Internal dashboard. Paid metrics are placeholders unless backed by Stripe live data.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{value}</CardTitle>
              <CardDescription>{label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
