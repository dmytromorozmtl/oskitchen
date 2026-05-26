import Link from "next/link";
import { redirect } from "next/navigation";

import { PublicShell } from "@/components/marketing/public-page";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { getAccessiblePartnerAccountIds } from "@/lib/partner/partner-permissions";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Partner clients" };

export default async function PartnerClientsPage() {
  const session = await getSessionUser();
  if (!session?.id) {
    redirect("/login?next=/partner/clients");
  }

  const accountIds = await getAccessiblePartnerAccountIds(session.id, session.email ?? null);
  const clients =
    accountIds.length === 0
      ? []
      : await prisma.partnerClient.findMany({
          where: { partnerAccountId: { in: accountIds } },
          include: { partnerAccount: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
          take: 100,
        });

  return (
    <PublicShell>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Partner clients</h1>
        <p className="text-sm text-muted-foreground">
          Scoped to partner accounts you own or are a member of. For the full operations center, open{" "}
          <Link href="/dashboard/partner" className="font-medium text-primary underline-offset-4 hover:underline">
            /dashboard/partner
          </Link>
          .
        </p>
        {clients.map((client) => (
          <Link href={`/partner/clients/${client.id}`} key={client.id}>
            <Card>
              <CardHeader>
                <CardTitle>{client.businessName}</CardTitle>
                <CardDescription>
                  {client.partnerAccount.name} · {client.status}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No partner clients in your accessible accounts yet.</p>
        ) : null}
      </main>
    </PublicShell>
  );
}
