import Link from "next/link";

import { GrowthLeadsKanban, type LeadCard } from "@/components/growth/growth-leads-kanban";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { groupLeadsByLifecycleLane, listRecentLeads } from "@/services/growth/lead-service";

export default async function GrowthLeadsPage() {
  const leads = await listRecentLeads(400);
  const grouped = groupLeadsByLifecycleLane(leads);
  const serializable: Record<string, LeadCard[]> = {};
  for (const [k, v] of Object.entries(grouped)) {
    serializable[k] = v.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      businessName: r.businessName,
      score: r.score,
      source: r.source,
      utmSource: r.utmSource,
      utmCampaign: r.utmCampaign,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Leads</h2>
          <p className="text-sm text-muted-foreground">
            Founder CRM — lifecycle lanes map from `BetaLead.status` plus optional `lifecycleStage` overrides.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/api/growth/leads/export">Export CSV</Link>
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full" asChild>
            <Link href="/dashboard/growth/demo-requests">Demos</Link>
          </Button>
        </div>
      </div>

      <GrowthLeadsKanban grouped={serializable} />

      <Card>
        <CardHeader>
          <CardTitle>Inbox (table)</CardTitle>
          <CardDescription>{leads.length} rows (max 400) — same data as Kanban, sortable scan.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto text-sm">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2 pr-3">Stage</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Business</th>
                <th className="py-2 pr-3">UTM</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {leads.map((r) => (
                <tr key={r.id} className="border-b border-border/40">
                  <td className="whitespace-nowrap py-2 pr-3 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-3 font-mono">{r.score}</td>
                  <td className="py-2 pr-3 text-xs">{r.lifecycleStage ?? "—"}</td>
                  <td className="py-2 pr-3 text-xs">{r.status}</td>
                  <td className="py-2 pr-3 font-medium">{r.fullName}</td>
                  <td className="py-2 pr-3">{r.email}</td>
                  <td className="py-2 pr-3">{r.businessName}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                    {[r.utmSource, r.utmCampaign].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="py-2 text-right">
                    <Button variant="ghost" size="sm" className="rounded-full" asChild>
                      <Link href={`/dashboard/growth/leads/${r.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
