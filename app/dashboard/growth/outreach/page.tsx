import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutreachForm } from "@/components/growth/outreach-form";
import { prisma } from "@/lib/prisma";
import { listOutreachCampaigns, seedStarterCampaignIfEmpty } from "@/services/growth/outreach-service";

export default async function GrowthOutreachPage() {
  await seedStarterCampaignIfEmpty();
  const [leads, campaigns] = await Promise.all([
    prisma.betaLead.findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
      select: { id: true, businessName: true, fullName: true, email: true },
    }),
    listOutreachCampaigns(30),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sales assistant</CardTitle>
          <CardDescription>
            Generates outbound copy from stored lead fields. Uses OpenAI when{" "}
            <code className="rounded bg-muted px-1">OPENAI_API_KEY</code> is set — otherwise deterministic templates.
            Never sends mail automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutreachForm
            leads={leads.map((l) => ({
              id: l.id,
              label: `${l.businessName} — ${l.fullName} (${l.email})`,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Track outbound programs, LinkedIn pushes, and nurture sequences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="flex items-start justify-between rounded-lg border border-border/60 px-3 py-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.channel} · {c.audience}
                  </p>
                </div>
                <Badge variant="outline">{c.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
