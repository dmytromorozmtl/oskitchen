import { notFound, redirect } from "next/navigation";

import { PublicShell } from "@/components/marketing/public-page";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { getAccessiblePartnerAccountIds } from "@/lib/partner/partner-permissions";
import { prisma } from "@/lib/prisma";

export default async function PartnerClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const client = await prisma.partnerClient.findUnique({
    where: { id },
    include: { partnerAccount: true, commissions: true, referrals: true },
  });
  if (!client) notFound();

  const accountIds = await getAccessiblePartnerAccountIds(session.id, session.email ?? null);
  if (!accountIds.includes(client.partnerAccountId)) {
    notFound();
  }

  return (
    <PublicShell>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{client.businessName}</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{client.status}</CardTitle>
              <CardDescription>Implementation status</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{client.referrals.length}</CardTitle>
              <CardDescription>Referrals</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{client.commissions.length}</CardTitle>
              <CardDescription>Commission placeholders</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </PublicShell>
  );
}
