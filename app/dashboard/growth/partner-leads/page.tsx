import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PartnerLeadsPage() {
  const user = await requireUserProfile();
  if (user.role !== "OWNER") return <div className="p-8">Owner access required.</div>;
  const leads = await prisma.partnerLead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Partner leads</h1>
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{lead.companyName ?? lead.fullName}</CardTitle>
              <Badge>{lead.status}</Badge>
            </div>
            <CardDescription>{lead.email} · {lead.clientType ?? "client type TBD"} · {lead.createdAt.toLocaleString()}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
