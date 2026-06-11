import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export default async function PublicProposalsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const env = getServerEnv();
  const base = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  const proposals = await prisma.cateringQuote.findMany({
    where: { userId: dataUserId, status: { in: ["SENT", "VIEWED", "READY_TO_SEND", "ACCEPTED", "NEEDS_REVISION"] } },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { _count: { select: { proposalViews: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Public proposals</h1>
        <p className="text-muted-foreground">
          Read-only client links. Internal notes, costs, and margins are never exposed.
        </p>
      </div>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Active proposal links ({proposals.length})</CardTitle>
          <CardDescription>Open the quote to rotate or revoke the link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active proposals yet — send a quote to generate a public link.
            </p>
          ) : null}
          {proposals.map((q) => {
            const revoked = q.publicToken.startsWith("revoked-");
            return (
              <div key={q.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <Link href={`/dashboard/catering-quotes/${q.id}`} className="text-sm font-medium hover:underline">
                    {q.quoteNumber ?? q.id.slice(0, 8)} · {q.customerName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {q.companyName ? `${q.companyName} · ` : ""}
                    {q.eventDate ? format(q.eventDate, "MMM d, yyyy") : "no date"}
                    {` · ${q._count.proposalViews} views`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={revoked ? "destructive" : "outline"} className="rounded-full">
                    {revoked ? "Revoked" : "Active"}
                  </Badge>
                  {!revoked ? (
                    <Link
                      className="text-xs text-muted-foreground hover:underline"
                      href={`${base}/quote/${q.publicToken}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open public link
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
